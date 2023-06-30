import { Module } from '@nestjs/common';

import { DtfsStorageModule } from '../dtfs-storage/dtfs-storage.module';
import { GraphModule } from '../graph/graph.module';
import { DealFolderController } from './deal-folder.controller';
import { DealFolderService } from './deal-folder.service';

@Module({
  imports: [DtfsStorageModule, GraphModule],
  controllers: [DealFolderController],
  providers: [DealFolderService],
  exports: [],
})
export class DealFolderModule {}
