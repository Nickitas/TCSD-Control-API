import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Firebird from 'node-firebird';
import { ConfigService } from 'src/config/config.service';
import { FirebirdDB } from './classes/firebird-db.class';
import { FbDbConfig } from './types/config.interface';

@Injectable()
export class FbDatabaseService implements OnModuleInit {
  private readonly logger = new Logger(FbDatabaseService.name);
  private readonly CONNECTION_TIMEOUT = 10000;
  private readonly MAX_RETRIES = 2;
  private dbMap: FbDbConfig[];
  private connections: Map<string, Firebird.Database> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.dbMap = this.configService.getDbMap();
  }

  async onModuleInit() {
    await this.initializeConnections();
  }

  private async initializeConnections(): Promise<void> {
    for (const dbConfig of this.dbMap) {
      let retries = 0;
      let connected = false;

      while (retries <= this.MAX_RETRIES && !connected) {
        try {
          this.logger.log(
            `Connecting to database: ${dbConfig.database} (attempt ${retries + 1})`,
          );

          const connection = await this.createConnection(dbConfig);
          this.connections.set(dbConfig.database, connection);
          connected = true;

          this.logger.log(`Successfully connected to: ${dbConfig.database}`);
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

          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        }
      }
    }
  }

  private async createConnection(dbConfig: FbDbConfig): Promise<Firebird.Database> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Connection timeout for ${dbConfig.database}`));
      }, this.CONNECTION_TIMEOUT);

      const db = new FirebirdDB(dbConfig);

      db.connection((connection, err) => {
        clearTimeout(timeoutId);

        if (err) {
          reject(new Error(`Connection failed for ${dbConfig.database}: ${err.message}`));
          return;
        }

        resolve(connection);
      });
    });
  }

  async withConnection<T>(
    callback: (db: Firebird.Database, dbConfig: FbDbConfig) => Promise<T>,
  ): Promise<T[]> {
    const results: T[] = [];

    for (const [databaseName, connection] of this.connections.entries()) {
      try {
        const dbConfig = this.dbMap.find(config => config.database === databaseName);
        if (!dbConfig) continue;

        const result = await callback(connection, dbConfig);
        results.push(result);
      } catch (error) {
        this.logger.error(
          `Failed to execute callback on ${databaseName}:`,
          error.message,
        );
      }
    }

    return results;
  }

  /** Альтернативный метод: возвращает первый успешный результат из любой базы */
  async withConnectionFirstSuccess<T>(
    callback: (db: Firebird.Database, dbConfig: FbDbConfig) => Promise<T>,
  ): Promise<T | null> {
    for (const [databaseName, connection] of this.connections.entries()) {
      try {
        const dbConfig = this.dbMap.find(config => config.database === databaseName);
        if (!dbConfig) continue;

        const result = await callback(connection, dbConfig);
        this.logger.log(`Success from database: ${databaseName}`);
        return result;
      } catch (error) {
        this.logger.warn(
          `Failed to execute on ${databaseName}: ${error.message}`,
        );
      }
    }

    this.logger.error('All database operations failed');
    return null;
  }

  async onModuleDestroy() {
    await this.closeAllConnections();
  }

  private async closeAllConnections(): Promise<void> {
    for (const [databaseName, connection] of this.connections.entries()) {
      try {
        connection.detach((detachErr) => {
          if (detachErr) {
            this.logger.warn(
              `Error detaching from ${databaseName}: ${detachErr.message}`,
            );
          } else {
            this.logger.log(`Successfully detached from ${databaseName}`);
          }
        });
      } catch (detachError) {
        this.logger.warn(
          `Exception during detach from ${databaseName}: ${detachError.message}`,
        );
      }
    }
    this.connections.clear();
  }

  getConnection(databaseName: string): Firebird.Database | undefined {
    return this.connections.get(databaseName);
  }

  getAllConnections(): Map<string, Firebird.Database> {
    return new Map(this.connections);
  }
}