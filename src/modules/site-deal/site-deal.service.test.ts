import { SharepointService } from '@ukef/modules/sharepoint/sharepoint.service';
import { CreateFacilityFolderGenerator } from '@ukef-test/support/generator/create-facility-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when, WhenMockWithMatchers } from 'jest-when';

import { CustodianService } from '../custodian/custodian.service';
import { AndListItemFilter } from '../sharepoint/list-item-filter/and.list-item-filter';
import { FieldEqualsListItemFilter } from '../sharepoint/list-item-filter/field-equals.list-item-filter';
import { FieldNotNullListItemFilter } from '../sharepoint/list-item-filter/field-not-null.list-item-filter';
import { SiteDealFolderNotFoundException } from './exception/site-deal-folder-not-found.exception';
import { SiteDealService } from './site-deal.service';

describe('SiteDealService', () => {
  const valueGenerator = new RandomValueGenerator();

  const {
    createFacilityFolderParamsDto: { siteId, dealId },
    createFacilityFolderRequestItem: { facilityIdentifier, buyerName, exporterName },
  } = new CreateFacilityFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

  const tfisSharepointUrl = valueGenerator.word();
  const scSharepointUrl = valueGenerator.word();
  const scSiteFullUrl = valueGenerator.httpsUrl();

  const buyerDealFolderIdAsNumber = valueGenerator.nonnegativeInteger();
  const buyerDealFolderIdAsString = buyerDealFolderIdAsNumber.toString();
  const facilityTermGuid = valueGenerator.guid();

  const tfisFacilityListId = valueGenerator.string();
  const tfisFacilityHiddenListTermStoreId = valueGenerator.string();

  const facilityTemplateId = valueGenerator.string();
  const facilityTypeGuid = valueGenerator.guid();

  const expectedFolderName = `F ${facilityIdentifier}`;

  const buyerDealFolderListItem = { fields: { id: buyerDealFolderIdAsString } };
  const facilityTermListItem = { fields: { FacilityGUID: facilityTermGuid, Title: facilityIdentifier } };
  const nonNumberId = 'not-a-number';

  const expectedCustodianRequestToCreateFacilityFolder = {
    Title: expectedFolderName,
    Id: 0,
    Code: '',
    TemplateId: facilityTemplateId,
    ParentId: buyerDealFolderIdAsNumber,
    InterestedParties: '',
    Secure: false,
    DoNotSubscribeInterestedParties: false,
    Links: [],
    FormButton: '',
    HasAttachments: false,
    Metadata: [
      {
        Name: 'Facility ID',
        Values: [`${facilityTermGuid}||${facilityIdentifier}`],
      },
    ],
    TypeGuid: facilityTypeGuid,
    SPHostUrl: scSiteFullUrl,
  };

  let findListItems: jest.Mock;
  let custodianCreateAndProvision: jest.Mock;
  let service: SiteDealService;

  beforeEach(() => {
    findListItems = jest.fn();
    const sharepointService = new SharepointService(null);
    sharepointService.findListItems = findListItems;

    custodianCreateAndProvision = jest.fn();
    const custodianService = new CustodianService(null);
    custodianService.createAndProvision = custodianCreateAndProvision;

    service = new SiteDealService(
      {
        tfisSharepointUrl,
        scSharepointUrl,
        scSiteFullUrl,

        tfisFacilityListId,
        tfisFacilityHiddenListTermStoreId,
      },
      {
        facilityTemplateId,
        facilityTypeGuid,
      },
      sharepointService,
      custodianService,
    );
  });

  it('sends a request to Custodian to create and provision the deal folder', async () => {
    whenFindingListItemsThatMatchTheBuyerDealFolder().mockResolvedValueOnce([buyerDealFolderListItem]);
    whenFindingListItemsMatchingTheFacilityTerm().mockResolvedValueOnce([facilityTermListItem]);
    whenCreatingTheFacilityFolderWithCustodian().mockResolvedValueOnce(undefined);

    await service.createFacilityFolder(siteId, dealId, {
      facilityIdentifier,
      buyerName,
      exporterName,
    });

    expect(custodianCreateAndProvision).toHaveBeenCalledTimes(1);
    expect(custodianCreateAndProvision).toHaveBeenCalledWith(expectedCustodianRequestToCreateFacilityFolder);
  });

  it.each([
    {
      description: 'throws a SiteDealFolderNotFoundException if the buyer deal folder list item is not found',
      listItemsMatchingBuyerDealFolder: [],
      listItemsMatchingFacilityTerm: [facilityTermListItem],
      expectedErrorClass: SiteDealFolderNotFoundException,
      expectedErrorMessage: `Site deal folder not found: ${buyerName}/D ${dealId}. Once requested, in normal operation, it will take 5 seconds to create the deal folder`,
    },
    {
      description: 'throws a SiteDealFolderNotFoundException if the found buyer deal folder list item does not have an id field',
      listItemsMatchingBuyerDealFolder: [{ fields: { notId: buyerDealFolderIdAsString } }],
      listItemsMatchingFacilityTerm: [facilityTermListItem],
      expectedErrorClass: SiteDealFolderNotFoundException,
      expectedErrorMessage: `Site deal folder not found: ${buyerName}/D ${dealId}. Once requested, in normal operation, it will take 5 seconds to create the deal folder`,
    },
    {
      description: 'throws a SiteDealFolderNotFoundException if the found buyer deal folder list item has an empty string id field',
      listItemsMatchingBuyerDealFolder: [{ fields: { id: '' } }],
      listItemsMatchingFacilityTerm: [facilityTermListItem],
      expectedErrorClass: SiteDealFolderNotFoundException,
      expectedErrorMessage: `Site deal folder not found: ${buyerName}/D ${dealId}. Once requested, in normal operation, it will take 5 seconds to create the deal folder`,
    },
    {
      description:
        'throws a SiteDealFolderNotFoundException if the found buyer deal folder list item has an id field that cannot be parsed as a base-10 number',
      listItemsMatchingBuyerDealFolder: [{ fields: { id: nonNumberId } }],
      listItemsMatchingFacilityTerm: [facilityTermListItem],
      expectedErrorClass: SiteDealFolderNotFoundException,
      expectedErrorMessage: `Site deal folder not found: ${buyerName}/D ${dealId}. Once requested, in normal operation, it will take 5 seconds to create the deal folder`,
    },
    {
      description: 'throws a SiteDealFolderNotFoundException if the facilityIdentifier is not found in the tfisFacilityHiddenListTermStoreId',
      listItemsMatchingBuyerDealFolder: [buyerDealFolderListItem],
      listItemsMatchingFacilityTerm: [],
      expectedErrorClass: SiteDealFolderNotFoundException,
      expectedErrorMessage: `Facility term folder not found: ${facilityIdentifier}. To create this resource, call POST /terms/facility`,
    },
    {
      description: 'throws a SiteDealFolderNotFoundException if the found facility term list item does not have a FacilityGUID field',
      listItemsMatchingBuyerDealFolder: [buyerDealFolderListItem],
      listItemsMatchingFacilityTerm: [{ fields: { notFacilityGUID: facilityTermGuid, Title: facilityIdentifier } }],
      expectedErrorClass: SiteDealFolderNotFoundException,
      expectedErrorMessage: `Facility term folder not found: ${facilityIdentifier}. To create this resource, call POST /terms/facility`,
    },
    {
      description: 'throws a SiteDealFolderNotFoundException if the found facility term list item has an empty string FacilityGUID field',
      listItemsMatchingBuyerDealFolder: [buyerDealFolderListItem],
      listItemsMatchingFacilityTerm: [{ fields: { FacilityGUID: '', Title: facilityIdentifier } }],
      expectedErrorClass: SiteDealFolderNotFoundException,
      expectedErrorMessage: `Facility term folder not found: ${facilityIdentifier}. To create this resource, call POST /terms/facility`,
    },
  ])('$description', async ({ listItemsMatchingBuyerDealFolder, listItemsMatchingFacilityTerm, expectedErrorClass, expectedErrorMessage }) => {
    whenFindingListItemsThatMatchTheBuyerDealFolder().mockResolvedValueOnce(listItemsMatchingBuyerDealFolder);
    whenFindingListItemsMatchingTheFacilityTerm().mockResolvedValueOnce(listItemsMatchingFacilityTerm);
    whenCreatingTheFacilityFolderWithCustodian().mockResolvedValueOnce(undefined);

    const createFacilityFolderPromise = service.createFacilityFolder(siteId, dealId, {
      facilityIdentifier,
      buyerName,
      exporterName,
    });

    await expect(createFacilityFolderPromise).rejects.toBeInstanceOf(expectedErrorClass);
    await expect(createFacilityFolderPromise).rejects.toThrow(expectedErrorMessage);
  });

  const whenFindingListItemsThatMatchTheBuyerDealFolder = (): WhenMockWithMatchers =>
    when(findListItems).calledWith({
      siteUrl: scSharepointUrl,
      listId: tfisFacilityListId,
      fieldsToReturn: ['Title', 'ServerRelativeUrl', 'Code', 'id', 'ParentCode'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'ServerRelativeUrl', targetValue: `/sites/${siteId}/CaseLibrary/${buyerName}/D ${dealId}` }),
    });

  const whenFindingListItemsMatchingTheFacilityTerm = (): WhenMockWithMatchers =>
    when(findListItems).calledWith({
      siteUrl: tfisSharepointUrl,
      listId: tfisFacilityHiddenListTermStoreId,
      fieldsToReturn: ['FacilityGUID', 'Title'],
      filter: new AndListItemFilter(
        new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: facilityIdentifier }),
        new FieldNotNullListItemFilter({ fieldName: 'FacilityGUID' }),
      ),
    });

  const whenCreatingTheFacilityFolderWithCustodian = (): WhenMockWithMatchers =>
    when(custodianCreateAndProvision).calledWith(expectedCustodianRequestToCreateFacilityFolder);
});
