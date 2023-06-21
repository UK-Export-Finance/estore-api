import { Injectable } from '@nestjs/common';

@Injectable()
export class MockSiteIdGeneratorService {
  // TODO: APIM-454 temporary helper to be replaced by MDM API POST /numbers.
  newId() {
    return '0070' + (Math.round(Math.random() * 8999) + 1000).toString();
  }
}
