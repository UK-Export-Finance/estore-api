import { Module } from '@nestjs/common';

import { GraphClientModule } from '../graph-client/graph-client.module';
import { GraphService } from './graph.service';

@Module({
  imports: [GraphClientModule],
  providers: [GraphService],
  exports: [GraphService],
})
export class GraphModule {}
