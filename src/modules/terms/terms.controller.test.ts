import { Test, TestingModule } from '@nestjs/testing';
import { ENUMS } from '@ukef/constants';
import { RESPONSE } from '@ukef-test/support/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { resetAllWhenMocks, when } from 'jest-when';

import { TermsController } from './terms.controller';
import { TermsService } from './terms.service';

describe('TermsController', () => {
  let controller: TermsController;
  let service: TermsService;
  let mockService: jest.Mock;
  const valueGenerator = new RandomValueGenerator();
  const facilityId = valueGenerator.facilityId();
  const term = { id: facilityId };

  beforeEach(async () => {
    mockService = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TermsController],
      providers: [
        {
          provide: TermsService,
          useValue: {
            postFacilityToTermStore: mockService,
          },
        },
      ],
    }).compile();

    controller = module.get<TermsController>(TermsController);
    service = module.get<TermsService>(TermsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('postFacilityToTermStore', () => {
    it.each([
      {
        expectedResult: { message: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERM_CREATED },
        expectedStatusCode: HttpStatusCode.Created,
      },

      {
        expectedResult: { message: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERMS_EXISTS },
        expectedStatusCode: HttpStatusCode.Ok,
      },
    ])('should call the service with the correct term id and return the correct message', async ({ expectedResult, expectedStatusCode }) => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      when(mockService).calledWith(term.id).mockResolvedValue(expectedResult);

      await controller.postFacilityToTermStore([term], res);

      expect(service.postFacilityToTermStore).toHaveBeenCalledWith(term.id);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
    });

    it('should handle the case where the service rejects due to an already existing term', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const error = new Error(RESPONSE.FACILITY_TERM_EXISTS);

      when(mockService).calledWith(term.id).mockRejectedValue(error);

      await expect(controller.postFacilityToTermStore([term], res)).rejects.toEqual(error);
      expect(service.postFacilityToTermStore).toHaveBeenCalledWith(term.id);
    });

    it('should handle the case where the service rejects due to an internal server error', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const error = new Error(RESPONSE.INTERNAL_SERVER_ERROR);

      when(mockService).calledWith(term.id).mockRejectedValue(error);

      await expect(controller.postFacilityToTermStore([term], res)).rejects.toEqual(error);
      expect(service.postFacilityToTermStore).toHaveBeenCalledWith(term.id);
    });
  });
});
