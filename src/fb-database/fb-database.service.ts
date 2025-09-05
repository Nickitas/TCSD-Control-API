import { Injectable, Logger } from '@nestjs/common';
import * as Firebird from 'node-firebird';
import { ConfigService } from 'src/config/config.service';
import { FirebirdDB } from './classes/firebird-db.class';
import { FbDbConfig } from './types/config.interface';

@Injectable()
export class FbDatabaseService {
  private readonly logger = new Logger(FbDatabaseService.name);
  private readonly CONNECTION_TIMEOUT = 10000;
  private readonly MAX_RETRIES = 2;

  constructor(private readonly configService: ConfigService) { }

  async withConnection<T>(
    callback: (db: Firebird.Database) => Promise<T>,
  ): Promise<T[]> {
    const dbMap: FbDbConfig[] = this.configService.getDbMap();
    const results: T[] = [];

    for (const dbConfig of dbMap) {
      let retries = 0;
      let connected = false;

      while (retries <= this.MAX_RETRIES && !connected) {
        try {
          this.logger.log(`Connecting to database: ${dbConfig.host} (attempt ${retries + 1})`);

          const result = await this.connectWithTimeout(dbConfig, callback);
          results.push(result);
          connected = true;

        } catch (error) {
          retries++;

          if (retries > this.MAX_RETRIES) {
            this.logger.error(
              `Failed to connect to ${dbConfig.database} after ${this.MAX_RETRIES} attempts:`,
              error.message,
            );
            break;
          }

          this.logger.warn(
            `Retry ${retries}/${this.MAX_RETRIES} for ${dbConfig.database}`,
          );

          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }

    return results;
  }

  private async connectWithTimeout<T>(
    dbConfig: FbDbConfig,
    callback: (db: Firebird.Database) => Promise<T>,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Connection timeout for ${dbConfig.database}`));
      }, this.CONNECTION_TIMEOUT);

      const db = new FirebirdDB(dbConfig);

      db.connection(async (connection, err) => {
        clearTimeout(timeoutId);

        if (err) {
          reject(new Error(`Connection failed for ${dbConfig.database}: ${err.message}`));
          return;
        }

        try {
          const result = await callback(connection);
          resolve(result);
        } catch (callbackError) {
          reject(callbackError);
        } finally {
          this.safeDetach(connection, dbConfig.database);
        }
      });
    });
  }

  private safeDetach(connection: Firebird.Database, databaseName: string): void {
    try {
      connection.detach((detachErr) => {
        if (detachErr) {
          this.logger.warn(`Error detaching from ${databaseName}: ${detachErr.message}`);
        }
      });
    } catch (detachError) {
      this.logger.warn(`Exception during detach from ${databaseName}: ${detachError.message}`);
    }
  }

  /** Альтернативный метод: возвращает первый успешный результат из любой базы */
  async withConnectionFirstSuccess<T>(
    callback: (db: Firebird.Database) => Promise<T>,
  ): Promise<T | null> {
    const dbMap: FbDbConfig[] = this.configService.getDbMap();

    for (const dbConfig of dbMap) {
      try {
        const result = await this.connectWithTimeout(dbConfig, callback);
        this.logger.log(`Success from database: ${dbConfig.database}`);
        return result;
      } catch (error) {
        this.logger.warn(`Failed to execute on ${dbConfig.database}: ${error.message}`);
      }
    }

    this.logger.error('All database connections failed');
    return null;
  }
}