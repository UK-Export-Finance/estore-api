import { CustodianService } from '@ukef/modules/custodian/custodian.service';
import { FieldEqualsListItemFilter } from '@ukef/modules/sharepoint/list-item-filter/field-equals.list-item-filter';
import { SharepointService } from '@ukef/modules/sharepoint/sharepoint.service';
import { CreateDealFolderGenerator } from '@ukef-test/support/generator/create-deal-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when, WhenMockWithMatchers } from 'jest-when';

import { DealFolderCreationService } from './deal-folder-creation.service';
import { FolderDependencyInvalidException } from './exception/folder-dependency-invalid.exception';
import { FolderDependencyNotFoundException } from './exception/folder-dependency-not-found.exception';

describe('DealFolderCreationService', () => {
  const valueGenerator = new RandomValueGenerator();

  const {
    siteId,
    createDealFolderRequestItem: { dealIdentifier, buyerName, exporterName, destinationMarket, riskMarket },
    sharepointServiceGetBuyerDealFolderParams,
    sharepointServiceGetExporterParams,
    sharepointServiceGetDestinationMarketParams,
    sharepointServiceGetRiskMarketParams,
  } = new CreateDealFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

  const scSiteFullUrl = valueGenerator.httpsUrl();

  const buyerFolderIdAsNumber = valueGenerator.nonnegativeInteger();
  const buyerFolderId = buyerFolderIdAsNumber.toString();
  const exporterTermGuid = valueGenerator.guid();
  const exporterUrl = valueGenerator.httpsUrl();
  const destinationMarketTermGuid = valueGenerator.guid();
  const riskMarketTermGuid = valueGenerator.guid();

  const dealTemplateId = valueGenerator.string();
  const dealTypeGuid = valueGenerator.guid();

  const expectedFolderName = `D ${dealIdentifier}`;

  const expectedCustodianRequestToCreateDealFolder = {
    Title: expectedFolderName,
    Id: 0,
    Code: '',
    TemplateId: dealTemplateId,
    ParentId: buyerFolderIdAsNumber,
    InterestedParties: '',
    Secure: false,
    DoNotSubscribeInterestedParties: false,
    Links: [],
    FormButton: '',
    HasAttachments: false,
    Metadata: [
      {
        Name: 'Deal ID',
        Values: [dealIdentifier],
      },
      {
        Name: 'DestinationMarket',
        Values: [`${destinationMarketTermGuid}||${destinationMarket}`],
      },
      {
        Name: 'RiskMarket',
        Values: [`${riskMarketTermGuid}||${riskMarket}`],
      },
      {
        Name: 'Exporter/Supplier',
        Values: [`${exporterTermGuid}||${exporterUrl}`],
      },
    ],
    TypeGuid: dealTypeGuid,
    SPHostUrl: scSiteFullUrl,
  };

  let getBuyerFolder: jest.Mock;
  let getExporter: jest.Mock;
  let getMarketTerm: jest.Mock;

  let custodianCreateAndProvision: jest.Mock;
  let service: DealFolderCreationService;

  beforeEach(() => {
    getBuyerFolder = jest.fn();
    getExporter = jest.fn();
    getMarketTerm = jest.fn();

    const sharepointService = new SharepointService(null, null);
    sharepointService.getBuyerFolder = getBuyerFolder;
    sharepointService.getExporter = getExporter;
    sharepointService.getMarketTerm = getMarketTerm;

    custodianCreateAndProvision = jest.fn();
    const custodianService = new CustodianService(null);
    custodianService.createAndProvision = custodianCreateAndProvision;

    service = new DealFolderCreationService(
      {
        dealTemplateId,
        dealTypeGuid,
      },
      {
        scSiteFullUrl,
      },
      sharepointService,
      custodianService,
    );
  });

  const buyerNameListItem = { fields: { id: buyerFolderId } };
  const exporterNameListItem = { fields: { TermGuid: exporterTermGuid, URL: exporterUrl } };
  const destinationMarketListItem = { fields: { TermGuid: destinationMarketTermGuid } };
  const riskMarketListItem = { fields: { TermGuid: riskMarketTermGuid } };
  const nonNumberId = 'not-a-number';

  describe('createDealFolder', () => {
    it('sends a request to Custodian to create and provision the deal folder', async () => {
      when(getBuyerFolder).calledWith(sharepointServiceGetBuyerDealFolderParams).mockResolvedValueOnce([buyerNameListItem]);
      when(getExporter).calledWith(sharepointServiceGetExporterParams).mockResolvedValueOnce([exporterNameListItem]);
      when(getMarketTerm).calledWith(sharepointServiceGetDestinationMarketParams).mockResolvedValueOnce([destinationMarketListItem]);
      when(getMarketTerm).calledWith(sharepointServiceGetRiskMarketParams).mockResolvedValueOnce([riskMarketListItem]);
      when(custodianCreateAndProvision).calledWith(expectedCustodianRequestToCreateDealFolder).mockResolvedValueOnce(undefined);

      await service.createDealFolder({
        siteId,
        dealIdentifier,
        buyerName,
        exporterName,
        destinationMarket,
        riskMarket,
      });

      expect(custodianCreateAndProvision).toHaveBeenCalledTimes(1);
      expect(custodianCreateAndProvision).toHaveBeenCalledWith(expectedCustodianRequestToCreateDealFolder);
    });

    it('returns the name of the created deal folder', async () => {
      when(getBuyerFolder).calledWith(sharepointServiceGetBuyerDealFolderParams).mockResolvedValueOnce([buyerNameListItem]);
      when(getExporter).calledWith(sharepointServiceGetExporterParams).mockResolvedValueOnce([exporterNameListItem]);
      when(getMarketTerm).calledWith(sharepointServiceGetDestinationMarketParams).mockResolvedValueOnce([destinationMarketListItem]);
      when(getMarketTerm).calledWith(sharepointServiceGetRiskMarketParams).mockResolvedValueOnce([riskMarketListItem]);
      when(custodianCreateAndProvision).calledWith(expectedCustodianRequestToCreateDealFolder).mockResolvedValueOnce(undefined);

      const createdFolderName = await service.createDealFolder({
        siteId,
        dealIdentifier,
        buyerName,
        exporterName,
        destinationMarket,
        riskMarket,
      });

      expect(createdFolderName).toBe(expectedFolderName);
    });
  });

  it.each([
    {
      description: 'throws a FolderDependencyNotFoundException if the buyer folder list item is not found',
      listItemsMatchingBuyerName: [],
      listItemsMatchingExporterName: [exporterNameListItem],
      listItemsMatchingDestinationMarket: [destinationMarketListItem],
      listItemsMatchingRiskMarket: [riskMarketListItem],
      expectedErrorClass: FolderDependencyNotFoundException,
      expectedErrorMessage: `Did not find a folder for buyer ${buyerName} in site ${siteId}.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found buyer folder list item does not have an id field',
      listItemsMatchingBuyerName: [{ fields: { notId: buyerFolderId } }],
      listItemsMatchingExporterName: [exporterNameListItem],
      listItemsMatchingDestinationMarket: [destinationMarketListItem],
      listItemsMatchingRiskMarket: [riskMarketListItem],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `Missing id for the folder found for ${buyerName} in site ${siteId}.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found buyer folder list item has an empty string id field',
      listItemsMatchingBuyerName: [{ fields: { id: '' } }],
      listItemsMatchingExporterName: [exporterNameListItem],
      listItemsMatchingDestinationMarket: [destinationMarketListItem],
      listItemsMatchingRiskMarket: [riskMarketListItem],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `Missing id for the folder found for ${buyerName} in site ${siteId}.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found buyer folder list item has an id field that cannot be parsed as a base-10 number',
      listItemsMatchingBuyerName: [{ fields: { id: nonNumberId } }],
      listItemsMatchingExporterName: [exporterNameListItem],
      listItemsMatchingDestinationMarket: [destinationMarketListItem],
      listItemsMatchingRiskMarket: [riskMarketListItem],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `The id for the folder found for ${buyerName} in site ${siteId} is not a number (the value is ${nonNumberId}).`,
    },
    {
      description: 'throws a FolderDependencyNotFoundException if the exporterName is not found in the tfisCaseSitesList',
      listItemsMatchingBuyerName: [buyerNameListItem],
      listItemsMatchingExporterName: [],
      listItemsMatchingDestinationMarket: [destinationMarketListItem],
      listItemsMatchingRiskMarket: [riskMarketListItem],
      expectedErrorClass: FolderDependencyNotFoundException,
      expectedErrorMessage: `Did not find the exporterName ${exporterName} in the tfisCaseSitesList.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found exporter list item does not have a TermGuid field',
      listItemsMatchingBuyerName: [buyerNameListItem],
      listItemsMatchingExporterName: [{ fields: { notTermGuid: exporterTermGuid, URL: exporterUrl } }],
      listItemsMatchingDestinationMarket: [destinationMarketListItem],
      listItemsMatchingRiskMarket: [riskMarketListItem],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `Missing TermGuid for the list item found for exporter ${exporterName} in site ${siteId}.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found exporter list item has an empty string TermGuid field',
      listItemsMatchingBuyerName: [buyerNameListItem],
      listItemsMatchingExporterName: [{ fields: { TermGuid: '', URL: exporterUrl } }],
      listItemsMatchingDestinationMarket: [destinationMarketListItem],
      listItemsMatchingRiskMarket: [riskMarketListItem],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `Missing TermGuid for the list item found for exporter ${exporterName} in site ${siteId}.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found exporter list item does not have a URL field',
      listItemsMatchingBuyerName: [buyerNameListItem],
      listItemsMatchingExporterName: [{ fields: { TermGuid: exporterTermGuid, notURL: exporterUrl } }],
      listItemsMatchingDestinationMarket: [destinationMarketListItem],
      listItemsMatchingRiskMarket: [riskMarketListItem],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `Missing URL for the list item found for exporter ${exporterName} in site ${siteId}.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found exporter list item has an empty string URL field',
      listItemsMatchingBuyerName: [buyerNameListItem],
      listItemsMatchingExporterName: [{ fields: { TermGuid: exporterTermGuid, URL: '' } }],
      listItemsMatchingDestinationMarket: [destinationMarketListItem],
      listItemsMatchingRiskMarket: [riskMarketListItem],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `Missing URL for the list item found for exporter ${exporterName} in site ${siteId}.`,
    },
    {
      description: 'throws a FolderDependencyNotFoundException if the destinationMarket is not found in the taxonomyHiddenListTermStore',
      listItemsMatchingBuyerName: [buyerNameListItem],
      listItemsMatchingExporterName: [exporterNameListItem],
      listItemsMatchingDestinationMarket: [],
      listItemsMatchingRiskMarket: [riskMarketListItem],
      expectedErrorClass: FolderDependencyNotFoundException,
      expectedErrorMessage: `Did not find the market ${destinationMarket} in the taxonomyHiddenListTermStore.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found destinationMarket list item does not have a TermGuid field',
      listItemsMatchingBuyerName: [buyerNameListItem],
      listItemsMatchingExporterName: [exporterNameListItem],
      listItemsMatchingDestinationMarket: [{ fields: { notTermGuid: destinationMarketTermGuid } }],
      listItemsMatchingRiskMarket: [riskMarketListItem],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `Missing TermGuid for the market list item found for ${destinationMarket}.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found destinationMarket list item has an empty string TermGuid field',
      listItemsMatchingBuyerName: [buyerNameListItem],
      listItemsMatchingExporterName: [exporterNameListItem],
      listItemsMatchingDestinationMarket: [{ fields: { TermGuid: '' } }],
      listItemsMatchingRiskMarket: [riskMarketListItem],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `Missing TermGuid for the market list item found for ${destinationMarket}.`,
    },
    {
      description: 'throws a FolderDependencyNotFoundException if the riskMarket is not found in the taxonomyHiddenListTermStore',
      listItemsMatchingBuyerName: [buyerNameListItem],
      listItemsMatchingExporterName: [exporterNameListItem],
      listItemsMatchingDestinationMarket: [destinationMarketListItem],
      listItemsMatchingRiskMarket: [],
      expectedErrorClass: FolderDependencyNotFoundException,
      expectedErrorMessage: `Did not find the market ${riskMarket} in the taxonomyHiddenListTermStore.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found riskMarket list item does not have a TermGuid field',
      listItemsMatchingBuyerName: [buyerNameListItem],
      listItemsMatchingExporterName: [exporterNameListItem],
      listItemsMatchingDestinationMarket: [destinationMarketListItem],
      listItemsMatchingRiskMarket: [{ fields: { notTermGuid: riskMarketTermGuid } }],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `Missing TermGuid for the market list item found for ${riskMarket}.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found riskMarket list item has an empty string TermGuid field',
      listItemsMatchingBuyerName: [buyerNameListItem],
      listItemsMatchingExporterName: [exporterNameListItem],
      listItemsMatchingDestinationMarket: [destinationMarketListItem],
      listItemsMatchingRiskMarket: [{ fields: { TermGuid: '' } }],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `Missing TermGuid for the market list item found for ${riskMarket}.`,
    },
  ])(
    '$description',
    async ({
      listItemsMatchingBuyerName,
      listItemsMatchingExporterName,
      listItemsMatchingDestinationMarket,
      listItemsMatchingRiskMarket,
      expectedErrorClass,
      expectedErrorMessage,
    }) => {
      when(getBuyerFolder).calledWith(sharepointServiceGetBuyerDealFolderParams).mockResolvedValueOnce(listItemsMatchingBuyerName);
      when(getExporter).calledWith(sharepointServiceGetExporterParams).mockResolvedValueOnce(listItemsMatchingExporterName);
      when(getMarketTerm).calledWith(sharepointServiceGetDestinationMarketParams).mockResolvedValueOnce(listItemsMatchingDestinationMarket);
      when(getMarketTerm).calledWith(sharepointServiceGetRiskMarketParams).mockResolvedValueOnce(listItemsMatchingRiskMarket);
      when(custodianCreateAndProvision).calledWith(expectedCustodianRequestToCreateDealFolder).mockResolvedValueOnce(undefined);

      const createDealFolderPromise = service.createDealFolder({
        siteId,
        dealIdentifier,
        buyerName,
        exporterName,
        destinationMarket,
        riskMarket,
      });

      await expect(createDealFolderPromise).rejects.toBeInstanceOf(expectedErrorClass);
      await expect(createDealFolderPromise).rejects.toThrow(expectedErrorMessage);
    },
  );
});
