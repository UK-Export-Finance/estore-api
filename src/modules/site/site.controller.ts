import { Controller, Get, Query, Res } from '@nestjs/common';
import { ENUMS } from '@ukef/constants';
import { HttpStatusCode } from 'axios';
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
      if (getSiteStatusByExporterNameResponse.status === ENUMS.SITE_STATUS_CODES.FAILED) {
        res.status(HttpStatusCode.FailedDependency).json(getSiteStatusByExporterNameResponse);
      }
      if (getSiteStatusByExporterNameResponse.status === ENUMS.SITE_STATUS_CODES.CREATED) {
        res.status(HttpStatusCode.Ok).json(getSiteStatusByExporterNameResponse);
      }
      if (getSiteStatusByExporterNameResponse.status === ENUMS.SITE_STATUS_CODES.PROVISIONING) {
        res.status(HttpStatusCode.Accepted).json(getSiteStatusByExporterNameResponse);
      }
    } catch (error) {
      if (error instanceof SiteNotFoundException) {
        res.status(HttpStatusCode.NotFound).json({});
      }
    }
  }
}
