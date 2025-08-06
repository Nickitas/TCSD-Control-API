import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { QrModule } from './qr/qr.module';
import { DatabaseModule } from './fb-database/fb-database.module';
import { ConfigModule } from './config/config.module';
import { ConfigModule as NestJsConfigModule } from '@nestjs/config';

@Module({
  imports: [
    QrModule,
    DatabaseModule,
    ConfigModule,
    ScheduleModule.forRoot(),
    NestJsConfigModule.forRoot({
      isGlobal: true
    })],
})
export class AppModule { }
