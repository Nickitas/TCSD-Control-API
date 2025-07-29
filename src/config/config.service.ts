import { Injectable } from '@nestjs/common';
import { ConfigService as NestJsConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
    readonly host: string;
    readonly port: number;
    readonly database: string;
    readonly user: string;
    readonly password: string;
    readonly lowercase_keys: boolean;

    constructor (private readonly nestJsConfigService: NestJsConfigService) {
        this.host = this.nestJsConfigService.getOrThrow<string>('DB_HOST');
        this.port = +this.nestJsConfigService.getOrThrow<number>('DB_PORT');
        this.database = this.nestJsConfigService.getOrThrow<string>('DB_DATABASE');
        this.user = this.nestJsConfigService.getOrThrow<string>('DB_USER');
        this.password = this.nestJsConfigService.getOrThrow<string>('DB_PASSWORD');
        this.lowercase_keys = this.nestJsConfigService.getOrThrow<boolean>('DB_LOWERCASE_KEYS', { infer: true });
    }
}
