import { Module } from '@nestjs/common';
import { CustodianModule } from '@ukef/modules/custodian/custodian.module';
import { SharepointModule } from '@ukef/modules/sharepoint/sharepoint.module';

import { BuyerFolderCreationService } from './buyer-folder-creation.service';
import { SiteBuyerController } from './site-buyer.controller';

@Module({
  imports: [CustodianModule, SharepointModule],
  controllers: [SiteBuyerController],
  providers: [BuyerFolderCreationService],
  exports: [BuyerFolderCreationService],
})
export class SiteBuyerModule {}
