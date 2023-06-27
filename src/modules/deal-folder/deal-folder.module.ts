import { Module } from '@nestjs/common';

import { DealFolderController } from './deal-folder.controller';

@Module({
  imports: [],
  controllers: [DealFolderController],
  providers: [],
  exports: [],
})
export class DealFolderModule {}
