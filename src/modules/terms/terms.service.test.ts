import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { RESPONSE } from '@ukef/constants';
import { GraphService } from '@ukef/modules/graph/graph.service';
import { when } from 'jest-when';

import { TermsService } from './terms.service';

describe('TermsService', () => {
  let service: TermsService;
  let graphService: GraphService;
  let mockGraphServicePost: jest.Mock;
  const facilityId = '123';

  beforeEach(async () => {
    mockGraphServicePost = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TermsService,
        {
          provide: GraphService,
          useValue: {
            post: mockGraphServicePost,
          },
        },
        {
          provide: SharepointConfig.KEY,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TermsService>(TermsService);
    graphService = module.get<GraphService>(GraphService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('postFacilityToTermStore', () => {
    it('should call the graphService post method with the correct parameters and return a success message', async () => {
      when(mockGraphServicePost).calledWith(expect.any(Object)).mockResolvedValue(undefined);

      const result = await service.postFacilityToTermStore(facilityId);

      expect(graphService.post).toHaveBeenCalled();
      expect(result).toEqual({ message: RESPONSE.FACILITY_TERM_CREATED });
    });

    it('should return a `term exists` message when the graphService post method returns a 400 status', async () => {
      const error = { statusCode: 400 };
      when(mockGraphServicePost).calledWith(expect.any(Object)).mockRejectedValue(error);

      const result = await service.postFacilityToTermStore(facilityId);

      expect(graphService.post).toHaveBeenCalled();
      expect(result).toEqual({ message: RESPONSE.FACILITY_TERM_EXISTS });
    });

    it('should throw an error when the graphService post method throws an error', async () => {
      const error = new Error('An error occurred');
      when(mockGraphServicePost).calledWith(expect.any(Object)).mockRejectedValue(error);

      await expect(service.postFacilityToTermStore(facilityId)).rejects.toThrow(InternalServerErrorException);
      expect(graphService.post).toHaveBeenCalled();
    });
  });
});
