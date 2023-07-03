import { Module } from '@nestjs/common';
import { CustodianModule } from '@ukef/modules/custodian/custodian.module';
import { SharepointModule } from '@ukef/modules/sharepoint/sharepoint.module';

import { DealFolderService } from './deal-folder.service';
import { SiteDealController } from './site-deal.controller';
import { SiteDealService } from './site-deal.service';
import { SiteDealNotFoundExceptionToBadRequestTransformInterceptor } from './site-deal-not-found-exception-to-bad-request-transform.interceptor';

@Module({
  imports: [CustodianModule, SharepointModule],
  controllers: [SiteDealController],
  providers: [SiteDealService, SiteDealNotFoundExceptionToBadRequestTransformInterceptor, DealFolderService],
})
export class SiteDealModule {}
