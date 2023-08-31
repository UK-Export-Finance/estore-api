import { HttpService } from '@nestjs/axios';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { MdmCreateNumbersRequest } from './dto/mdm-create-numbers-request.dto';
import { MdmCreateNumbersResponse } from './dto/mdm-create-numbers-response.dto';
import { MdmException } from './exception/mdm.exception';
import { MdmService } from './mdm.service';

describe('MdmService', () => {
  const valueGenerator = new RandomValueGenerator();

  let httpServicePost: jest.Mock;
  let service: MdmService;

  beforeEach(() => {
    const httpService = new HttpService();
    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new MdmService(httpService);
  });

  describe('createNumbers', () => {
    const numbersToCreate: MdmCreateNumbersRequest = [
      {
        numberTypeId: valueGenerator.nonnegativeInteger(),
        createdBy: valueGenerator.string(),
        requestingSystem: valueGenerator.string(),
      },
      {
        numberTypeId: valueGenerator.nonnegativeInteger(),
        createdBy: valueGenerator.string(),
        requestingSystem: valueGenerator.string(),
      },
    ];

    const createdNumbers: MdmCreateNumbersResponse = [
      {
        id: valueGenerator.integer(),
        maskedId: valueGenerator.stringOfNumericCharacters(),
        type: valueGenerator.integer(),
        createdBy: valueGenerator.string(),
        createdDatetime: valueGenerator.dateTimeString(),
        requestingSystem: valueGenerator.string(),
      },
      {
        id: valueGenerator.integer(),
        maskedId: valueGenerator.stringOfNumericCharacters(),
        type: valueGenerator.integer(),
        createdBy: valueGenerator.string(),
        createdDatetime: valueGenerator.dateTimeString(),
        requestingSystem: valueGenerator.string(),
      },
    ];

    const expectedHttpServicePostArgs: [string, object, object] = ['/numbers', numbersToCreate, { headers: { 'Content-Type': 'application/json' } }];

    it('sends a POST to the MDM /numbers endpoint with the specified request', async () => {
      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(
          of({
            data: createdNumbers,
            status: 201,
            statusText: 'Created',
            config: undefined,
            headers: undefined,
          }),
        );

      await service.createNumbers(numbersToCreate);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(...expectedHttpServicePostArgs);
    });

    it('returns the created numbers from POSTing to the MDM /numbers endpoint with the specified request', async () => {
      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(
          of({
            data: createdNumbers,
            status: 201,
            statusText: 'Created',
            config: undefined,
            headers: undefined,
          }),
        );

      const createNumbersResult = await service.createNumbers(numbersToCreate);

      expect(createNumbersResult).toBe(createdNumbers);
    });

    it('throws an MdmException if the request to MDM fails', async () => {
      const axiosRequestError = new AxiosError();
      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosRequestError));

      const createNumbersPromise = service.createNumbers(numbersToCreate);

      await expect(createNumbersPromise).rejects.toBeInstanceOf(MdmException);
      await expect(createNumbersPromise).rejects.toThrow('Failed to create numbers in MDM.');
      await expect(createNumbersPromise).rejects.toHaveProperty('innerError', axiosRequestError);
    });
  });
});
