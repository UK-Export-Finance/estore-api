import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { HttpClient } from '@ukef/modules/http/http.client';
import { throwError } from 'rxjs';

import { MdmCreateNumbersRequest } from './dto/mdm-create-numbers-request.dto';
import { MdmCreateNumbersResponse } from './dto/mdm-create-numbers-response.dto';
import { MdmException } from './exception/mdm.exception';

@Injectable()
export class MdmService {
  private readonly httpClient: HttpClient;

  constructor(httpService: HttpService) {
    this.httpClient = new HttpClient(httpService);
  }

  async createNumbers(numbersToCreate: MdmCreateNumbersRequest): Promise<MdmCreateNumbersResponse> {
    const { data } = await this.httpClient.post<MdmCreateNumbersRequest, MdmCreateNumbersResponse>({
      path: '/numbers',
      requestBody: numbersToCreate,
      headers: { 'Content-Type': 'application/json' },
      onError: (error: Error) => throwError(() => new MdmException('Failed to create numbers in MDM.', error)),
    });
    return data;
  }
}
