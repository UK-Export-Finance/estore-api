import { ApiResponseProperty } from '@nestjs/swagger';
import { SiteStatusCodeEnum } from '@ukef/constants/enums/site-status-code';

export class GetSiteStatusByExporterNameResponse {
  @ApiResponseProperty()
  siteId: string;
  status: SiteStatusCodeEnum;
}
