import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphModule } from '@ukef/modules/graph/graph.module';

import { CustodianModule } from '../custodian/custodian.module';
import { SiteDealController } from './site-deal.controller';
import { SiteDealService } from './site-deal.service';
import { SiteDealExceptionTransformInterceptor } from './site-deal-exception-transform.interceptor';

@Module({
  imports: [GraphModule, CustodianModule],
  controllers: [SiteDealController],
  providers: [
    SiteDealService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SiteDealExceptionTransformInterceptor,
    },
  ],
  exports: [SiteDealService],
})
export class SiteDealModule {}
