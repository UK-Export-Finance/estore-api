import { Module } from '@nestjs/common';
import { DtfsAuthenticationService } from '@ukef/modules/dtfs-authentication/dtfs-authentication.service';

import { DtfsFileService } from './dtfs-file.service';

@Module({
  imports: [DtfsAuthenticationService],
  providers: [DtfsFileService],
  exports: [DtfsFileService],
})
export class DtfsModule {}
