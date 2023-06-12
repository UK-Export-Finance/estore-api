import { Controller, Get, Query } from '@nestjs/common';

import { GetSiteStatusByExporterNameQueryDto } from './dto/get-site-status-by-exporter-name-query.dto';
import { GetSiteStatusByExporterNameResponse } from './dto/get-site-status-by-exporter-name-response.dto';
import { SiteService } from './site.service';

@Controller('sites')
export class SiteController {
  constructor(private readonly service: SiteService) {}

  @Get()
  async getSiteStatusByExporterName(@Query() query: GetSiteStatusByExporterNameQueryDto): Promise<GetSiteStatusByExporterNameResponse> {
    return await this.service.getSiteStatusByExporterName(query.exporterName);
  }
}
