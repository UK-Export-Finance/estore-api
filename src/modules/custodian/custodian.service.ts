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

  // TODO APIM-136: Change this to return Promise<void> if we do not end up using the response data
  async createAndProvision(itemToCreateAndProvision: CustodianCreateAndProvisionRequest): Promise<CustodianCreateAndProvisionResponse> {
    const { Title: titleOfItemToCreateAndProvision } = itemToCreateAndProvision;
    const { data } = await this.httpClient.post<CustodianCreateAndProvisionRequest, CustodianCreateAndProvisionResponse>({
      path: '/Create/CreateAndProvision',
      requestBody: itemToCreateAndProvision,
      headers: { 'Content-Type': 'application/json' },
      onError: (error: Error) =>
        throwError(() => new CustodianException(`Failed to create and provision an item via Custodian with title ${titleOfItemToCreateAndProvision}.`, error)),
    });
    return data;
  }
}
