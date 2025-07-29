import { Module } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import { ConnectionModule } from 'src/connection/connection.module';

@Module({
  imports: [ConnectionModule],
  providers: [QrService],
  controllers: [QrController],
})
export class QrModule {}
