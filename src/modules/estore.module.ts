import { Module } from '@nestjs/common';
import { AuthModule } from '@ukef/modules/auth/auth.module';

import { GraphModule } from './graph/graph.module';
import { GraphClientModule } from './graph-client/graph-client.module';
import { SiteModule } from './site/site.module';
import { TermsModule } from './terms/terms.module';

@Module({
  imports: [AuthModule, GraphClientModule, GraphModule, SiteModule, TermsModule],
})
export class EstoreModule {}
