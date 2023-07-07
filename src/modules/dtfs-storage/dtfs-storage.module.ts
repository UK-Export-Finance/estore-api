import { Module } from '@nestjs/common';

import { DtfsStorageClientModule } from '../dtfs-storage-client/dtfs-storage-client.module';
import { DtfsStorageFileService } from './dtfs-storage-file.service';

@Module({
  imports: [DtfsStorageClientModule],
  providers: [DtfsStorageFileService],
  exports: [DtfsStorageFileService],
})
export class DtfsStorageModule {}
