import { Module } from '@nestjs/common';
import { AuthModule } from '@ukef/modules/auth/auth.module';

import { GraphModule } from './graph/graph.module';
import { GraphClientModule } from './graph-client/graph-client.module';
import { SiteModule } from './site/site.module';
import { TermsModule } from './terms/terms.module';
import { TemporaryFileCheckModule } from './temporary-file-check/temporary-file-check.module';

@Module({
  imports: [AuthModule, GraphClientModule, GraphModule, SiteModule, TemporaryFileCheckModule, TermsModule],
})
export class EstoreModule {}
