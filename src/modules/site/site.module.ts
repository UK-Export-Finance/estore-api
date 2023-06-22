import { Module } from '@nestjs/common';
import { GraphModule } from '@ukef/modules/graph/graph.module';
import { MdmModule } from '@ukef/modules/mdm/mdm.module';

import { SiteController } from './site.controller';
import { SiteService } from './site.service';

@Module({
  imports: [GraphModule, MdmModule],
  controllers: [SiteController],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}
