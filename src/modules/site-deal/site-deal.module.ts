import { Module } from '@nestjs/common';
import { CustodianModule } from '@ukef/modules/custodian/custodian.module';
import { SharepointModule } from '@ukef/modules/sharepoint/sharepoint.module';

import { DealFolderCreationService } from './deal-folder-creation.service';
import { FacilityFolderCreationService } from './facility-folder-creation.service';
import { SiteDealController } from './site-deal.controller';

@Module({
  imports: [CustodianModule, SharepointModule],
  controllers: [SiteDealController],
  providers: [FacilityFolderCreationService, DealFolderCreationService],
})
export class SiteDealModule {}
