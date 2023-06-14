import { Controller, Get, InternalServerErrorException, Query, Res } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';

import { GetSiteStatusByExporterNameQueryDto } from './dto/get-site-status-by-exporter-name-query.dto';
import { GetSiteStatusByExporterNameResponse } from './dto/get-site-status-by-exporter-name-response.dto';
import { SiteNotFoundException } from './exception/site-not-found.exception';
import { SiteService } from './site.service';

@Controller('sites')
export class SiteController {
  constructor(private readonly service: SiteService) {}

  @Get()
  @ApiOperation({ summary: 'Get the site status by exporter name' })
  @ApiOkResponse({ description: 'Site has been created', type: GetSiteStatusByExporterNameResponse, isArray: false })
  @ApiAcceptedResponse({ description: 'Site is provisioning', type: GetSiteStatusByExporterNameResponse, isArray: false })
  @ApiResponse({
    status: HttpStatusCode.FailedDependency,
    description: 'Site has failed to be created',
    type: GetSiteStatusByExporterNameResponse,
    isArray: false,
  })
  @ApiNotFoundResponse({ description: 'Site not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'An internal server error has occurred.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  async getSiteStatusByExporterName(@Query() query: GetSiteStatusByExporterNameQueryDto, @Res() res: Response): Promise<void> {
    try {
      const getSiteStatusByExporterNameResponse = await this.service.getSiteStatusByExporterName(query.exporterName);
      if (getSiteStatusByExporterNameResponse.status === 'Failed') {
        res.status(HttpStatusCode.FailedDependency).json(getSiteStatusByExporterNameResponse);
      }
      if (getSiteStatusByExporterNameResponse.status === 'Created') {
        res.status(HttpStatusCode.Ok).json(getSiteStatusByExporterNameResponse);
      }
      if (getSiteStatusByExporterNameResponse.status === 'Provisioning') {
        res.status(HttpStatusCode.Accepted).json(getSiteStatusByExporterNameResponse);
      }
      throw new InternalServerErrorException(`Received unexpected status "${getSiteStatusByExporterNameResponse.status}"`);
    } catch (error) {
      if (error instanceof SiteNotFoundException) {
        res.status(HttpStatusCode.NotFound).json({});
      }
      throw error;
    }
  }
}
