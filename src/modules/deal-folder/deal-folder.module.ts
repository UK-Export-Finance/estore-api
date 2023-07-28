import { Module } from '@nestjs/common';
import { DtfsStorageModule } from '@ukef/modules/dtfs-storage/dtfs-storage.module';
import { GraphModule } from '@ukef/modules/graph/graph.module';

import { DtfsStorageModule } from '../dtfs-storage/dtfs-storage.module';
import { SharepointModule } from '../sharepoint/sharepoint.module';
import { DealFolderController } from './deal-folder.controller';
import { DealFolderService } from './deal-folder.service';
import { DocumentTypeMapper } from './document-type-mapper';

@Module({
  imports: [DtfsStorageModule, SharepointModule],
  controllers: [DealFolderController],
  providers: [DealFolderService, DocumentTypeMapper],
})
export class DealFolderModule {}
