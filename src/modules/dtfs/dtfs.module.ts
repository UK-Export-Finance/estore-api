import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DtfsAuthenticationModule } from '@ukef/modules/dtfs-authentication/dtfs-authentication.module';

import { DtfsFileService } from './dtfs-file.service';

@Module({
  imports: [DtfsAuthenticationModule, HttpModule],
  providers: [DtfsFileService],
  exports: [DtfsAuthenticationModule, DtfsFileService],
})
export class DtfsModule {}
