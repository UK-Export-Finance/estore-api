import { ApiResponseProperty } from '@nestjs/swagger';
import { SiteStatusEnum } from '@ukef/constants/enums/site-status';
import { EXAMPLES } from '@ukef/constants/examples.constant';

export class CreateSiteResponse {
  @ApiResponseProperty({ example: EXAMPLES.SITE_ID })
  siteId: string;

  @ApiResponseProperty({ example: EXAMPLES.SITE_STATUS_CODE, enum: SiteStatusEnum })
  status: SiteStatusEnum;
}
