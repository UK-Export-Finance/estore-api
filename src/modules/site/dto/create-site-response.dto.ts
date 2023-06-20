import { ApiResponseProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants/examples.constant';
import { UkefSiteId } from '@ukef/helpers/ukef-id.type';

export class CreateSiteResponse {
  @ApiResponseProperty({ example: EXAMPLES.SITE_ID })
  siteId: UkefSiteId;
  @ApiResponseProperty({ example: EXAMPLES.SITE_STATUS_CODE })
  status: string;
}
