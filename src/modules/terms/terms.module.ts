import { Module } from '@nestjs/common';
import { GraphModule } from '@ukef/modules/graph/graph.module';

import { TermsController } from './terms.controller';
import { TermsService } from './terms.service';

@Module({
  imports: [GraphModule],
  controllers: [TermsController],
  providers: [TermsService],
})
export class TermsModule {}
