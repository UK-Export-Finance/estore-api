import { CustodianService } from '@ukef/modules/custodian/custodian.service';
import { SharepointService } from '@ukef/modules/sharepoint/sharepoint.service';
import { CreateFacilityFolderGenerator } from '@ukef-test/support/generator/create-facility-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FolderDependencyInvalidException } from './exception/folder-dependency-invalid.exception';
import { FolderDependencyNotFoundException } from './exception/folder-dependency-not-found.exception';
import { FacilityFolderCreationService } from './facility-folder-creation.service';

describe('FacilityFolderCreationService', () => {
  const valueGenerator = new RandomValueGenerator();

  const {
    createFacilityFolderParamsDto: { siteId, dealId },
    createFacilityFolderRequestItem: { facilityIdentifier, buyerName },
    sharepointServiceGetDealFolderParams,
    sharepointServiceGetFacilityTermParams,
  } = new CreateFacilityFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

  const scSiteFullUrl = valueGenerator.httpsUrl();

  const buyerDealFolderIdAsNumber = valueGenerator.nonnegativeInteger();
  const buyerDealFolderIdAsString = buyerDealFolderIdAsNumber.toString();
  const facilityTermGuid = valueGenerator.guid();

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

  let getDealFolder: jest.Mock;
  let getFacilityTerm: jest.Mock;
  let custodianCreateAndProvision: jest.Mock;
  let service: FacilityFolderCreationService;

  beforeEach(() => {
    getDealFolder = jest.fn();
    getFacilityTerm = jest.fn();
    const sharepointService = new SharepointService(null, null);
    sharepointService.getDealFolder = getDealFolder;
    sharepointService.getFacilityTerm = getFacilityTerm;

    custodianCreateAndProvision = jest.fn();
    const custodianService = new CustodianService(null);
    custodianService.createAndProvision = custodianCreateAndProvision;

    service = new FacilityFolderCreationService(
      {
        facilityTemplateId,
        facilityTypeGuid,
      },
      {
        scSiteFullUrl,
      },
      sharepointService,
      custodianService,
    );
  });

  it('sends a request to Custodian to create and provision the facility folder', async () => {
    when(getDealFolder).calledWith(sharepointServiceGetDealFolderParams).mockResolvedValueOnce([buyerDealFolderListItem]);
    when(getFacilityTerm).calledWith(sharepointServiceGetFacilityTermParams).mockResolvedValueOnce([facilityTermListItem]);
    when(custodianCreateAndProvision).calledWith(expectedCustodianRequestToCreateFacilityFolder).mockResolvedValueOnce(undefined);

    await service.createFacilityFolder(siteId, dealId, {
      facilityIdentifier,
      buyerName,
    });

    expect(custodianCreateAndProvision).toHaveBeenCalledTimes(1);
    expect(custodianCreateAndProvision).toHaveBeenCalledWith(expectedCustodianRequestToCreateFacilityFolder);
  });

  it.each([
    {
      description: 'throws a FolderDependencyNotFoundException if the buyer deal folder list item is not found',
      listItemsMatchingBuyerDealFolder: [],
      listItemsMatchingFacilityTerm: [facilityTermListItem],
      expectedErrorClass: FolderDependencyNotFoundException,
      expectedErrorMessage: `Site deal folder not found: ${buyerName}/D ${dealId}. Once requested, in normal operation, it will take 5 seconds to create the deal folder.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found buyer deal folder list item does not have an id field',
      listItemsMatchingBuyerDealFolder: [{ fields: { notId: buyerDealFolderIdAsString } }],
      listItemsMatchingFacilityTerm: [facilityTermListItem],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `Missing id for the deal folder ${buyerName}/D ${dealId} in site ${siteId}.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found buyer deal folder list item has an empty string id field',
      listItemsMatchingBuyerDealFolder: [{ fields: { id: '' } }],
      listItemsMatchingFacilityTerm: [facilityTermListItem],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `Missing id for the deal folder ${buyerName}/D ${dealId} in site ${siteId}.`,
    },
    {
      description:
        'throws a FolderDependencyInvalidException if the found buyer deal folder list item has an id field that cannot be parsed as a base-10 number',
      listItemsMatchingBuyerDealFolder: [{ fields: { id: nonNumberId } }],
      listItemsMatchingFacilityTerm: [facilityTermListItem],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `The id for the deal folder ${buyerName}/D ${dealId} in site ${siteId} is not a number (the value is ${nonNumberId}).`,
    },
    {
      description: 'throws a FolderDependencyNotFoundException if the facilityIdentifier is not found in the tfisFacilityHiddenListTermStoreId',
      listItemsMatchingBuyerDealFolder: [buyerDealFolderListItem],
      listItemsMatchingFacilityTerm: [],
      expectedErrorClass: FolderDependencyNotFoundException,
      expectedErrorMessage: `Facility term not found: ${facilityIdentifier}. To create this resource, call POST /terms/facilities.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found facility term list item does not have a FacilityGUID field',
      listItemsMatchingBuyerDealFolder: [buyerDealFolderListItem],
      listItemsMatchingFacilityTerm: [{ fields: { notFacilityGUID: facilityTermGuid, Title: facilityIdentifier } }],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `Missing FacilityGUID for facility term ${facilityIdentifier}.`,
    },
    {
      description: 'throws a FolderDependencyInvalidException if the found facility term list item has an empty string FacilityGUID field',
      listItemsMatchingBuyerDealFolder: [buyerDealFolderListItem],
      listItemsMatchingFacilityTerm: [{ fields: { FacilityGUID: '', Title: facilityIdentifier } }],
      expectedErrorClass: FolderDependencyInvalidException,
      expectedErrorMessage: `Missing FacilityGUID for facility term ${facilityIdentifier}.`,
    },
  ])('$description', async ({ listItemsMatchingBuyerDealFolder, listItemsMatchingFacilityTerm, expectedErrorClass, expectedErrorMessage }) => {
    when(getDealFolder).calledWith(sharepointServiceGetDealFolderParams).mockResolvedValueOnce(listItemsMatchingBuyerDealFolder);
    when(getFacilityTerm).calledWith(sharepointServiceGetFacilityTermParams).mockResolvedValueOnce(listItemsMatchingFacilityTerm);
    when(custodianCreateAndProvision).calledWith(expectedCustodianRequestToCreateFacilityFolder).mockResolvedValueOnce(undefined);

    const createFacilityFolderPromise = service.createFacilityFolder(siteId, dealId, {
      facilityIdentifier,
      buyerName,
    });

    await expect(createFacilityFolderPromise).rejects.toBeInstanceOf(expectedErrorClass);
    await expect(createFacilityFolderPromise).rejects.toThrow(expectedErrorMessage);
  });
});
