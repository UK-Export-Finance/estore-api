import { Test, TestingModule } from '@nestjs/testing';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { RESPONSE } from '@ukef/constants';
import { GraphService } from '@ukef/modules/graph/graph.service';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { resetAllWhenMocks, when } from 'jest-when';

import { TermsService } from './terms.service';

describe('TermsService', () => {
  let service: TermsService;
  let graphService: jest.Mocked<GraphService>;
  let mockGraphServicePost: jest.Mock;
  const valueGenerator = new RandomValueGenerator();
  const facilityId = valueGenerator.facilityId();

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
    graphService = module.get(GraphService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
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

    it('should throw an error when the graphService post method throws an error', async () => {
      const error = new Error('An error occurred');
      when(mockGraphServicePost).calledWith(expect.any(Object)).mockRejectedValue(error);

      await expect(service.postFacilityToTermStore(facilityId)).rejects.toThrow(Error);
      expect(graphService.post).toHaveBeenCalled();
    });
  });
});
