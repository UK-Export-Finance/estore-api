// TODO APIM-136: Add tests for site-deal.service.ts following merging of APIM-136
describe('SiteDealService', () => {
  it('calls custodianService.createAndProvision with the expected parameters and returns the response if previous requests succeed', () => {});

  it('uses the parentFolderId from the parent folder request in the createCustodianCreateAndProvisionRequest', () => {});

  it('creates the facility folder name form the facility identifier', () => {});

  it('creates the parent folder name form the buyer name and deal id', () => {});

  it('calls parentFolderData with the expected parameters', () => {});

  it('throws a SiteDealFolderNotFoundException if no values are returned when getting parentFolderData', () => {});

  it('throws a SiteDealException if there is no id present when getting parentFolderData', () => {});

  it('calls facilityTermData with the expected parameters', () => {});

  it('throws a SiteDealNotFoundException if no values are returned when getting facilityTermData', () => {});

  it('throws a SiteDealException if there is no facilityGUID present when getting facilityTermData', () => {});
});
