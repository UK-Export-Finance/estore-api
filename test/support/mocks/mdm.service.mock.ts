import { UkefSiteId } from '@ukef/helpers/ukef-id.type';
import { MdmException } from '@ukef/modules/mdm/exception/mdm.exception';
import { when } from 'jest-when';

export class MockMdmService {
  createNumbers: jest.Mock<any, any, any>;

  constructor() {
    this.createNumbers = jest.fn();
  }

  mockSuccessfulReturnValue(siteId: UkefSiteId) {
    when(this.createNumbers)
      .calledWith(expect.anything())
      .mockReturnValueOnce([{ maskedId: siteId }]);
  }

  mockMdMCallError() {
    when(this.createNumbers).calledWith(expect.anything()).mockRejectedValueOnce(new MdmException('Failed to create numbers in MDM.'));
    return this;
  }
}
