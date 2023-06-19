import { Module } from '@nestjs/common';

import { BaseDtfsAuthenticationService, BaseDtfsAuthenticationServiceInjectionKey } from './base-dtfs-authentication.service';
import { DtfsAuthenticationService } from './dtfs-authentication.service';

const dtfsAuthenticationServiceProvider = {
  provide: DtfsAuthenticationService,
  useClass: BaseDtfsAuthenticationService,
};

@Module({
  providers: [
    {
      provide: BaseDtfsAuthenticationServiceInjectionKey,
      useClass: BaseDtfsAuthenticationService,
    },
    dtfsAuthenticationServiceProvider,
  ],
  exports: [dtfsAuthenticationServiceProvider],
})
export class DtfsAuthenticationModule {}
