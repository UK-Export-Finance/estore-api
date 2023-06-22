import { Test, TestingModule } from '@nestjs/testing';
import { App as AppUnderTest } from '@ukef/app';
import { MainModule } from '@ukef/main.module';
import { DtfsStorageFileService } from '@ukef/modules/dtfs-storage/dtfs-storage-file.service';
import GraphClientService from '@ukef/modules/graph-client/graph-client.service';

import { MockGraphClientService } from './mocks/graph-client.service.mock';

export class App extends AppUnderTest {
  static async create(): Promise<MockApp> {
    const mockGraphClientService = new MockGraphClientService();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MainModule],
    })
      .overrideProvider(GraphClientService)
      .useValue(mockGraphClientService)
      .overrideProvider(DtfsStorageFileService)
      .useValue(null) // TODO (APIM-138): replace with mock when writing API tests
      .compile();

    const nestApp = moduleFixture.createNestApplication();

    const app = new App(nestApp);

    await nestApp.init();

    return { app, mockGraphClientService };
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
}
