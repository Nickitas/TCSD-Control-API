import { Module } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import { DatabaseModule } from 'src/fb-database/fb-database.module';

@Module({
  imports: [DatabaseModule],
  providers: [QrService],
  controllers: [QrController],
})
export class QrModule {}
