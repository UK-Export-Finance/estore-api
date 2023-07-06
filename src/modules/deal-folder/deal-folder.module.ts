import { Module } from '@nestjs/common';

import { DtfsStorageModule } from '../dtfs-storage/dtfs-storage.module';
import { GraphModule } from '../graph/graph.module';
import { DealFolderController } from './deal-folder.controller';
import { DealFolderService } from './deal-folder.service';
import { DocumentTypeMapper } from './document-type-mapper';

@Module({
  imports: [DtfsStorageModule, GraphModule],
  controllers: [DealFolderController],
  providers: [DealFolderService, DocumentTypeMapper],
})
export class DealFolderModule {}
