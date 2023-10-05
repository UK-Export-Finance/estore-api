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
    sharepointServiceGetDealFolderParams,
    createFacilityFolderRequestItem: { facilityIdentifier, buyerName },
    sharepointServiceGetFacilityTermParams,
  } = new CreateFacilityFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

  const scSiteFullUrl = valueGenerator.httpsUrl();

  const dealFolderIdAsNumber = valueGenerator.nonnegativeInteger();
  const dealFolderIdAsString = dealFolderIdAsNumber.toString();

  const facilityTermGuid = valueGenerator.guid();

  const facilityTemplateId = valueGenerator.string();
  const facilityTypeGuid = valueGenerator.guid();

  const facilityFolderName = `F ${facilityIdentifier}`;

  const dealFolderName = sharepointServiceGetDealFolderParams.dealFolderName;

  const dealFolderListItem = { fields: { id: dealFolderIdAsString } };

  const nonNumberId = 'not-a-number';

  const facilityTermListItem = { fields: { FacilityGUID: facilityTermGuid, Title: facilityIdentifier } };

  const expectedCustodianRequestToCreateFacilityFolder = {
    Title: facilityFolderName,
    Id: 0,
    Code: '',
    TemplateId: facilityTemplateId,
    ParentId: dealFolderIdAsNumber,
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
  let getFacilityFolder: jest.Mock;
  let custodianCreateAndProvision: jest.Mock;
  let service: FacilityFolderCreationService;

  beforeEach(() => {
    getDealFolder = jest.fn();
    getFacilityTerm = jest.fn();
    getFacilityFolder = jest.fn();
    const sharepointService = new SharepointService(null, null);
    sharepointService.getDealFolder = getDealFolder;
    sharepointService.getFacilityTerm = getFacilityTerm;
    sharepointService.getFacilityFolder = getFacilityFolder;

    custodianCreateAndProvision = jest.fn();
    const custodianService = new CustodianService(null, null, null, null, null);
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

  describe('createFacilityFolder', () => {
    it('sends a request to Custodian to create and provision the facility folder', async () => {
      when(getFacilityTerm).calledWith(sharepointServiceGetFacilityTermParams).mockResolvedValueOnce([facilityTermListItem]);
      when(custodianCreateAndProvision).calledWith(expectedCustodianRequestToCreateFacilityFolder).mockResolvedValueOnce(undefined);

      await service.createFacilityFolder({ facilityIdentifier, buyerName }, dealFolderIdAsNumber, facilityFolderName);

      expect(custodianCreateAndProvision).toHaveBeenCalledTimes(1);
      expect(custodianCreateAndProvision).toHaveBeenCalledWith(expectedCustodianRequestToCreateFacilityFolder);
    });

    it.each([
      {
        description: 'throws a FolderDependencyNotFoundException if the facilityIdentifier is not found in the tfisFacilityHiddenListTermStoreId',
        listItemsMatchingFacilityTerm: [],
        expectedErrorClass: FolderDependencyNotFoundException,
        expectedErrorMessage: `Facility term not found: ${facilityIdentifier}. To create this resource, call POST /terms/facilities.`,
      },
      {
        description: 'throws a FolderDependencyInvalidException if the found facility term list item does not have a FacilityGUID field',
        listItemsMatchingFacilityTerm: [{ fields: { notFacilityGUID: facilityTermGuid, Title: facilityIdentifier } }],
        expectedErrorClass: FolderDependencyInvalidException,
        expectedErrorMessage: `Missing FacilityGUID for facility term ${facilityIdentifier}.`,
      },
      {
        description: 'throws a FolderDependencyInvalidException if the found facility term list item has an empty string FacilityGUID field',
        listItemsMatchingFacilityTerm: [{ fields: { FacilityGUID: '', Title: facilityIdentifier } }],
        expectedErrorClass: FolderDependencyInvalidException,
        expectedErrorMessage: `Missing FacilityGUID for facility term ${facilityIdentifier}.`,
      },
    ])('$description', async ({ listItemsMatchingFacilityTerm, expectedErrorClass, expectedErrorMessage }) => {
      when(getFacilityTerm).calledWith(sharepointServiceGetFacilityTermParams).mockResolvedValueOnce(listItemsMatchingFacilityTerm);
      when(custodianCreateAndProvision).calledWith(expectedCustodianRequestToCreateFacilityFolder).mockResolvedValueOnce(undefined);

      const createFacilityFolderPromise = service.createFacilityFolder({ facilityIdentifier, buyerName }, dealFolderIdAsNumber, facilityFolderName);

      await expect(createFacilityFolderPromise).rejects.toBeInstanceOf(expectedErrorClass);
      await expect(createFacilityFolderPromise).rejects.toThrow(expectedErrorMessage);
    });
  });

  describe('getDealFolderId', () => {
    it('gets deal folder id from sharepoint', async () => {
      when(getDealFolder).calledWith(sharepointServiceGetDealFolderParams).mockResolvedValueOnce([dealFolderListItem]);

      const result = await service.getDealFolderId(siteId, dealFolderName);

      expect(result).toBe(dealFolderIdAsNumber);
    });

    it.each([
      {
        description: 'throws a FolderDependencyNotFoundException if the deal folder list item is not found',
        listItemsMatchingDealFolder: [],
        listItemsMatchingFacilityTerm: [facilityTermListItem],
        listItemsMatchingFacilityFolder: [],
        expectedErrorClass: FolderDependencyNotFoundException,
        expectedErrorMessage: `Site deal folder not found: ${buyerName}/D ${dealId}. Once requested, in normal operation, it will take 5 seconds to create the deal folder.`,
      },
      {
        description: 'throws a FolderDependencyInvalidException if the found deal folder list item does not have an id field',
        listItemsMatchingDealFolder: [{ fields: { notId: dealFolderIdAsString } }],
        listItemsMatchingFacilityTerm: [facilityTermListItem],
        listItemsMatchingFacilityFolder: [],
        expectedErrorClass: FolderDependencyInvalidException,
        expectedErrorMessage: `Missing id for the deal folder ${buyerName}/D ${dealId} in site ${siteId}.`,
      },
      {
        description: 'throws a FolderDependencyInvalidException if the found deal folder list item has an empty string id field',
        listItemsMatchingDealFolder: [{ fields: { id: '' } }],
        listItemsMatchingFacilityTerm: [facilityTermListItem],
        listItemsMatchingFacilityFolder: [],
        expectedErrorClass: FolderDependencyInvalidException,
        expectedErrorMessage: `Missing id for the deal folder ${buyerName}/D ${dealId} in site ${siteId}.`,
      },
      {
        description: 'throws a FolderDependencyInvalidException if the found deal folder list item has an id field that cannot be parsed as a base-10 number',
        listItemsMatchingDealFolder: [{ fields: { id: nonNumberId } }],
        listItemsMatchingFacilityTerm: [facilityTermListItem],
        listItemsMatchingFacilityFolder: [],
        expectedErrorClass: FolderDependencyInvalidException,
        expectedErrorMessage: `The id for the deal folder ${buyerName}/D ${dealId} in site ${siteId} is not a number (the value is ${nonNumberId}).`,
      },
    ])('$description', async ({ listItemsMatchingDealFolder: listItemsMatchingBuyerDealFolder, expectedErrorClass, expectedErrorMessage }) => {
      when(getDealFolder).calledWith(sharepointServiceGetDealFolderParams).mockResolvedValueOnce(listItemsMatchingBuyerDealFolder);

      const getDealFolderIdPromise = service.getDealFolderId(siteId, dealFolderName);

      await expect(getDealFolderIdPromise).rejects.toBeInstanceOf(expectedErrorClass);
      await expect(getDealFolderIdPromise).rejects.toThrow(expectedErrorMessage);
    });
  });
});
