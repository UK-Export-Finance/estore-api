import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import DtfsConfig from '@ukef/config/dtfs.config';
import { AxiosError } from 'axios';
import { throwError } from 'rxjs';

import { DtfsHttpService } from './dtfs-http.service';
import { DtfsException } from './exception/dtfs.exception';
import { DtfsFileNotFoundException } from './exception/dtfs-file-not-found.exception';

@Injectable()
export class DtfsFileService {
  private readonly dtfsHttpService: DtfsHttpService;

  constructor(
    @Inject(DtfsConfig.KEY)
    config: Pick<ConfigType<typeof DtfsConfig>, 'baseUrl'>,
    httpService: HttpService,
  ) {
    this.dtfsHttpService = new DtfsHttpService(config, httpService);
  }

  async getFileSize(fileName: string, fileLocationPath: string, idToken: string): Promise<number> {
    return await this.dtfsHttpService
      .head({
        path: `/${fileLocationPath}/${fileName}`,
        idToken,
        onError: (error: Error) => {
          if (error instanceof AxiosError && error.response?.status === 404) {
            return throwError(() => new DtfsFileNotFoundException(`File ${fileLocationPath}/${fileName} was not found in DTFS.`, error));
          }

          return throwError(() => new DtfsException(`Failed to get file size for file ${fileLocationPath}/${fileName}.`, error));
        },
      })
      .then((response) => {
        return response.headers['Content-Length'] as number;
      });
  }
}
