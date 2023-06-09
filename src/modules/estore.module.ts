import { Module } from '@nestjs/common';
import { AuthModule } from '@ukef/modules/auth/auth.module';

import { DealFolderModule } from './deal-folder/deal-folder.module';
import { GraphModule } from './graph/graph.module';
import { GraphClientModule } from './graph-client/graph-client.module';
import { SiteModule } from './site/site.module';
import { SiteBuyerModule } from './site-buyer/site-buyer.module';
import { SiteDealModule } from './site-deal/site-deal.module';
import { TermsModule } from './terms/terms.module';

@Module({
  imports: [AuthModule, DealFolderModule, GraphClientModule, GraphModule, SiteModule, SiteDealModule, TermsModule, SiteBuyerModule],
})
export class EstoreModule {}
