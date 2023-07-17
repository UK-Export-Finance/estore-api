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
  } = new CreateDealFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

  const tfisSharepointUrl = valueGenerator.word();
  const scSharepointUrl = valueGenerator.word();
  const scSiteFullUrl = valueGenerator.httpsUrl();

  const tfisDealListId = valueGenerator.string();
  const tfisCaseSitesListId = valueGenerator.string();
  const taxonomyHiddenListTermStoreListId = valueGenerator.string();

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

  let findListItems: jest.Mock;
  let custodianCreateAndProvision: jest.Mock;
  let service: DealFolderCreationService;

  beforeEach(() => {
    findListItems = jest.fn();
    const sharepointService = new SharepointService(null);
    sharepointService.findListItems = findListItems;

    custodianCreateAndProvision = jest.fn();
    const custodianService = new CustodianService(null);
    custodianService.createAndProvision = custodianCreateAndProvision;

    service = new DealFolderCreationService(
      {
        tfisSharepointUrl,
        scSharepointUrl,
        scSiteFullUrl,

        tfisDealListId,
        tfisCaseSitesListId,
        taxonomyHiddenListTermStoreListId,
      },
      {
        dealTemplateId,
        dealTypeGuid,
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
      whenFindingListItemsMatchingTheBuyerName().mockResolvedValueOnce([buyerNameListItem]);
      whenFindingListItemsMatchingTheExporterName().mockResolvedValueOnce([exporterNameListItem]);
      whenFindingListItemsMatchingTheDestinationMarket().mockResolvedValueOnce([destinationMarketListItem]);
      whenFindingListItemsMatchingTheRiskMarket().mockResolvedValueOnce([riskMarketListItem]);
      whenCreatingTheDealFolderWithCustodian().mockResolvedValueOnce(undefined);

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
      whenFindingListItemsMatchingTheBuyerName().mockResolvedValueOnce([buyerNameListItem]);
      whenFindingListItemsMatchingTheExporterName().mockResolvedValueOnce([exporterNameListItem]);
      whenFindingListItemsMatchingTheDestinationMarket().mockResolvedValueOnce([destinationMarketListItem]);
      whenFindingListItemsMatchingTheRiskMarket().mockResolvedValueOnce([riskMarketListItem]);
      whenCreatingTheDealFolderWithCustodian().mockResolvedValueOnce(undefined);

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
      whenFindingListItemsMatchingTheBuyerName().mockResolvedValueOnce(listItemsMatchingBuyerName);
      whenFindingListItemsMatchingTheExporterName().mockResolvedValueOnce(listItemsMatchingExporterName);
      whenFindingListItemsMatchingTheDestinationMarket().mockResolvedValueOnce(listItemsMatchingDestinationMarket);
      whenFindingListItemsMatchingTheRiskMarket().mockResolvedValueOnce(listItemsMatchingRiskMarket);
      whenCreatingTheDealFolderWithCustodian().mockResolvedValueOnce(undefined);

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

  const whenFindingListItemsMatchingTheBuyerName = (): WhenMockWithMatchers =>
    when(findListItems).calledWith({
      siteUrl: scSharepointUrl,
      listId: tfisDealListId,
      fieldsToReturn: ['id'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'ServerRelativeUrl', targetValue: `/sites/${siteId}/CaseLibrary/${buyerName}` }),
    });

  const whenFindingListItemsMatchingTheExporterName = (): WhenMockWithMatchers =>
    when(findListItems).calledWith({
      siteUrl: tfisSharepointUrl,
      listId: tfisCaseSitesListId,
      fieldsToReturn: ['TermGuid', 'URL'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: exporterName }),
    });

  const whenFindingListItemsMatchingTheDestinationMarket = (): WhenMockWithMatchers =>
    when(findListItems).calledWith({
      siteUrl: scSharepointUrl,
      listId: taxonomyHiddenListTermStoreListId,
      fieldsToReturn: ['TermGuid'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: destinationMarket }),
    });

  const whenFindingListItemsMatchingTheRiskMarket = (): WhenMockWithMatchers =>
    when(findListItems).calledWith({
      siteUrl: scSharepointUrl,
      listId: taxonomyHiddenListTermStoreListId,
      fieldsToReturn: ['TermGuid'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: riskMarket }),
    });

  const whenCreatingTheDealFolderWithCustodian = (): WhenMockWithMatchers =>
    when(custodianCreateAndProvision).calledWith(expectedCustodianRequestToCreateDealFolder);
});
