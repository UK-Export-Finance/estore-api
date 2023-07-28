import { Module } from '@nestjs/common';

import { SharepointModule } from '../sharepoint/sharepoint.module';
import { TermsController } from './terms.controller';
import { TermsService } from './terms.service';

@Module({
  imports: [SharepointModule],
  controllers: [TermsController],
  providers: [TermsService],
})
export class TermsModule {}
