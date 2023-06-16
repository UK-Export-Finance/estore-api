import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import DtfsConfig from '@ukef/config/dtfs.config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { catchError, lastValueFrom, Observable, ObservableInput } from 'rxjs';

export class DtfsHttpService {
  constructor(private readonly config: Pick<ConfigType<typeof DtfsConfig>, 'baseUrl'>, private readonly httpService: HttpService) {}

  private getRequestConfig(idToken: string): AxiosRequestConfig {
    return {
      baseURL: this.config.baseUrl,
      headers: {
        Authorization: `Bearer ${idToken}`,
        'x-ms-version': '2023-01-03',
        'x-ms-file-request-intent': 'backup',
      },
    };
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

  head({ path, idToken, onError }: { path: string; idToken: string; onError: (error: Error) => ObservableInput<never> }): Promise<AxiosResponse> {
    return this.responseFrom({ request: this.httpService.head<never>(path, this.getRequestConfig(idToken)), onError });
  }
}
