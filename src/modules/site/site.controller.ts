import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';

import { GetSiteStatusByExporterNameQueryDto } from './dto/get-site-status-by-exporter-name-query.dto';
import { SiteNotFoundException } from './exception/site-not-found.exception';
import { SiteService } from './site.service';

@Controller('sites')
export class SiteController {
  constructor(private readonly service: SiteService) {}

  @Get()
  async getSiteStatusByExporterName(@Query() query: GetSiteStatusByExporterNameQueryDto, @Res() res: Response): Promise<void> {
    try {
      const getSiteStatusByExporterNameResponse = await this.service.getSiteStatusByExporterName(query.exporterName);
      if (getSiteStatusByExporterNameResponse.status === 'Failed') {
        res.status(424).json(getSiteStatusByExporterNameResponse);
      }
      if (getSiteStatusByExporterNameResponse.status === 'Created') {
        res.status(200).json(getSiteStatusByExporterNameResponse);
      }
      if (getSiteStatusByExporterNameResponse.status === 'Provisioning') {
        res.status(202).json(getSiteStatusByExporterNameResponse);
      }
    } catch (error) {
      if (error instanceof SiteNotFoundException) {
        res.status(404).json({});
      }
    }
  }
}
