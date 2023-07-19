import { Test, TestingModule } from '@nestjs/testing';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { ENUMS } from '@ukef/constants';
import { GraphService } from '@ukef/modules/graph/graph.service';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { resetAllWhenMocks, when } from 'jest-when';

import { TermsFacilityExistsException } from './exception/terms-facility-exists.exception';
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

  // TODO apim-472: update these tests
  describe('postFacilityToTermStore', () => {
    it('should call the graphService post method and return a success message', async () => {
      when(mockGraphServicePost).calledWith(expect.any(Object)).mockResolvedValue(undefined);

      const result = await service.postFacilityToTermStore(facilityId);

      expect(graphService.post).toHaveBeenCalled();
      expect(result).toStrictEqual({ message: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERM_CREATED });
    });

    it(`should return a success 'Facility Term already exists' message when the graphService post method throws a 'TermsFacilityExistsException'`, async () => {
      const termsFacilityExistsException = new TermsFacilityExistsException('An error occurred');
      when(mockGraphServicePost).calledWith(expect.any(Object)).mockRejectedValue(termsFacilityExistsException);

      const result = await service.postFacilityToTermStore(facilityId);

      expect(graphService.post).toHaveBeenCalled();
      expect(result).toStrictEqual({ message: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERMS_EXISTS });
    });

    it('should throw an error when the graphService post method throws an unknown error', async () => {
      const error = new Error('An error occurred');
      when(mockGraphServicePost).calledWith(expect.any(Object)).mockRejectedValue(error);

      await expect(service.postFacilityToTermStore(facilityId)).rejects.toThrow(Error);
      expect(graphService.post).toHaveBeenCalled();
    });
  });
});
