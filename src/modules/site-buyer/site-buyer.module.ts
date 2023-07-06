import { Module } from '@nestjs/common';
import { CustodianModule } from '@ukef/modules/custodian/custodian.module';
import { SharepointModule } from '@ukef/modules/sharepoint/sharepoint.module';

import { SiteBuyerController } from './site-buyer.controller';
import { SiteBuyerService } from './site-buyer.service';

@Module({
  imports: [CustodianModule, SharepointModule],
  controllers: [SiteBuyerController],
  providers: [SiteBuyerService],
  exports: [SiteBuyerService],
})
export class SiteBuyerModule {}
