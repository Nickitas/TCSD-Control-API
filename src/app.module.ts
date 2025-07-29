import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QrModule } from './qr/qr.module';
import { DatabaseModule } from './database/database.module';
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
