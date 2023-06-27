import { Module } from '@nestjs/common';
import { DtfsStorageModule } from '@ukef/modules/dtfs-storage/dtfs-storage.module';

import { FileService } from './file.service';
import { TemporaryFileCheckController } from './temporary-file-check.controller';

@Module({
  imports: [DtfsStorageModule],
  controllers: [TemporaryFileCheckController],
  providers: [FileService],
})
export class TemporaryFileCheckModule {}
