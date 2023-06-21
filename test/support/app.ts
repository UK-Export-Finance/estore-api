import { Test, TestingModule } from '@nestjs/testing';
import { App as AppUnderTest } from '@ukef/app';
import { MainModule } from '@ukef/main.module';
import GraphClientService from '@ukef/modules/graph-client/graph-client.service';
import { MockSiteIdGeneratorService } from '@ukef/modules/site/mockSiteIdGeneratorService';

import { MockGraphClientService } from './mocks/graph-client.service.mock';
import { MockMockSiteIdGeneratorService } from './mocks/mockSiteIdGenerator.service.mock';

export class App extends AppUnderTest {
  mockGraphClientService: MockGraphClientService;
  static async create(): Promise<MockApp> {
    const mockGraphClientService = new MockGraphClientService();
    const mockMockSiteIdGeneratorService = new MockMockSiteIdGeneratorService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MainModule],
    })
      .overrideProvider(GraphClientService)
      .useValue(mockGraphClientService)
      .overrideProvider(MockSiteIdGeneratorService)
      .useValue(mockMockSiteIdGeneratorService)
      .compile();

    const nestApp = moduleFixture.createNestApplication();

    const app = new App(nestApp);

    await nestApp.init();

    return { app, mockGraphClientService, mockMockSiteIdGeneratorService };
  }

  getGraphClientServiceMock(): MockGraphClientService {
    return this.mockGraphClientService;
  }

  getHttpServer(): any {
    return this.app.getHttpServer();
  }

  destroy(): Promise<void> {
    return this.app.close();
  }
}

export interface MockApp {
  app: App;
  mockGraphClientService: MockGraphClientService;
  mockMockSiteIdGeneratorService: MockMockSiteIdGeneratorService;
}
