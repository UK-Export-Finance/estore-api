import { ApiResponseProperty } from '@nestjs/swagger';
import { SiteStatusEnum } from '@ukef/constants/enums/site-status';
import { EXAMPLES } from '@ukef/constants/examples.constant';
import { UkefSiteId } from '@ukef/helpers/ukef-id.type';

export class GetSiteStatusByExporterNameResponse {
  @ApiResponseProperty({ example: EXAMPLES.SITE_ID })
  siteId: UkefSiteId;
  @ApiResponseProperty({ example: EXAMPLES.SITE_STATUS_CODE, enum: SiteStatusEnum })
  status: SiteStatusEnum;
}