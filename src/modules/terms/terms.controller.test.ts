import { Test, TestingModule } from '@nestjs/testing';
import { RESPONSE } from '@ukef/constants';
import { when } from 'jest-when';

import { TermsController } from './terms.controller';
import { TermsService } from './terms.service';

describe('TermsController', () => {
  let controller: TermsController;
  let service: TermsService;
  let mockService: jest.Mock;
  const facilityId = '0012345678';

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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('postFacilityToTermStore', () => {
    it('should call the service with the correct term id and return its result', async () => {
      const term = { id: facilityId };
      const result = { message: RESPONSE.FACILITY_TERM_CREATED };

      when(mockService).calledWith(term.id).mockResolvedValue(result);

      const response = await controller.postFacilityToTermStore(term);

      expect(service.postFacilityToTermStore).toHaveBeenCalledWith(term.id);
      expect(response).toBe(result);
    });

    it('should handle the case where the service rejects due to an already existing term', async () => {
      const term = { id: facilityId };
      const error = new Error(RESPONSE.FACILITY_TERM_EXISTS);

      when(mockService).calledWith(term.id).mockRejectedValue(error);

      await expect(controller.postFacilityToTermStore(term)).rejects.toEqual(error);
      expect(service.postFacilityToTermStore).toHaveBeenCalledWith(term.id);
    });

    it('should handle the case where the service rejects due to an internal server error', async () => {
      const term = { id: facilityId };
      const error = new Error(RESPONSE.INTERNAL_SERVER_ERROR);

      when(mockService).calledWith(term.id).mockRejectedValue(error);

      await expect(controller.postFacilityToTermStore(term)).rejects.toEqual(error);
      expect(service.postFacilityToTermStore).toHaveBeenCalledWith(term.id);
    });
  });
});
