import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestJsConfigService } from '@nestjs/config';
import { FbDbConfig } from '@/fb-database/types/config.interface';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  readonly dbMap: Array<FbDbConfig>;

  constructor(private readonly nestJsConfigService: NestJsConfigService) {
    this.dbMap = this.initializeDbMap();
  }

  private initializeDbMap(): FbDbConfig[] {
    const dbConfigs = [
      { prefix: 'DB_MAIN', name: 'Main Database' },
      { prefix: 'DB_DORM2', name: 'Dormitory 2' },
      { prefix: 'DB_DORM4', name: 'Dormitory 4' },
      { prefix: 'DB_DORM5', name: 'Dormitory 5' },
      { prefix: 'DB_DORM7', name: 'Dormitory 7' },
      { prefix: 'DB_DORM9', name: 'Dormitory 9' },
      { prefix: 'DB_DORM10', name: 'Dormitory 10' },
    ];

    const validConfigs: FbDbConfig[] = [];

    for (const config of dbConfigs) {
      try {
        const dbConfig: FbDbConfig = {
          host: this.nestJsConfigService.getOrThrow(`${config.prefix}_HOST`),
          port: this.nestJsConfigService.getOrThrow(`${config.prefix}_PORT`),
          database: this.nestJsConfigService.getOrThrow(`${config.prefix}_DATABASE`),
          user: this.nestJsConfigService.getOrThrow(`${config.prefix}_USER`),
          password: this.nestJsConfigService.getOrThrow(`${config.prefix}_PASSWORD`),
          lowercase_keys: this.nestJsConfigService.get(`${config.prefix}_LOWERCASE_KEYS`, false),
        };

        validConfigs.push(dbConfig);
        this.logger.debug(`Configured database: ${config.name}`);

      } catch (error) {
        this.logger.warn(`Skipping ${config.name}: configuration incomplete`);
      }
    }

    if (validConfigs.length === 0) {
      throw new Error('No valid database configurations found');
    }

    return validConfigs;
  }

  getDbMap(): Array<FbDbConfig> {
    return this.dbMap;
  }

  getActiveDatabases(): string[] {
    return this.dbMap.map(db => db.database);
  }
}