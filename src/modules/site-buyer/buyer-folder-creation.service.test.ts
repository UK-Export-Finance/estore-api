import { CustodianService } from '@ukef/modules/custodian/custodian.service';
import { SharepointService } from '@ukef/modules/sharepoint/sharepoint.service';
import { CreateBuyerFolderGenerator } from '@ukef-test/support/generator/create-buyer-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { BuyerFolderCreationService } from './buyer-folder-creation.service';
import { SiteExporterInvalidException } from './exception/site-exporter-invalid.exception';
import { SiteExporterNotFoundException } from './exception/site-exporter-not-found.exception';

describe('BuyerFolderCreationService', () => {
  const valueGenerator = new RandomValueGenerator();

  const {
    siteId,
    createBuyerFolderRequestItem: { buyerName },
    sharepointServiceGetCaseSiteParams,
    sharepointServiceGetBuyerFolderParams,
    sharepointServiceGetExporterSiteParams,
  } = new CreateBuyerFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

  const scSiteFullUrl = valueGenerator.httpsUrl();

  const exporterSiteIdAsNumber = valueGenerator.nonnegativeInteger();
  const exporterSiteId = exporterSiteIdAsNumber.toString();
  const termGuid = valueGenerator.guid();
  const termUrl = valueGenerator.httpsUrl();
  const siteUrl = valueGenerator.string();

  const buyerTemplateId = valueGenerator.string();
  const buyerTypeGuid = valueGenerator.guid();

  const expectedCustodianRequestToCreateBuyerFolder = {
    Title: buyerName,
    Id: null,
    Code: '',
    TemplateId: buyerTemplateId,
    ParentId: exporterSiteIdAsNumber,
    InterestedParties: '',
    Secure: false,
    DoNotSubscribeInterestedParties: false,
    Links: [],
    FormButton: '',
    Metadata: [
      {
        Name: 'Risk Entity',
        Values: [`${termGuid}||${termUrl}`],
      },
      {
        Name: 'Case Description',
        Values: [null],
      },
    ],
    TypeGuid: buyerTypeGuid,
    SPHostUrl: scSiteFullUrl,
  };

  let getCaseSite: jest.Mock;
  let getBuyerFolder: jest.Mock;
  let getExporterSite: jest.Mock;
  let custodianCreateAndProvision: jest.Mock;
  let service: BuyerFolderCreationService;

  beforeEach(() => {
    getCaseSite = jest.fn();
    getBuyerFolder = jest.fn();
    getExporterSite = jest.fn();
    const sharepointService = new SharepointService(null, null);
    sharepointService.getCaseSite = getCaseSite;
    sharepointService.getBuyerFolder = getBuyerFolder;
    sharepointService.getExporterSite = getExporterSite;

    custodianCreateAndProvision = jest.fn();
    const custodianService = new CustodianService(null);
    custodianService.createAndProvision = custodianCreateAndProvision;

    service = new BuyerFolderCreationService(
      {
        buyerTemplateId,
        buyerTypeGuid,
      },
      {
        scSiteFullUrl,
      },
      sharepointService,
      custodianService,
    );
  });

  const siteIdListItem = { fields: { id: exporterSiteId } };
  const exporterNameListItem = { fields: { TermGuid: termGuid, URL: termUrl, SiteURL: { Url: siteUrl } } };
  const nonNumberId = 'not-a-number';

  describe('createBuyerFolder', () => {
    it('sends a request to Custodian to create and provision the buyer folder', async () => {
      when(getCaseSite).calledWith(sharepointServiceGetCaseSiteParams).mockResolvedValueOnce([siteIdListItem]);
      when(getExporterSite).calledWith(sharepointServiceGetExporterSiteParams).mockResolvedValueOnce([exporterNameListItem]);
      when(getBuyerFolder).calledWith(sharepointServiceGetBuyerFolderParams).mockResolvedValueOnce([]);
      when(custodianCreateAndProvision).calledWith(expectedCustodianRequestToCreateBuyerFolder).mockResolvedValueOnce(undefined);

      await service.createBuyerFolder(siteId, { buyerName });

      expect(custodianCreateAndProvision).toHaveBeenCalledTimes(1);
      expect(custodianCreateAndProvision).toHaveBeenCalledWith(expectedCustodianRequestToCreateBuyerFolder);
    });

    it('returns the buyer name', async () => {
      when(getCaseSite).calledWith(sharepointServiceGetCaseSiteParams).mockResolvedValueOnce([siteIdListItem]);
      when(getExporterSite).calledWith(sharepointServiceGetExporterSiteParams).mockResolvedValueOnce([exporterNameListItem]);
      when(getBuyerFolder).calledWith(sharepointServiceGetBuyerFolderParams).mockResolvedValueOnce([]);
      when(custodianCreateAndProvision).calledWith(expectedCustodianRequestToCreateBuyerFolder).mockResolvedValueOnce(undefined);

      const response = await service.createBuyerFolder(siteId, { buyerName });

      expect(response).toBe(buyerName);
    });

    it('returns the buyer name when buyer folder exists in Sharepoint', async () => {
      when(getCaseSite).calledWith(sharepointServiceGetCaseSiteParams).mockResolvedValueOnce([siteIdListItem]);
      when(getExporterSite).calledWith(sharepointServiceGetExporterSiteParams).mockResolvedValueOnce([exporterNameListItem]);
      when(getBuyerFolder)
        .calledWith(sharepointServiceGetBuyerFolderParams)
        .mockResolvedValueOnce([{ any: 'value' }]);

      const response = await service.createBuyerFolder(siteId, { buyerName });

      expect(response).toBe(buyerName);

      expect(custodianCreateAndProvision).toHaveBeenCalledTimes(0);
    });
  });

  describe('createBuyerFolder exceptions', () => {
    it.each([
      {
        description: 'throws a SiteExporterNotFoundException if the exporter site list item is not found',
        caseSiteListItemsMatchingSiteId: [],
        exporterSiteListItemsMatchingSiteId: [exporterNameListItem],
        expectedErrorClass: SiteExporterNotFoundException,
        expectedErrorMessage: `Did not find the site ${siteId} in the scCaseSitesList.`,
      },
      {
        description: 'throws a SiteExporterInvalidException if the found exporter site list item does not have an id field',
        caseSiteListItemsMatchingSiteId: [{ fields: { notId: exporterSiteId } }],
        exporterSiteListItemsMatchingSiteId: [exporterNameListItem],
        expectedErrorClass: SiteExporterInvalidException,
        expectedErrorMessage: `Missing ID for the site found with id ${siteId}.`,
      },
      {
        description: 'throws a SiteExporterInvalidException if the found exporter site list item has an empty string id field',
        caseSiteListItemsMatchingSiteId: [{ fields: { id: '' } }],
        exporterSiteListItemsMatchingSiteId: [exporterNameListItem],
        expectedErrorClass: SiteExporterInvalidException,
        expectedErrorMessage: `Missing ID for the site found with id ${siteId}.`,
      },
      {
        description: 'throws a SiteExporterInvalidException if the found buyer folder list item has an id field that cannot be parsed as a base-10 number',
        caseSiteListItemsMatchingSiteId: [{ fields: { id: nonNumberId } }],
        exporterSiteListItemsMatchingSiteId: [exporterNameListItem],
        expectedErrorClass: SiteExporterInvalidException,
        expectedErrorMessage: `The ID for the site found for site ${siteId} is not a number (the value is ${nonNumberId}).`,
      },
      {
        description: 'throws a SiteExporterNotFoundException if the siteId is not found in the tfisCaseSitesList',
        caseSiteListItemsMatchingSiteId: [siteIdListItem],
        exporterSiteListItemsMatchingSiteId: [],
        expectedErrorClass: SiteExporterNotFoundException,
        expectedErrorMessage: `Did not find the site for siteId ${siteId} in the tfisCaseSitesList.`,
      },
      {
        description: 'throws a SiteExporterInvalidException if the found exporter list item does not have a TermGuid field',
        caseSiteListItemsMatchingSiteId: [siteIdListItem],
        exporterSiteListItemsMatchingSiteId: [{ fields: { notTermGuid: termGuid, URL: termUrl, SiteURL: { Url: siteUrl } } }],
        expectedErrorClass: SiteExporterInvalidException,
        expectedErrorMessage: `Missing TermGuid for the list item found for exporter site ${siteId}.`,
      },
      {
        description: 'throws a SiteExporterInvalidException if the found exporter list item has an empty string TermGuid field',
        caseSiteListItemsMatchingSiteId: [siteIdListItem],
        exporterSiteListItemsMatchingSiteId: [{ fields: { TermGuid: '', URL: termUrl, SiteURL: { Url: siteUrl } } }],
        expectedErrorClass: SiteExporterInvalidException,
        expectedErrorMessage: `Missing TermGuid for the list item found for exporter site ${siteId}.`,
      },
      {
        description: 'throws a SiteExporterInvalidException if the found exporter list item does not have a URL field',
        caseSiteListItemsMatchingSiteId: [siteIdListItem],
        exporterSiteListItemsMatchingSiteId: [{ fields: { TermGuid: termGuid, notURL: termUrl, SiteURL: { Url: siteUrl } } }],
        expectedErrorClass: SiteExporterInvalidException,
        expectedErrorMessage: `Missing URL for the list item found for exporter site ${siteId}.`,
      },
      {
        description: 'throws a SiteExporterInvalidException if the found exporter list item has an empty string URL field',
        caseSiteListItemsMatchingSiteId: [siteIdListItem],
        exporterSiteListItemsMatchingSiteId: [{ fields: { TermGuid: termGuid, URL: '', SiteURL: { Url: siteUrl } } }],
        expectedErrorClass: SiteExporterInvalidException,
        expectedErrorMessage: `Missing URL for the list item found for exporter site ${siteId}.`,
      },
      {
        description: 'throws a SiteExporterInvalidException if the found exporter list item does not have a SiteURL field',
        caseSiteListItemsMatchingSiteId: [siteIdListItem],
        exporterSiteListItemsMatchingSiteId: [{ fields: { TermGuid: termGuid, URL: termUrl, notSiteURL: { Url: siteUrl } } }] as any,
        expectedErrorClass: SiteExporterInvalidException,
        expectedErrorMessage: `Missing site URL for the list item found for exporter site ${siteId}.`,
      },
      {
        description: 'throws a SiteExporterInvalidException if the found exporter list item does not have a Url field on the SiteURL field',
        caseSiteListItemsMatchingSiteId: [siteIdListItem],
        exporterSiteListItemsMatchingSiteId: [{ fields: { TermGuid: termGuid, URL: termUrl, SiteURL: { notUrl: siteUrl } } }],
        expectedErrorClass: SiteExporterInvalidException,
        expectedErrorMessage: `Missing site URL for the list item found for exporter site ${siteId}.`,
      },
      {
        description: 'throws a SiteExporterInvalidException if the found exporter list item has an empty string Url field on the SiteURL field',
        caseSiteListItemsMatchingSiteId: [siteIdListItem],
        exporterSiteListItemsMatchingSiteId: [{ fields: { TermGuid: termGuid, URL: termUrl, SiteURL: { Url: '' } } }],
        expectedErrorClass: SiteExporterInvalidException,
        expectedErrorMessage: `Missing site URL for the list item found for exporter site ${siteId}.`,
      },
    ])('$description', async ({ caseSiteListItemsMatchingSiteId, exporterSiteListItemsMatchingSiteId, expectedErrorClass, expectedErrorMessage }) => {
      when(getCaseSite).calledWith(sharepointServiceGetCaseSiteParams).mockResolvedValueOnce(caseSiteListItemsMatchingSiteId);
      when(getExporterSite).calledWith(sharepointServiceGetExporterSiteParams).mockResolvedValueOnce(exporterSiteListItemsMatchingSiteId);
      when(custodianCreateAndProvision).calledWith(expectedCustodianRequestToCreateBuyerFolder).mockResolvedValueOnce(undefined);

      const createBuyerFolderPromise = service.createBuyerFolder(siteId, { buyerName });

      await expect(createBuyerFolderPromise).rejects.toBeInstanceOf(expectedErrorClass);
      await expect(createBuyerFolderPromise).rejects.toThrow(expectedErrorMessage);
    });
    // });

    it('throws a SiteExporterInvalidException if the found exporter list item has an empty string Url field on the SiteURL field', async () => {
      when(getCaseSite).calledWith(sharepointServiceGetCaseSiteParams).mockResolvedValueOnce([siteIdListItem]);
      when(getExporterSite).calledWith(sharepointServiceGetExporterSiteParams).mockResolvedValueOnce([exporterNameListItem]);
      when(getBuyerFolder).calledWith(sharepointServiceGetBuyerFolderParams).mockResolvedValueOnce([]);
      when(custodianCreateAndProvision).calledWith(expectedCustodianRequestToCreateBuyerFolder).mockResolvedValueOnce(undefined);

      await service.createBuyerFolder(siteId, { buyerName });

      expect(custodianCreateAndProvision).toHaveBeenCalledTimes(1);
      expect(custodianCreateAndProvision).toHaveBeenCalledWith(expectedCustodianRequestToCreateBuyerFolder);
    });
  });
});
