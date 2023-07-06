import { Module } from '@nestjs/common';
import { GraphModule } from '@ukef/modules/graph/graph.module';

import { CustodianModule } from '../custodian/custodian.module';
import { SiteDealController } from './site-deal.controller';
import { SiteDealService } from './site-deal.service';
import { SiteDealNotFoundExceptionToBadRequestTransformInterceptor } from './site-deal-not-found-exception-to-bad-request-transform.interceptor';

@Module({
  imports: [GraphModule, CustodianModule],
  controllers: [SiteDealController],
  providers: [SiteDealService, SiteDealNotFoundExceptionToBadRequestTransformInterceptor],
  exports: [SiteDealService],
})
export class SiteDealModule {}
