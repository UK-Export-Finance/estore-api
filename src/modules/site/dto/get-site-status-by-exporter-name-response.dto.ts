import { ApiResponseProperty } from '@nestjs/swagger';

export class GetSiteStatusByExporterNameResponse {
  @ApiResponseProperty()
  siteId: string;
  status: string;
}
