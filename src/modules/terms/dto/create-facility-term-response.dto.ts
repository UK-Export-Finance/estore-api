import { ApiProperty } from '@nestjs/swagger';
import { RESPONSE } from '@ukef/constants';

export class CreateDealResponse {
  @ApiProperty({
    example: RESPONSE.FACILITY_TERM_CREATED,
  })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
