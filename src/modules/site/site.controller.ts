import { Controller, Get, InternalServerErrorException, Post, Query, Res } from '@nestjs/common';
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
import { ENUMS } from '@ukef/constants';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';

import { CreateSiteRequest, CreateSiteRequestItem } from './dto/create-site-request.dto';
import { CreateSiteResponse } from './dto/create-site-response.dto';
import { GetSiteStatusByExporterNameQueryDto } from './dto/get-site-status-by-exporter-name-query.dto';
import { GetSiteStatusByExporterNameResponse } from './dto/get-site-status-by-exporter-name-response.dto';
import { SiteService } from './site.service';

@Controller('sites')
export class SiteController {
  constructor(private readonly service: SiteService) {}

  @Get()
  @ApiOperation({ summary: 'Get the site status by exporter name.' })
  @ApiOkResponse({ description: 'Site has been created.', type: GetSiteStatusByExporterNameResponse, isArray: false })
  @ApiAcceptedResponse({ description: 'Site is provisioning.', type: GetSiteStatusByExporterNameResponse, isArray: false })
  @ApiResponse({
    status: HttpStatusCode.FailedDependency,
    description: 'Site has failed to be created.',
    type: GetSiteStatusByExporterNameResponse,
    isArray: false,
  })
  @ApiNotFoundResponse({ description: 'Site not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiInternalServerErrorResponse({ description: 'An internal server error has occurred.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  async getSiteStatusByExporterName(@Query() query: GetSiteStatusByExporterNameQueryDto, @Res() res: Response): Promise<void> {
    const getSiteStatusByExporterNameResponse = await this.service.getSiteStatusByExporterName(query.exporterName);
    this.setSiteStatusResponse(res, getSiteStatusByExporterNameResponse);
  }

  @Post()
  @ApiOperation({ summary: 'Start creation of new sharepoint site for exporter' })
  @ApiOkResponse({ description: 'Site has been created', type: CreateSiteResponse, isArray: false })
  @ApiAcceptedResponse({ description: 'Site is provisioning', type: CreateSiteResponse, isArray: false })
  @ApiResponse({
    status: HttpStatusCode.FailedDependency,
    description: 'Site has failed to be created',
    type: CreateSiteResponse,
    isArray: false,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'An internal server error has occurred.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  async createSite(@ValidatedArrayBody({ items: CreateSiteRequestItem }) createSiteDto: CreateSiteRequest, @Res() res: Response): Promise<void> {
    const siteStatus = await this.service.createSiteIfDoesNotExist(createSiteDto[0].exporterName);
    this.setSiteStatusResponse(res, siteStatus);
  }

  private setSiteStatusResponse(res, getSiteStatusByExporterNameResponse: GetSiteStatusByExporterNameResponse): void {
    if (getSiteStatusByExporterNameResponse.status === ENUMS.SITE_STATUSES.FAILED) {
      res.status(HttpStatusCode.FailedDependency).json(getSiteStatusByExporterNameResponse);
      return;
    }
    if (getSiteStatusByExporterNameResponse.status === ENUMS.SITE_STATUSES.CREATED) {
      res.status(HttpStatusCode.Ok).json(getSiteStatusByExporterNameResponse);
      return;
    }
    if (getSiteStatusByExporterNameResponse.status === ENUMS.SITE_STATUSES.PROVISIONING) {
      res.status(HttpStatusCode.Accepted).json(getSiteStatusByExporterNameResponse);
      return;
    }
    throw new InternalServerErrorException(`Received unexpected status "${getSiteStatusByExporterNameResponse.status}"`);
  }
}
