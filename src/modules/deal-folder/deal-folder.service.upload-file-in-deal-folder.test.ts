import { BadRequestException } from '@nestjs/common/exceptions';
import { ENUMS } from '@ukef/constants';
import { DocumentTypeEnum } from '@ukef/constants/enums/document-type';
import { DtfsStorageFileService } from '@ukef/modules/dtfs-storage/dtfs-storage-file.service';
import GraphService from '@ukef/modules/graph/graph.service';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UploadFileInDealFolderGenerator } from '@ukef-test/support/generator/upload-file-in-deal-folder-generator';
import { when, WhenMockWithMatchers } from 'jest-when';

import { DealFolderService } from './deal-folder.service';
import { DocumentTypeMapper } from './document-type-mapper';
import { SharepointService } from '../sharepoint/sharepoint.service';

jest.mock('@ukef/modules/graph/graph.service');

describe('UploadFileInDealFolderService', () => {
  const valueGenerator = new RandomValueGenerator();

  const sharepointBaseUrl = valueGenerator.httpsUrl();
  const ukefSharepointName = `${valueGenerator.word()}.sharepoint.com`;
  const estoreDocumentTypeIdFieldName = valueGenerator.string();
  const ecmsDocumentContentTypeId = valueGenerator.string();

  const {
    uploadFileInDealFolderRequest,
    uploadFileInDealFolderResponse,
    uploadFileInDealFolderParams,
    fileSizeInBytes,
    dtfsStorageFileServiceGetFileSizeResponse,
    dtfsStorageFileServiceGetFileResponse,
    sharepointServiceGetSiteByUkefSiteIdResponse,
    sharepointServiceGetResourcesDriveResponse,
    sharepointServiceUrlToCreateUploadSession,
    sharepointServiceGetListIdResponse,
    sharepointServiceGetItemIdResponse,
    sharepointServiceGetSiteByUkefSiteIdParams,
    sharepointServiceGetResourcesDriveParams,
    sharepointServiceGetResourcesListParams,
    sharepointServiceGetItemsParams,
    sharepointServiceUpdateFileInformationParams,
  } = new UploadFileInDealFolderGenerator(valueGenerator).generate({
    numberToGenerate: 1,
    sharepointBaseUrl,
    ukefSharepointName,
    estoreDocumentTypeIdFieldName,
    ecmsDocumentContentTypeId,
  });

  const [{ fileName, fileLocationPath, buyerName, documentType }] = uploadFileInDealFolderRequest;
  const { dealId, siteId: ukefSiteId } = uploadFileInDealFolderParams;

  const estoreDocumentTypeIdApplication = valueGenerator.string();
  const estoreDocumentTypeIdFinancialStatement = valueGenerator.string();
  const estoreDocumentTypeIdBusinessInformation = valueGenerator.string();

  const updateFileInfoTestInputs = [
    {
      documentType: ENUMS.DOCUMENT_TYPES.EXPORTER_QUESTIONNAIRE,
      documentTitle: 'Supplementary Questionnaire',
      documentTypeId: estoreDocumentTypeIdApplication,
    },
    {
      documentType: ENUMS.DOCUMENT_TYPES.AUDITED_FINANCIAL_STATEMENTS,
      documentTitle: 'Annual Report',
      documentTypeId: estoreDocumentTypeIdFinancialStatement,
    },
    {
      documentType: ENUMS.DOCUMENT_TYPES.YEAR_TO_DATE_MANAGEMENT,
      documentTitle: 'Financial Statement',
      documentTypeId: estoreDocumentTypeIdFinancialStatement,
    },
    {
      documentType: ENUMS.DOCUMENT_TYPES.FINANCIAL_FORECASTS,
      documentTitle: 'Financial Forecast',
      documentTypeId: estoreDocumentTypeIdFinancialStatement,
    },
    {
      documentType: ENUMS.DOCUMENT_TYPES.FINANCIAL_INFORMATION_COMMENTARY,
      documentTitle: 'Financial Commentary',
      documentTypeId: estoreDocumentTypeIdFinancialStatement,
    },
    {
      documentType: ENUMS.DOCUMENT_TYPES.CORPORATE_STRUCTURE,
      documentTitle: 'Corporate Structure Diagram',
      documentTypeId: estoreDocumentTypeIdBusinessInformation,
    },
  ];

  let documentTypeMapperMapDocumentTypeToTitleAndTypeId: jest.Mock;
  let dtfsStorageFileServiceGetFileProperties: jest.Mock;
  let dtfsStorageFileServiceGetFile: jest.Mock;
  let sharepointServiceGetSiteByUkefSiteId: jest.Mock;
  let sharepointServiceGetResources: jest.Mock;
  let sharepointServiceGetItems: jest.Mock;
  let sharepointServiceUploadFile: jest.Mock;
  let sharepointServiceUpdateFileInformation: jest.Mock;
  let service: DealFolderService;

  beforeEach(() => {
    const documentTypeMapper = new DocumentTypeMapper(null);
    documentTypeMapperMapDocumentTypeToTitleAndTypeId = jest.fn();
    documentTypeMapper.mapDocumentTypeToTitleAndTypeId = documentTypeMapperMapDocumentTypeToTitleAndTypeId;

    const dtfsStorageFileService = new DtfsStorageFileService(null);
    dtfsStorageFileServiceGetFileProperties = jest.fn();
    dtfsStorageFileServiceGetFile = jest.fn();
    dtfsStorageFileService.getFileProperties = dtfsStorageFileServiceGetFileProperties;
    dtfsStorageFileService.getFile = dtfsStorageFileServiceGetFile;

    const sharepointService = new SharepointService(null, null);
    sharepointServiceGetSiteByUkefSiteId = jest.fn();
    sharepointServiceGetResources = jest.fn();
    sharepointServiceGetItems = jest.fn();
    sharepointServiceUploadFile = jest.fn();
    sharepointServiceUpdateFileInformation = jest.fn();
    sharepointService.getSiteByUkefSiteId = sharepointServiceGetSiteByUkefSiteId;
    sharepointService.getResources = sharepointServiceGetResources;
    sharepointService.getItems = sharepointServiceGetItems;
    sharepointService.uploadFile = sharepointServiceUploadFile;
    sharepointService.updateFileInformation = sharepointServiceUpdateFileInformation;

    service = new DealFolderService(
      { baseUrl: sharepointBaseUrl, ukefSharepointName, estoreDocumentTypeIdFieldName, ecmsDocumentContentTypeId },
      documentTypeMapper,
      dtfsStorageFileService,
      sharepointService,
    );
  });

  describe('uploadFileInDealFolder', () => {
    it('sends a request to the Sharepoint Service to upload the file', async () => {
      whenGettingTheFileSize().mockResolvedValueOnce(dtfsStorageFileServiceGetFileSizeResponse);
      whenGettingTheFile().mockResolvedValueOnce(dtfsStorageFileServiceGetFileResponse);
      whenGettingTheSharepointSiteId().mockResolvedValueOnce(sharepointServiceGetSiteByUkefSiteIdResponse);
      whenGettingTheDriveId().mockResolvedValueOnce(sharepointServiceGetResourcesDriveResponse);
      whenGettingTheListId().mockResolvedValueOnce(sharepointServiceGetListIdResponse);
      whenGettingTheItemId().mockResolvedValueOnce(sharepointServiceGetItemIdResponse);
      whenMappingTheDocumentType(documentType).mockReturnValueOnce({
        documentTitle: 'Supplementary Questionnaire',
        documentTypeId: estoreDocumentTypeIdApplication,
      });

      await service.uploadFileInDealFolder(fileName, fileLocationPath, dealId, buyerName, ukefSiteId, documentType);

      expect(sharepointServiceUploadFile).toHaveBeenCalledTimes(1);
      expect(sharepointServiceUploadFile).toHaveBeenCalledWith({
        file: dtfsStorageFileServiceGetFileResponse,
        fileSizeInBytes,
        fileName,
        urlToCreateUploadSession: sharepointServiceUrlToCreateUploadSession,
      });
    });

    it.each(updateFileInfoTestInputs)(
      'sends a request to the Sharepoint Service to update the file information when the documentType is "$documentType"',
      async ({ documentType, documentTitle, documentTypeId }) => {
        whenGettingTheFileSize().mockResolvedValueOnce(dtfsStorageFileServiceGetFileSizeResponse);
        whenGettingTheFile().mockResolvedValueOnce(dtfsStorageFileServiceGetFileResponse);
        whenGettingTheSharepointSiteId().mockResolvedValueOnce(sharepointServiceGetSiteByUkefSiteIdResponse);
        whenGettingTheDriveId().mockResolvedValueOnce(sharepointServiceGetResourcesDriveResponse);
        whenGettingTheListId().mockResolvedValueOnce(sharepointServiceGetListIdResponse);
        whenGettingTheItemId().mockResolvedValueOnce(sharepointServiceGetItemIdResponse);
        whenMappingTheDocumentType(documentType).mockReturnValueOnce({ documentTitle, documentTypeId });

        await service.uploadFileInDealFolder(fileName, fileLocationPath, dealId, buyerName, ukefSiteId, documentType);

        const modifiedRequestBodyToUpdateFileInfo = {
          ...sharepointServiceUpdateFileInformationParams,

          requestBodyToUpdateFileInfo: {
            ...sharepointServiceUpdateFileInformationParams.requestBodyToUpdateFileInfo,
            fields: {
              ...sharepointServiceUpdateFileInformationParams.requestBodyToUpdateFileInfo.fields,
              Title: documentTitle,
              [estoreDocumentTypeIdFieldName]: documentTypeId,
            },
          },
        };

        expect(sharepointServiceUpdateFileInformation).toHaveBeenCalledTimes(1);
        expect(sharepointServiceUpdateFileInformation).toHaveBeenCalledWith(modifiedRequestBodyToUpdateFileInfo);
      },
    );

    it('returns the path to the uploaded file', async () => {
      whenGettingTheFileSize().mockResolvedValueOnce(dtfsStorageFileServiceGetFileSizeResponse);
      whenGettingTheFile().mockResolvedValueOnce(dtfsStorageFileServiceGetFileResponse);
      whenGettingTheSharepointSiteId().mockResolvedValueOnce(sharepointServiceGetSiteByUkefSiteIdResponse);
      whenGettingTheDriveId().mockResolvedValueOnce(sharepointServiceGetResourcesDriveResponse);
      whenGettingTheListId().mockResolvedValueOnce(sharepointServiceGetListIdResponse);
      whenGettingTheItemId().mockResolvedValueOnce(sharepointServiceGetItemIdResponse);
      whenMappingTheDocumentType(documentType).mockReturnValueOnce({
        documentTitle: 'Supplementary Questionnaire',
        documentTypeId: estoreDocumentTypeIdApplication,
      });

      const response = await service.uploadFileInDealFolder(fileName, fileLocationPath, dealId, buyerName, ukefSiteId, documentType);

      expect(response).toStrictEqual(uploadFileInDealFolderResponse);
    });

    it('throws a BadRequestException if the file size exceeds the maximum allowed in DTFS', async () => {
      const fileSizeExceedingMax = 12582913;

      whenGettingTheFileSize().mockResolvedValueOnce({ contentLength: fileSizeExceedingMax });
      whenGettingTheFile().mockResolvedValueOnce(dtfsStorageFileServiceGetFileResponse);
      whenGettingTheSharepointSiteId().mockResolvedValueOnce(sharepointServiceGetSiteByUkefSiteIdResponse);
      whenGettingTheDriveId().mockResolvedValueOnce(sharepointServiceGetResourcesDriveResponse);
      whenGettingTheListId().mockResolvedValueOnce(sharepointServiceGetListIdResponse);
      whenGettingTheItemId().mockResolvedValueOnce(sharepointServiceGetItemIdResponse);
      whenMappingTheDocumentType(documentType).mockReturnValueOnce({
        documentTitle: 'Supplementary Questionnaire',
        documentTypeId: estoreDocumentTypeIdApplication,
      });

      const uploadFilePromise = service.uploadFileInDealFolder(fileName, fileLocationPath, dealId, buyerName, ukefSiteId, documentType);

      await expect(uploadFilePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(uploadFilePromise).rejects.toHaveProperty('message', 'Bad request');
    });
  });

  const whenGettingTheFileSize = (): WhenMockWithMatchers => when(dtfsStorageFileServiceGetFileProperties).calledWith(fileName, fileLocationPath);

  const whenGettingTheFile = (): WhenMockWithMatchers => when(dtfsStorageFileServiceGetFile).calledWith(fileName, fileLocationPath);

  const whenGettingTheSharepointSiteId = (): WhenMockWithMatchers =>
    when(sharepointServiceGetSiteByUkefSiteId).calledWith(sharepointServiceGetSiteByUkefSiteIdParams);

  const whenGettingTheDriveId = (): WhenMockWithMatchers => when(sharepointServiceGetResources).calledWith(sharepointServiceGetResourcesDriveParams);

  const whenGettingTheListId = (): WhenMockWithMatchers => when(sharepointServiceGetResources).calledWith(sharepointServiceGetResourcesListParams);

  const whenGettingTheItemId = (): WhenMockWithMatchers => when(sharepointServiceGetItems).calledWith(sharepointServiceGetItemsParams);

  const whenMappingTheDocumentType = (documentType: DocumentTypeEnum): WhenMockWithMatchers =>
    when(documentTypeMapperMapDocumentTypeToTitleAndTypeId).calledWith(documentType);
});
