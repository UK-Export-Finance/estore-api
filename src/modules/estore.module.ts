import { Module } from '@nestjs/common';
import { AuthModule } from '@ukef/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
})
export class EstoreModule {}
