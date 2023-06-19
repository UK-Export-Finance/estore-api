import { HttpService } from '@nestjs/axios';
import { MAX_FILE_SIZE } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DtfsFileService } from './dtfs-file.service';
import { DtfsException } from './exception/dtfs.exception';
import { DtfsFileNotFoundException } from './exception/dtfs-file-not-found.exception';

describe('AcbsDealService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const fileName = valueGenerator.string();
  const fileLocationPath = valueGenerator.string();
  const expectedFileSize = valueGenerator.integer({ min: 1, max: MAX_FILE_SIZE });

  let httpService: HttpService;
  let service: DtfsFileService;

  let httpServiceHead: jest.Mock;

  const expectedHttpServiceHeadArgs = [
    `/${fileLocationPath}/${fileName}`,
    {
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${idToken}`,
        'x-ms-version': '2023-01-03',
        'x-ms-file-request-intent': 'backup',
      },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceHead = jest.fn();
    httpService.head = httpServiceHead;

    service = new DtfsFileService({ baseUrl }, httpService);
  });

  describe('getFileSize', () => {
    it('returns the file size if DTFS file storage responds with the file size', async () => {
      when(httpServiceHead)
        .calledWith(...expectedHttpServiceHeadArgs)
        .mockReturnValueOnce(
          of({
            data: undefined,
            status: 200,
            statusText: 'Ok',
            config: undefined,
            headers: { 'Content-Length': expectedFileSize },
          }),
        );

      const fileSize = await service.getFileSize(fileName, fileLocationPath, idToken);

      expect(fileSize).toBe(expectedFileSize);
    });

    it('throws a DtfsException if the request to DTFS file storage fails', async () => {
      const getFileSizeError = new AxiosError();
      when(httpServiceHead)
        .calledWith(...expectedHttpServiceHeadArgs)
        .mockReturnValueOnce(throwError(() => getFileSizeError));

      const getFileSizePromise = service.getFileSize(fileName, fileLocationPath, idToken);

      await expect(getFileSizePromise).rejects.toBeInstanceOf(DtfsException);
      await expect(getFileSizePromise).rejects.toThrow(`Failed to get file size for file ${fileLocationPath}/${fileName}.`);
      await expect(getFileSizePromise).rejects.toHaveProperty('innerError', getFileSizeError);
    });

    it(`throws a DtfsNotFoundException if DTFS file storage responds with a 404`, async () => {
      const notFoundError = new AxiosError();
      notFoundError.response = {
        data: undefined,
        status: 404,
        statusText: 'Not Found',
        headers: undefined,
        config: undefined,
      };
      when(httpServiceHead)
        .calledWith(...expectedHttpServiceHeadArgs)
        .mockReturnValueOnce(throwError(() => notFoundError));

      const getFileSizePromise = service.getFileSize(fileName, fileLocationPath, idToken);

      await expect(getFileSizePromise).rejects.toBeInstanceOf(DtfsFileNotFoundException);
      await expect(getFileSizePromise).rejects.toThrow(`File ${fileLocationPath}/${fileName} was not found in DTFS.`);
      await expect(getFileSizePromise).rejects.toHaveProperty('innerError', notFoundError);
    });
  });
});
