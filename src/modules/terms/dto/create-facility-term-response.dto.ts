import { ApiProperty } from '@nestjs/swagger';
import { ENUMS } from '@ukef/constants';
import { CreateTermForFacilityResponseEnum } from '@ukef/constants/enums/create-term-for-facility-response';

export class CreateTermFacilityResponse {
  @ApiProperty({
    example: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERM_CREATED,
    description: `Response for successful call is always "${ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERM_CREATED}"`,
    enum: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES,
  })
  message: CreateTermForFacilityResponseEnum;
}
