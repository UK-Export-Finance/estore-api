import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphModule } from '@ukef/modules/graph/graph.module';
import { TermsFacilityExistsExceptionInterceptor } from './terms-facility-exception.interceptor';

import { TermsController } from './terms.controller';
import { TermsService } from './terms.service';

@Module({
  imports: [GraphModule],
  controllers: [TermsController],
  providers: [TermsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TermsFacilityExistsExceptionInterceptor,
    },
  ],
})
export class TermsModule {}
