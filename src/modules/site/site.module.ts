import { Module } from '@nestjs/common';

import { GraphModule } from '../graph/graph.module';
import { MockSiteIdGeneratorService } from './mockSiteIdGeneratorService';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

@Module({
  imports: [GraphModule],
  controllers: [SiteController],
  providers: [SiteService, MockSiteIdGeneratorService],
  exports: [SiteService],
})
export class SiteModule {}
