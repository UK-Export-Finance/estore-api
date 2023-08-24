import { Module } from '@nestjs/common';
import { DtfsStorageModule } from '@ukef/modules/dtfs-storage/dtfs-storage.module';

import { SharepointModule } from '../sharepoint/sharepoint.module';
import { DocumentTypeMapper } from './document-type-mapper';
import { SiteDocumentController } from './site-document.controller';
import { SiteDocumentService } from './site-document.service';

@Module({
  imports: [DtfsStorageModule, SharepointModule],
  controllers: [SiteDocumentController],
  providers: [SiteDocumentService, DocumentTypeMapper],
})
export class SiteDocumentModule {}
