import { Module } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import { FbDatabaseModule } from 'src/fb-database/fb-database.module';

@Module({
  imports: [FbDatabaseModule],
  providers: [QrService],
  controllers: [QrController],
})
export class QrModule {}
