import { Module } from '@nestjs/common';
import { GraphModule } from '@ukef/modules/graph/graph.module';

import { SharepointService } from './sharepoint.service';

@Module({
  imports: [GraphModule],
  providers: [SharepointService],
  exports: [SharepointService],
})
export class SharepointModule {}
