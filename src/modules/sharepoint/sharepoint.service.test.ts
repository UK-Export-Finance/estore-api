import { SharepointResourceTypeEnum } from '@ukef/constants/enums/sharepoint-resource-type';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { SharepointService, SharepointUploadFileParams } from './sharepoint.service';
import { getMockSharepointConfig } from './sharepoint.test-parts/mock-sharepoint-config.helper';
import { withGetMethodTests } from './sharepoint.test-parts/with-get-method-tests';
import { withPatchMethodTests } from './sharepoint.test-parts/with-patch-method-tests';
import { withPostMethodTests } from './sharepoint.test-parts/with-post-method-tests';
import { withUploadFileMethodTests } from './sharepoint.test-parts/with-upload-file-method-tests';

jest.mock('@ukef/modules/graph/graph.service');

describe('SharepointService', () => {
  const valueGenerator = new RandomValueGenerator();

  const siteId = valueGenerator.ukefSiteId();
  const buyerName = valueGenerator.buyerName();
  const exporterName = valueGenerator.exporterName();
  const marketName = valueGenerator.string();
  const dealFolderName = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const sharepointResourceType = valueGenerator.enumValue<SharepointResourceTypeEnum>(SharepointResourceTypeEnum);
  const listId = valueGenerator.string();
  const url = valueGenerator.httpsUrl();
  const ecmsDocumentContentTypeId = valueGenerator.string();
  const documentTitle = valueGenerator.string();
  const documentStatus = valueGenerator.string();
  const estoreDocumentTypeIdFieldName = valueGenerator.string();
  const documentTypeId = valueGenerator.string();
  const topNumber = valueGenerator.integer();

  const uploadFileRequest: SharepointUploadFileParams = {
    file: valueGenerator.string() as unknown as NodeJS.ReadableStream,
    fileSizeInBytes: valueGenerator.integer(),
    fileName: valueGenerator.string(),
    urlToCreateUploadSession: valueGenerator.httpsUrl(),
  };

  const sharepointConfig = getMockSharepointConfig();

  const methodResponseFromListItem = valueGenerator.string();
  const graphServiceResponse = { value: methodResponseFromListItem };
  const methodResponse = graphServiceResponse;

  describe('sharepoint service methods calling graphService.get', () => {
    const graphServiceGetTestCases = [
      {
        method: 'getSiteByUkefSiteId',
        path: `sites/${sharepointConfig.ukefSharepointName}:/sites/${siteId}`,
        graphServiceResponse,
        methodResponse,
        makeRequest: (sharepointService: SharepointService) => sharepointService.getSiteByUkefSiteId(siteId),
      },
      {
        method: 'getResources',
        path: `sites/${sharepointConfig.ukefSharepointName}:/sites/${siteId}:/${sharepointResourceType}s`,
        graphServiceResponse,
        methodResponse,
        makeRequest: (sharepointService: SharepointService) => sharepointService.getResources({ ukefSiteId: siteId, sharepointResourceType }),
      },
      {
        method: 'getItems',
        path: `sites/${sharepointConfig.ukefSharepointName}:/sites/${siteId}:/lists/${listId}/items`,
        graphServiceResponse,
        methodResponse,
        makeRequest: (sharepointService: SharepointService) => sharepointService.getItems({ ukefSiteId: siteId, listId }),
      },
      {
        method: 'getItems',
        path: `sites/${sharepointConfig.ukefSharepointName}:/sites/${siteId}:/lists/${listId}/items`,
        graphServiceResponse,
        topNumber,
        methodResponse,
        makeRequest: (sharepointService: SharepointService) => sharepointService.getItems({ ukefSiteId: siteId, listId, top: topNumber }),
      },
      {
        method: 'getExporterSite',
        path: `${sharepointConfig.tfisSharepointUrl}/lists/${sharepointConfig.tfisCaseSitesListId}/items`,
        expandString: `fields($select=Title,URL,Sitestatus,TermGuid,SiteURL)`,
        filterString: `fields/Title eq '${exporterName}'`,
        graphServiceResponse,
        methodResponse: methodResponseFromListItem,
        makeRequest: (sharepointService: SharepointService) => sharepointService.getExporterSite(exporterName),
      },
      {
        method: 'getBuyerFolder',
        path: `${sharepointConfig.scSharepointUrl}/lists/${sharepointConfig.tfisDealListId}/items`,
        expandString: 'fields($select=id)',
        filterString: `fields/ServerRelativeUrl eq '/sites/${siteId}/CaseLibrary/${buyerName}'`,
        graphServiceResponse,
        methodResponse: methodResponseFromListItem,
        makeRequest: (sharepointService: SharepointService) => sharepointService.getBuyerFolder({ siteId, buyerName }),
      },
      {
        method: 'getMarketTerm',
        path: `${sharepointConfig.scSharepointUrl}/lists/${sharepointConfig.taxonomyHiddenListTermStoreListId}/items`,
        expandString: 'fields($select=TermGuid)',
        filterString: `fields/Title eq '${marketName}'`,
        graphServiceResponse,
        methodResponse: methodResponseFromListItem,
        makeRequest: (sharepointService: SharepointService) => sharepointService.getMarketTerm(marketName),
      },
      {
        method: 'getDealFolder',
        path: `${sharepointConfig.scSharepointUrl}/lists/${sharepointConfig.tfisFacilityListId}/items`,
        expandString: 'fields($select=Title,ServerRelativeUrl,Code,id,ParentCode)',
        filterString: `fields/ServerRelativeUrl eq '/sites/${siteId}/CaseLibrary/${dealFolderName}'`,
        graphServiceResponse,
        methodResponse: methodResponseFromListItem,
        makeRequest: (sharepointService: SharepointService) => sharepointService.getDealFolder({ siteId, dealFolderName }),
      },
      {
        method: 'getTerm',
        path: `${sharepointConfig.tfisSharepointUrl}/lists/${sharepointConfig.tfisFacilityHiddenListTermStoreId}/items`,
        expandString: 'fields($select=FacilityGUID,Title)',
        filterString: `fields/Title eq '${facilityIdentifier}' and fields/FacilityGUID ne null`,
        graphServiceResponse,
        methodResponse: methodResponseFromListItem,
        makeRequest: (sharepointService: SharepointService) => sharepointService.getFacilityTerm(facilityIdentifier),
      },
      {
        method: 'getCaseSite',
        path: `${sharepointConfig.scSharepointUrl}/lists/${sharepointConfig.scCaseSitesListId}/items`,
        expandString: 'fields($select=id,CustodianSiteURL)',
        filterString: `fields/CustodianSiteURL eq '${siteId}'`,
        graphServiceResponse,
        methodResponse: methodResponseFromListItem,
        makeRequest: (sharepointService: SharepointService) => sharepointService.getCaseSite(siteId),
      },
    ];

    describe.each(graphServiceGetTestCases)('$method', ({ path, expandString, filterString, topNumber, graphServiceResponse, methodResponse, makeRequest }) => {
      withGetMethodTests({
        sharepointConfig,
        path,
        expandString,
        topNumber,
        filterString,
        graphServiceResponse,
        methodResponse,
        makeRequest,
      });
    });
  });

  describe('sharepoint service methods calling graphService.post', () => {
    const graphServicePostTestCases = [
      {
        method: 'postFacilityToTermStore',
        path: `${sharepointConfig.tfisSharepointUrl}/lists/${sharepointConfig.tfisFacilityHiddenListTermStoreId}/items`,
        requestBody: {
          fields: {
            Title: facilityIdentifier,
          },
        },
        graphServiceResponse,
        makeRequest: (sharepointService: SharepointService) => sharepointService.postFacilityToTermStore(facilityIdentifier),
      },
      {
        method: 'createSite',
        path: `${sharepointConfig.tfisSharepointUrl}/lists/${sharepointConfig.tfisCaseSitesListId}/items`,
        requestBody: {
          fields: {
            Title: exporterName,
            URL: siteId,
            HomePage: exporterName,
            Description: exporterName,
          },
        },
        graphServiceResponse,
        makeRequest: (sharepointService: SharepointService) => sharepointService.createSite({ exporterName, newSiteId: siteId }),
      },
    ];

    describe.each(graphServicePostTestCases)('$method', ({ path, requestBody, graphServiceResponse, makeRequest }) => {
      withPostMethodTests({
        sharepointConfig,
        path,
        requestBody,
        graphServiceResponse,
        makeRequest,
      });
    });
  });

  describe('sharepoint service methods calling graphService.patch', () => {
    const graphServicePatchTestCases = [
      {
        method: 'updateFileInformation',
        path: url,
        requestBody: {
          contentType: {
            id: ecmsDocumentContentTypeId,
          },
          fields: {
            Title: documentTitle,
            Document_x0020_Status: documentStatus,
            [estoreDocumentTypeIdFieldName]: documentTypeId,
          },
        },
        graphServiceResponse,
        makeRequest: (sharepointService: SharepointService) =>
          sharepointService.updateFileInformation({
            urlToUpdateFileInfo: url,
            requestBodyToUpdateFileInfo: {
              contentType: {
                id: ecmsDocumentContentTypeId,
              },
              fields: {
                Title: documentTitle,
                Document_x0020_Status: documentStatus,
                [estoreDocumentTypeIdFieldName]: documentTypeId,
              },
            },
          }),
      },
    ];

    describe.each(graphServicePatchTestCases)('$method', ({ path, requestBody, graphServiceResponse, makeRequest }) => {
      withPatchMethodTests({
        sharepointConfig,
        path,
        requestBody,
        graphServiceResponse,
        makeRequest,
      });
    });
  });

  describe('sharepoint service methods calling graphService.uploadFile', () => {
    const graphServiceUploadFileTestCases = [
      {
        method: 'uploadFile',
        requestBody: uploadFileRequest,
        graphServiceResponse,
        makeRequest: (sharepointService: SharepointService) => sharepointService.uploadFile(uploadFileRequest),
      },
    ];

    describe.each(graphServiceUploadFileTestCases)('$method', ({ requestBody, graphServiceResponse, makeRequest }) => {
      withUploadFileMethodTests({
        sharepointConfig,
        requestBody,
        graphServiceResponse,
        makeRequest,
      });
    });
  });
});
