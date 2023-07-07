import { HttpService } from '@nestjs/axios';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { CustodianService } from './custodian.service';
import { CustodianCreateAndProvisionRequest } from './dto/custodian-create-and-provision-request.dto';
import { CustodianCreateAndProvisionResponse } from './dto/custodian-create-and-provision-response.dto';
import { CustodianException } from './exception/custodian.exception';

describe('CustodianService', () => {
  const valueGenerator = new RandomValueGenerator();

  let httpServicePost: jest.Mock;
  let service: CustodianService;

  beforeEach(() => {
    const httpService = new HttpService();
    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new CustodianService(httpService);
  });

  describe('createAndProvision', () => {
    const titleOfItemToCreateAndProvision = valueGenerator.string();
    const itemToCreateAndProvision: CustodianCreateAndProvisionRequest = {
      Title: titleOfItemToCreateAndProvision,
      Id: valueGenerator.nonnegativeInteger(),
      Code: valueGenerator.string(),
      TemplateId: valueGenerator.string(),
      ParentId: valueGenerator.nonnegativeInteger(),
      InterestedParties: valueGenerator.string(),
      Secure: valueGenerator.boolean(),
      DoNotSubscribeInterestedParties: valueGenerator.boolean(),
      Links: [],
      FormButton: valueGenerator.string(),
      HasAttachments: valueGenerator.boolean(),
      Metadata: [
        {
          Name: valueGenerator.string(),
          Values: [valueGenerator.string(), valueGenerator.string()],
        },
        {
          Name: valueGenerator.string(),
          Values: [valueGenerator.string()],
        },
        {
          Name: valueGenerator.string(),
          Values: [],
        },
      ],
      TypeGuid: valueGenerator.string(),
      SPHostUrl: valueGenerator.string(),
    };

    const createdItem: CustodianCreateAndProvisionResponse = {
      Id: valueGenerator.nonnegativeInteger(),
    };

    const expectedHttpServicePostArgs: [string, object, object] = [
      '/Create/CreateAndProvision',
      itemToCreateAndProvision,
      { headers: { 'Content-Type': 'application/json' } },
    ];

    it('sends a POST to the Custodian /Create/CreateAndProvision endpoint with the specified item to create and provision', async () => {
      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(
          of({
            data: createdItem,
            status: 201,
            statusText: 'Created',
            config: undefined,
            headers: undefined,
          }),
        );

      await service.createAndProvision(itemToCreateAndProvision);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(...expectedHttpServicePostArgs);
    });

    it('throws a CustodianException if the request to Custodian fails', async () => {
      const axiosRequestError = new AxiosError();
      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosRequestError));

      const createNumbersPromise = service.createAndProvision(itemToCreateAndProvision);

      await expect(createNumbersPromise).rejects.toBeInstanceOf(CustodianException);
      await expect(createNumbersPromise).rejects.toThrow(`Failed to create and provision an item via Custodian with title ${titleOfItemToCreateAndProvision}.`);
      await expect(createNumbersPromise).rejects.toHaveProperty('innerError', axiosRequestError);
    });
  });
});
