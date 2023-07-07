import { Module } from '@nestjs/common';

import DtfsStorageClientService from './dtfs-storage-client.service';

@Module({
  providers: [DtfsStorageClientService],
  exports: [DtfsStorageClientService],
})
export class DtfsStorageClientModule {}
