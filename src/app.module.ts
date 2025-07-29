import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QrModule } from './qr/qr.module';
import { ConnectionModule } from './connection/connection.module';
import { ConfigModule } from './config/config.module';
import {ConfigModule as NestJsConfigModule} from '@nestjs/config';

@Module({
  imports: [QrModule, ConnectionModule, ConfigModule, NestJsConfigModule.forRoot({
    isGlobal: true
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
