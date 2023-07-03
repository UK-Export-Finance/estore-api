import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { HttpClient } from '@ukef/modules/http/http.client';
import { throwError } from 'rxjs';

import { CustodianCreateAndProvisionRequest } from './dto/custodian-create-and-provision-request.dto';
import { CustodianCreateAndProvisionResponse } from './dto/custodian-create-and-provision-response.dto';
import { CustodianException } from './exception/custodian.exception';

@Injectable()
export class CustodianService {
  private readonly httpClient: HttpClient;
  constructor(httpService: HttpService) {
    this.httpClient = new HttpClient(httpService);
  }

  async createAndProvision(itemToCreateAndProvision: CustodianCreateAndProvisionRequest): Promise<void> {
    const { Title: titleOfItemToCreateAndProvision } = itemToCreateAndProvision;
    await this.httpClient.post<CustodianCreateAndProvisionRequest, CustodianCreateAndProvisionResponse>({
      path: '/Create/CreateAndProvision',
      requestBody: itemToCreateAndProvision,
      headers: { 'Content-Type': 'application/json' },
      onError: (error: Error) =>
        throwError(() => new CustodianException(`Failed to create and provision an item via Custodian with title ${titleOfItemToCreateAndProvision}.`, error)),
    });
  }
}
