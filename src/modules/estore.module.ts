import { Module } from '@nestjs/common';
import { AuthModule } from '@ukef/modules/auth/auth.module';

import { GraphModule } from './graph/graph.module';

@Module({
  imports: [AuthModule, GraphModule],
  providers: [],
  exports: [],
})
export class EstoreModule {}
