import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphModule } from '@ukef/modules/graph/graph.module';
import { MdmModule } from '@ukef/modules/mdm/mdm.module';

import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { SiteExceptionTransformInterceptor } from './site-exception-transform.interceptor';

@Module({
  imports: [GraphModule, MdmModule],
  controllers: [SiteController],
  providers: [
    SiteService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SiteExceptionTransformInterceptor,
    },
  ],
  exports: [SiteService],
})
export class SiteModule {}
