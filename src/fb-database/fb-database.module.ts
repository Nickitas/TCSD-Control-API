import { Module } from '@nestjs/common';
import { FbDatabaseService } from './fb-database.service';

@Module({
  providers: [FbDatabaseService],
  exports: [FbDatabaseService],
})
export class FbDatabaseModule {}
