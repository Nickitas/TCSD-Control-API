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
        host: this.nestJsConfigService.getOrThrow('DB_DORM2_HOST'),
        port: this.nestJsConfigService.getOrThrow('DB_DORM2_PORT'),
        database: this.nestJsConfigService.getOrThrow('DB_DORM2_DATABASE'),
        user: this.nestJsConfigService.getOrThrow('DB_DORM2_USER'),
        password: this.nestJsConfigService.getOrThrow('DB_DORM2_PASSWORD'),
        lowercase_keys: this.nestJsConfigService.getOrThrow(
          'DB_DORM2_LOWERCASE_KEYS',
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
      {
        host: this.nestJsConfigService.getOrThrow('DB_DORM5_HOST'),
        port: this.nestJsConfigService.getOrThrow('DB_DORM5_PORT'),
        database: this.nestJsConfigService.getOrThrow('DB_DORM5_DATABASE'),
        user: this.nestJsConfigService.getOrThrow('DB_DORM5_USER'),
        password: this.nestJsConfigService.getOrThrow('DB_DORM5_PASSWORD'),
        lowercase_keys: this.nestJsConfigService.getOrThrow(
          'DB_DORM5_LOWERCASE_KEYS',
        ),
      },
      // {
      //   host: this.nestJsConfigService.getOrThrow('DB_DORM7_HOST'),
      //   port: this.nestJsConfigService.getOrThrow('DB_DORM7_PORT'),
      //   database: this.nestJsConfigService.getOrThrow('DB_DORM7_DATABASE'),
      //   user: this.nestJsConfigService.getOrThrow('DB_DORM7_USER'),
      //   password: this.nestJsConfigService.getOrThrow('DB_DORM7_PASSWORD'),
      //   lowercase_keys: this.nestJsConfigService.getOrThrow(
      //     'DB_DORM7_LOWERCASE_KEYS',
      //   ),
      // },
      {
        host: this.nestJsConfigService.getOrThrow('DB_DORM9_HOST'),
        port: this.nestJsConfigService.getOrThrow('DB_DORM9_PORT'),
        database: this.nestJsConfigService.getOrThrow('DB_DORM9_DATABASE'),
        user: this.nestJsConfigService.getOrThrow('DB_DORM9_USER'),
        password: this.nestJsConfigService.getOrThrow('DB_DORM9_PASSWORD'),
        lowercase_keys: this.nestJsConfigService.getOrThrow(
          'DB_DORM9_LOWERCASE_KEYS',
        ),
      },
      {
        host: this.nestJsConfigService.getOrThrow('DB_DORM10_HOST'),
        port: this.nestJsConfigService.getOrThrow('DB_DORM10_PORT'),
        database: this.nestJsConfigService.getOrThrow('DB_DORM10_DATABASE'),
        user: this.nestJsConfigService.getOrThrow('DB_DORM10_USER'),
        password: this.nestJsConfigService.getOrThrow('DB_DORM10_PASSWORD'),
        lowercase_keys: this.nestJsConfigService.getOrThrow(
          'DB_DORM10_LOWERCASE_KEYS',
        ),
      },
    ];
  }

  getDbMap(): Array<FbDbConfig> {
    return this.dbMap;
  }
}
