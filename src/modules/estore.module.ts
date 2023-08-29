import { Module } from '@nestjs/common';
import { AuthModule } from '@ukef/modules/auth/auth.module';

import { GraphModule } from './graph/graph.module';
import { GraphClientModule } from './graph-client/graph-client.module';
import { SiteModule } from './site/site.module';
import { SiteBuyerModule } from './site-buyer/site-buyer.module';
import { SiteDealModule } from './site-deal/site-deal.module';
import { SiteDocumentModule } from './site-document/site-document.module';
import { TermsModule } from './terms/terms.module';

@Module({
  imports: [AuthModule, GraphClientModule, GraphModule, SiteModule, SiteDealModule, SiteDocumentModule, TermsModule, SiteBuyerModule],
})
export class EstoreModule {}
