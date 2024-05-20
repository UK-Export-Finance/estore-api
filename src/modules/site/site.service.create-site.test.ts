import { ENUMS } from '@ukef/constants';
import { MdmService } from '@ukef/modules/mdm/mdm.service';
import { CreateSiteGenerator } from '@ukef-test/support/generator/create-site-generator';
import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { resetAllWhenMocks, when } from 'jest-when';

import { SharepointService } from '../sharepoint/sharepoint.service';
import { CreateSiteResponse } from './dto/create-site-response.dto';
import { SiteService } from './site.service';

jest.mock('@ukef/modules/graph/graph.service');

describe('SiteService', () => {
  const valueGenerator = new RandomValueGenerator();

  const tfisSharepointUrl = valueGenerator.word() + '.sharepoint.com';
  const tfisCaseSitesListId = valueGenerator.word();

  let siteService: SiteService;
  let sharepointServiceCreateSiteRequest: jest.Mock;
  let sharepointServiceGetExportSiteByNameRequest: jest.Mock;
  let mdmServiceCreateNumbers: jest.Mock;

  beforeEach(() => {
    const sharepointService = new SharepointService(null, null);
    sharepointServiceCreateSiteRequest = jest.fn();
    sharepointService.createSite = sharepointServiceCreateSiteRequest;

    sharepointServiceGetExportSiteByNameRequest = jest.fn();
    sharepointService.getExporterSiteByName = sharepointServiceGetExportSiteByNameRequest;
    const mdmService = new MdmService(null);
    mdmServiceCreateNumbers = jest.fn();
    mdmService.createNumbers = mdmServiceCreateNumbers;
    siteService = new SiteService(sharepointService, mdmService);
    resetAllWhenMocks();
  });

  describe('createSite', () => {
    it('calls sharepoint.createSite and returns new site id and status from the service', async () => {
      const { siteServiceGetSiteStatusByExporterNameRequest, sharepointServiceGetExporterSiteParams } = new getSiteStatusByExporterNameGenerator(
        valueGenerator,
      ).generate({
        numberToGenerate: 1,
        tfisSharepointUrl,
        tfisCaseSitesListId,
      });

      const exporterName = siteServiceGetSiteStatusByExporterNameRequest;

      const { createSiteResponse, sharepointServiceCreateSiteParams, graphCreateSiteResponseDto, requestToCreateSiteId } = new CreateSiteGenerator(
        valueGenerator,
      ).generate({
        numberToGenerate: 1,
        tfisSharepointUrl,
        tfisCaseSitesListId,
        exporterName,
      });

      const [{ siteId }] = createSiteResponse;
      when(sharepointServiceGetExportSiteByNameRequest).calledWith(sharepointServiceGetExporterSiteParams).mockResolvedValueOnce([]);
      when(mdmServiceCreateNumbers)
        .calledWith(requestToCreateSiteId)
        .mockResolvedValueOnce([{ maskedId: siteId }]);
      when(sharepointServiceCreateSiteRequest).calledWith(sharepointServiceCreateSiteParams[0]).mockResolvedValueOnce(graphCreateSiteResponseDto[0]);

      const response = await siteService.createSiteIfDoesNotExist(exporterName);

      expect(sharepointServiceCreateSiteRequest).toHaveBeenCalledTimes(1);
      expect(mdmServiceCreateNumbers).toHaveBeenCalledTimes(1);
      expect(response).toEqual(createSiteResponse[0]);
    });

    it.each([
      {
        status: ENUMS.SITE_STATUSES.FAILED,
      },
      {
        status: ENUMS.SITE_STATUSES.PROVISIONING,
      },
      {
        status: ENUMS.SITE_STATUSES.CREATED,
      },
    ])('returns expected status and siteId if site status is "$status"', async ({ status }) => {
      const {
        siteServiceGetSiteStatusByExporterNameRequest: exporterName,
        sharepointServiceGetExporterSiteParams,
        sharepointServiceGetExporterSiteResponse,
        siteStatusByExporterNameResponse,
      } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({
        numberToGenerate: 1,
        tfisSharepointUrl,
        tfisCaseSitesListId,
        status,
      });
      when(sharepointServiceGetExportSiteByNameRequest)
        .calledWith(sharepointServiceGetExporterSiteParams)
        .mockResolvedValueOnce(sharepointServiceGetExporterSiteResponse);

      const response: CreateSiteResponse = await siteService.createSiteIfDoesNotExist(exporterName);

      expect(sharepointServiceCreateSiteRequest).toHaveBeenCalledTimes(0);
      expect(mdmServiceCreateNumbers).toHaveBeenCalledTimes(0);
      expect(response).toEqual(siteStatusByExporterNameResponse);
    });
  });
});
