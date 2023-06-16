import { Module } from '@nestjs/common';
import { DtfsModule } from '@ukef/modules/dtfs/dtfs.module';

import { FileService } from './file.service';
import { TemporaryFileCheckController } from './temporary-file-check.controller';

@Module({
  imports: [DtfsModule],
  controllers: [TemporaryFileCheckController],
  providers: [FileService],
})
export class TemporaryFileCheckModule {}
