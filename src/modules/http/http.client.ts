import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { catchError, lastValueFrom, Observable, ObservableInput } from 'rxjs';

import { RequestHeaders } from './type/headers.type';

export class HttpClient {
  constructor(private readonly httpService: HttpService) {}

  post<RequestBody, ResponseBody>({
    path,
    requestBody,
    headers,
    onError,
  }: {
    path: string;
    requestBody: RequestBody;
    headers: RequestHeaders;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody, RequestBody>> {
    return this.responseFrom({ request: this.httpService.post<never>(path, requestBody, { headers }), onError });
  }

  private async responseFrom<ResponseBody = never>({
    request,
    onError,
  }: {
    request: Observable<AxiosResponse<ResponseBody, any>>;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody, any>> {
    return await lastValueFrom(request.pipe(catchError((error) => onError(error))));
  }
}
