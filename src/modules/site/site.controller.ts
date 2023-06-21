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
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';

import { CreateSiteRequest, CreateSiteRequestItem } from './dto/create-site-request.dto';
import { CreateSiteResponse } from './dto/create-site-response.dto';
import { GetSiteStatusByExporterNameQueryDto } from './dto/get-site-status-by-exporter-name-query.dto';
import { GetSiteStatusByExporterNameResponse } from './dto/get-site-status-by-exporter-name-response.dto';
import { SiteNotFoundException } from './exception/site-not-found.exception';
import { MockSiteIdGeneratorService } from './mockSiteIdGeneratorService';
import { SiteService } from './site.service';

@Controller('sites')
export class SiteController {
  constructor(private readonly service: SiteService, private readonly mockSiteIdGeneratorService: MockSiteIdGeneratorService) {}

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
      this.setGetSiteExpressResponse(res, getSiteStatusByExporterNameResponse);
    } catch (error) {
      if (error instanceof SiteNotFoundException) {
        res.status(HttpStatusCode.NotFound).json({});
        return;
      }
      throw error;
    }
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
    const exporterName = createSiteDto[0].exporterName;
    try {
      const existingSite = await this.service.getSiteStatusByExporterName(exporterName);
      this.setGetSiteExpressResponse(res, existingSite);
    } catch (error) {
      if (error instanceof SiteNotFoundException) {
        // Site doesn't exists, add item to sharepoint create site list.
        const siteId = this.mockSiteIdGeneratorService.newId();
        const createSiteResponse = await this.service.createSite(exporterName, siteId);
        res.status(HttpStatusCode.Accepted).json(createSiteResponse);
        return;
      }
      throw error;
    }
  }

  private setGetSiteExpressResponse(res, getSiteStatusByExporterNameResponse: GetSiteStatusByExporterNameResponse): void {
    if (getSiteStatusByExporterNameResponse.status === 'Failed') {
      res.status(HttpStatusCode.FailedDependency).json(getSiteStatusByExporterNameResponse);
      return;
    }
    if (getSiteStatusByExporterNameResponse.status === 'Created') {
      res.status(HttpStatusCode.Ok).json(getSiteStatusByExporterNameResponse);
      return;
    }
    if (getSiteStatusByExporterNameResponse.status === 'Provisioning') {
      res.status(HttpStatusCode.Accepted).json(getSiteStatusByExporterNameResponse);
      return;
    }
    throw new InternalServerErrorException(`Received unexpected status "${getSiteStatusByExporterNameResponse.status}"`);
  }
}
