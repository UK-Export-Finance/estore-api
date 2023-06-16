import { Module } from '@nestjs/common';

import { DtfsAuthenticationService } from './dtfs-authentication.service';

@Module({
  providers: [DtfsAuthenticationService],
  exports: [DtfsAuthenticationService],
})
export class DtfsAuthenticationModule {}
