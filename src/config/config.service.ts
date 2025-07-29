import { Injectable } from '@nestjs/common';
import { ConfigService as NestJsConfigService } from '@nestjs/config';
import { DBConfig } from 'src/shared/types/db-config.interface';


@Injectable()
export class ConfigService {

    readonly dbMap: Array<DBConfig>;

    constructor(private readonly nestJsConfigService: NestJsConfigService) {

        this.dbMap = [
            {
                host: this.nestJsConfigService.getOrThrow('DB_MAIN_HOST'),
                port: this.nestJsConfigService.getOrThrow('DB_MAIN_PORT'),
                database: this.nestJsConfigService.getOrThrow('DB_MAIN_DATABASE'),
                user: this.nestJsConfigService.getOrThrow('DB_MAIN_USER'),
                password: this.nestJsConfigService.getOrThrow('DB_MAIN_PASSWORD'),
                lowercase_keys: this.nestJsConfigService.getOrThrow('DB_MAIN_LOWERCASE_KEYS'),
            },
            {
                host: this.nestJsConfigService.getOrThrow('DB_DORM1_HOST'),
                port: this.nestJsConfigService.getOrThrow('DB_DORM1_PORT'),
                database: this.nestJsConfigService.getOrThrow('DB_DORM1_DATABASE'),
                user: this.nestJsConfigService.getOrThrow('DB_DORM1_USER'),
                password: this.nestJsConfigService.getOrThrow('DB_DORM1_PASSWORD'),
                lowercase_keys: this.nestJsConfigService.getOrThrow('DB_DORM1_LOWERCASE_KEYS'),
            },
            {
                host: this.nestJsConfigService.getOrThrow('DB_DORM2_HOST'),
                port: this.nestJsConfigService.getOrThrow('DB_DORM2_PORT'),
                database: this.nestJsConfigService.getOrThrow('DB_DORM2_DATABASE'),
                user: this.nestJsConfigService.getOrThrow('DB_DORM2_USER'),
                password: this.nestJsConfigService.getOrThrow('DB_DORM2_PASSWORD'),
                lowercase_keys: this.nestJsConfigService.getOrThrow('DB_DORM2_LOWERCASE_KEYS'),
            },
        ]

    }

    getDbMap(): Array<DBConfig> {
        return this.dbMap;
    }
}
