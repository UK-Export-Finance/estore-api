import { Module } from '@nestjs/common';

import { DtfsStorageFileService } from './dtfs-storage-file.service';

@Module({
  providers: [DtfsStorageFileService],
  exports: [DtfsStorageFileService],
})
export class DtfsStorageModule {}
