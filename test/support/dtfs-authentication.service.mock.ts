import { DtfsAuthenticationService } from '@ukef/modules/dtfs-authentication/dtfs-authentication.service';

export const getMockDtfsAuthenticationService = (): {
  service: DtfsAuthenticationService;
  getIdToken: jest.Mock;
} => {
  const getIdToken = jest.fn();
  return {
    service: new MockDtfsAuthenticationService(getIdToken),
    getIdToken,
  };
};

class MockDtfsAuthenticationService extends DtfsAuthenticationService {
  readonly getIdToken: () => Promise<string>;

  constructor(getIdToken: jest.Mock) {
    super();
    this.getIdToken = getIdToken;
  }
}
