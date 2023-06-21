import { UkefSiteId } from '@ukef/helpers/ukef-id.type';
import { when } from 'jest-when';

export class MockMockSiteIdGeneratorService {
  // TODO: APIM-454 temporary helper to be replaced by MDM API POST /numbers.
  newId: jest.Mock<any, any, any>;

  constructor() {
    this.newId = jest.fn();
  }

  mockReturnValue(siteId: UkefSiteId) {
    when(this.newId).calledWith().mockReturnValueOnce(siteId);
    return this;
  }
}
