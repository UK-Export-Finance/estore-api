import { ApiResponseProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants/examples.constant';

export class GetSiteStatusByExporterNameResponse {
  @ApiResponseProperty({example: EXAMPLES.SITE_ID})
  siteId: string;
  @ApiResponseProperty({example: EXAMPLES.SITE_STATUS_CODE})
  status: string;
}