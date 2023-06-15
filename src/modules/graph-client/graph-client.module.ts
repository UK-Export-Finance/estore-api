import { Module } from '@nestjs/common';

import GraphClientService from './graph-client.service';

@Module({
  imports: [],
  providers: [GraphClientService],
  exports: [GraphClientService],
})
export class GraphClientModule {}
