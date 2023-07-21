import { Test, TestingModule } from '@nestjs/testing';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { ENUMS } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { resetAllWhenMocks, when } from 'jest-when';

import { SharepointService } from '../sharepoint/sharepoint.service';
import { TermsFacilityExistsException } from './exception/terms-facility-exists.exception';
import { TermsService } from './terms.service';

describe('TermsService', () => {
  let service: TermsService;
  let sharepointService: jest.Mocked<SharepointService>;
  let mockSharepointPostFacilityToTermStore: jest.Mock;
  const valueGenerator = new RandomValueGenerator();
  const facilityId = valueGenerator.facilityId();

  beforeEach(async () => {
    mockSharepointPostFacilityToTermStore = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TermsService,
        {
          provide: SharepointService,
          useValue: {
            postFacilityToTermStore: mockSharepointPostFacilityToTermStore,
          },
        },
        {
          provide: SharepointConfig.KEY,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TermsService>(TermsService);
    sharepointService = module.get(SharepointService);
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
    it('should call the sharepointService post method and return a success message', async () => {
      when(mockSharepointPostFacilityToTermStore).calledWith(expect.any(String)).mockResolvedValue(undefined);

      const result = await service.postFacilityToTermStore(facilityId);

      expect(sharepointService.postFacilityToTermStore).toHaveBeenCalled();
      expect(result).toStrictEqual({ message: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERM_CREATED });
    });

    it(`should return a success 'Facility Term already exists' message when the sharepointService post method throws a 'TermsFacilityExistsException'`, async () => {
      const termsFacilityExistsException = new TermsFacilityExistsException('An error occurred');
      when(mockSharepointPostFacilityToTermStore).calledWith(expect.any(String)).mockRejectedValue(termsFacilityExistsException);

      const result = await service.postFacilityToTermStore(facilityId);

      expect(sharepointService.postFacilityToTermStore).toHaveBeenCalled();
      expect(result).toStrictEqual({ message: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERMS_EXISTS });
    });

    it('should throw an error when the sharepointService post method throws an unknown error', async () => {
      const error = new Error('An error occurred');
      when(mockSharepointPostFacilityToTermStore).calledWith(expect.any(String)).mockRejectedValue(error);

      await expect(service.postFacilityToTermStore(facilityId)).rejects.toThrow(Error);
      expect(sharepointService.postFacilityToTermStore).toHaveBeenCalled();
    });
  });
});
