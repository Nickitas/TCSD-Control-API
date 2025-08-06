import { Injectable } from '@nestjs/common';
import { ConfigService as NestJsConfigService } from '@nestjs/config';
import { FbDbConfig } from '@/fb-database/types/config.interface';

@Injectable()
export class ConfigService {
  readonly dbMap: Array<FbDbConfig>;

  constructor(private readonly nestJsConfigService: NestJsConfigService) {
    this.dbMap = [
      {
        host: this.nestJsConfigService.getOrThrow('DB_MAIN_HOST'),
        port: this.nestJsConfigService.getOrThrow('DB_MAIN_PORT'),
        database: this.nestJsConfigService.getOrThrow('DB_MAIN_DATABASE'),
        user: this.nestJsConfigService.getOrThrow('DB_MAIN_USER'),
        password: this.nestJsConfigService.getOrThrow('DB_MAIN_PASSWORD'),
        lowercase_keys: this.nestJsConfigService.getOrThrow(
          'DB_MAIN_LOWERCASE_KEYS',
        ),
      },
      {
        host: this.nestJsConfigService.getOrThrow('DB_DORM4_HOST'),
        port: this.nestJsConfigService.getOrThrow('DB_DORM4_PORT'),
        database: this.nestJsConfigService.getOrThrow('DB_DORM4_DATABASE'),
        user: this.nestJsConfigService.getOrThrow('DB_DORM4_USER'),
        password: this.nestJsConfigService.getOrThrow('DB_DORM4_PASSWORD'),
        lowercase_keys: this.nestJsConfigService.getOrThrow(
          'DB_DORM4_LOWERCASE_KEYS',
        ),
      },
    ];
  }

  getDbMap(): Array<FbDbConfig> {
    return this.dbMap;
  }
}
