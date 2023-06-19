import { ClientSecretCredential } from '@azure/identity';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import DtfsConfig from '@ukef/config/dtfs.config';

import { DtfsAuthenticationService } from './dtfs-authentication.service';

@Injectable()
export class BaseDtfsAuthenticationService extends DtfsAuthenticationService {
  private readonly clientSecretCredential: ClientSecretCredential;
  private readonly scope: string;

  constructor(
    @Inject(DtfsConfig.KEY)
    { tenantId, clientId, clientSecret, scope }: ConfigType<typeof DtfsConfig>,
  ) {
    super();
    this.clientSecretCredential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    this.scope = scope;
  }

  async getIdToken(): Promise<string> {
    return (await this.clientSecretCredential.getToken(this.scope)).token;
  }
}

export const BaseDtfsAuthenticationServiceInjectionKey = Symbol(BaseDtfsAuthenticationService.name);
