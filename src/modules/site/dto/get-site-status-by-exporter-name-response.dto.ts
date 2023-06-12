import { ApiResponseProperty } from '@nestjs/swagger';

export class GetSiteStatusByExporterNameResponse {
  @ApiResponseProperty()
  siteName: string;
  status: string;
}
