import { Module } from '@nestjs/common';
import { AuthModule } from '@ukef/modules/auth/auth.module';

import { GraphModule } from './graph/graph.module';
import { GraphClientModule } from './graph-client/graph-client.module';
import { SiteModule } from './site/site.module';

@Module({
  imports: [AuthModule, GraphClientModule, GraphModule, SiteModule],
  providers: [],
  exports: [],
})
export class EstoreModule {}
