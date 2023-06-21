import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { catchError, lastValueFrom, Observable, ObservableInput, throwError } from 'rxjs';

import { MdmCreateNumbersRequest } from './dto/mdm-create-numbers-request.dto';
import { MdmCreateNumbersResponse } from './dto/mdm-create-numbers-response.dto';
import { MdmException } from './exception/mdm.exception';

@Injectable()
export class MdmService {
  constructor(private readonly httpService: HttpService) {}

  async createNumbers(numbersToCreate: MdmCreateNumbersRequest): Promise<MdmCreateNumbersResponse> {
    const { data } = await this.post<MdmCreateNumbersRequest, MdmCreateNumbersResponse>({
      path: '/numbers',
      requestBody: numbersToCreate,
      onError: (error: Error) => {
        return throwError(() => new MdmException('Failed to create numbers in MDM.', error));
      },
    });
    return data;
  }

  private post<RequestBody, ResponseBody>({
    path,
    requestBody,
    onError,
  }: {
    path: string;
    requestBody: RequestBody;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody, RequestBody>> {
    return this.responseFrom({ request: this.httpService.post<never>(path, requestBody, this.getPostRequestConfig()), onError });
  }

  private async responseFrom<ResponseBody = never>({
    request,
    onError,
  }: {
    request: Observable<AxiosResponse<ResponseBody, any>>;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody, any>> {
    return await lastValueFrom(request.pipe(catchError(onError)));
  }

  private getPostRequestConfig(): AxiosRequestConfig {
    return {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
}
