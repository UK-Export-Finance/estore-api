import { Test, TestingModule } from '@nestjs/testing';
import { App as AppUnderTest } from '@ukef/app';
import { MainModule } from '@ukef/main.module';
import DtfsStorageClientService from '@ukef/modules/dtfs-storage-client/dtfs-storage-client.service';
import GraphClientService from '@ukef/modules/graph-client/graph-client.service';

import { MockDtfsStorageClientService } from './mocks/dtfs-storage-client.service.mock';
import { MockGraphClientService } from './mocks/graph-client.service.mock';

export class App extends AppUnderTest {
  mockGraphClientService: MockGraphClientService;
  static async create(): Promise<MockApp> {
    const mockGraphClientService = new MockGraphClientService();
    const mockDtfsStorageClientService = new MockDtfsStorageClientService();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MainModule],
    })
      .overrideProvider(GraphClientService)
      .useValue(mockGraphClientService)
      .overrideProvider(DtfsStorageClientService)
      .useValue(mockDtfsStorageClientService)
      .compile();

    const nestApp = moduleFixture.createNestApplication();

    const app = new App(nestApp);

    await nestApp.init();

    return { app, mockGraphClientService, mockDtfsStorageClientService };
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
  mockDtfsStorageClientService: MockDtfsStorageClientService;
}
