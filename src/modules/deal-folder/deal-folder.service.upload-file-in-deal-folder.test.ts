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

jest.mock('@ukef/modules/graph/graph.service');

describe('UploadFileInDealFolderService', () => {
  const valueGenerator = new RandomValueGenerator();

  const sharepointBaseUrl = valueGenerator.httpsUrl();
  const ukefSharepointName = `${valueGenerator.word()}.sharepoint.com`;
  const estoreDocumentTypeIdFieldName = valueGenerator.string();

  const {
    uploadFileInDealFolderRequest,
    uploadFileInDealFolderResponse,
    uploadFileInDealFolderParams,
    fileSizeInBytes,
    getFileSizeResponse,
    file,
    getSharepointSiteIdPath,
    getSharepointSiteIdResponse,
    getDriveIdPath,
    getDriveIdResponse,
    urlToCreateUploadSession,
    getListIdPath,
    getListIdResponse,
    getItemIdPath,
    getItemIdResponse,
    updateFileInfoPath,
    requestBodyToUpdateFileInfo,
  } = new UploadFileInDealFolderGenerator(valueGenerator).generate({
    numberToGenerate: 1,
    sharepointBaseUrl,
    ukefSharepointName,
    estoreDocumentTypeIdFieldName,
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

  let mapDocumentTypeToTitleAndTypeId: jest.Mock;
  let getFileProperties: jest.Mock;
  let getFile: jest.Mock;
  let graphServiceGet: jest.Mock;
  let uploadFile: jest.Mock;
  let graphServicePatch: jest.Mock;
  let service: DealFolderService;

  beforeEach(() => {
    const documentTypeMapper = new DocumentTypeMapper(null);
    mapDocumentTypeToTitleAndTypeId = jest.fn();
    documentTypeMapper.mapDocumentTypeToTitleAndTypeId = mapDocumentTypeToTitleAndTypeId;

    const dtfsStorageFileService = new DtfsStorageFileService(null);
    getFileProperties = jest.fn();
    getFile = jest.fn();
    dtfsStorageFileService.getFileProperties = getFileProperties;
    dtfsStorageFileService.getFile = getFile;

    const graphService = new GraphService(null);
    graphServiceGet = jest.fn();
    uploadFile = jest.fn();
    graphServicePatch = jest.fn();
    graphService.get = graphServiceGet;
    graphService.uploadFile = uploadFile;
    graphService.patch = graphServicePatch;

    service = new DealFolderService(
      { baseUrl: sharepointBaseUrl, ukefSharepointName, estoreDocumentTypeIdFieldName },
      documentTypeMapper,
      dtfsStorageFileService,
      graphService,
    );
  });

  describe('uploadFileInDealFolder', () => {
    it('sends a request to the Graph Service to upload the file', async () => {
      whenGettingTheFileSize().mockResolvedValueOnce(getFileSizeResponse);
      whenGettingTheFile().mockResolvedValueOnce(file);
      whenGettingTheSharepointSiteId().mockResolvedValueOnce(getSharepointSiteIdResponse);
      whenGettingTheDriveId().mockResolvedValueOnce(getDriveIdResponse);
      whenGettingTheListId().mockResolvedValueOnce(getListIdResponse);
      whenGettingTheItemId().mockResolvedValueOnce(getItemIdResponse);
      whenMappingTheDocumentType(documentType).mockReturnValueOnce({
        documentTitle: 'Supplementary Questionnaire',
        documentTypeId: estoreDocumentTypeIdApplication,
      });

      await service.uploadFileInDealFolder(fileName, fileLocationPath, dealId, buyerName, ukefSiteId, documentType);

      expect(uploadFile).toHaveBeenCalledTimes(1);
      expect(uploadFile).toHaveBeenCalledWith(file, fileSizeInBytes, fileName, urlToCreateUploadSession);
    });

    it.each(updateFileInfoTestInputs)(
      'sends a request to the Graph Service to update the file information when the documentType is "$documentType"',
      async ({ documentType, documentTitle, documentTypeId }) => {
        whenGettingTheFileSize().mockResolvedValueOnce(getFileSizeResponse);
        whenGettingTheFile().mockResolvedValueOnce(file);
        whenGettingTheSharepointSiteId().mockResolvedValueOnce(getSharepointSiteIdResponse);
        whenGettingTheDriveId().mockResolvedValueOnce(getDriveIdResponse);
        whenGettingTheListId().mockResolvedValueOnce(getListIdResponse);
        whenGettingTheItemId().mockResolvedValueOnce(getItemIdResponse);
        whenMappingTheDocumentType(documentType).mockReturnValueOnce({ documentTitle, documentTypeId });

        await service.uploadFileInDealFolder(fileName, fileLocationPath, dealId, buyerName, ukefSiteId, documentType);

        const modifiedRequestBodyToUpdateFileInfo = {
          ...requestBodyToUpdateFileInfo,
          Title: documentTitle,
          [estoreDocumentTypeIdFieldName]: documentTypeId,
        };

        expect(graphServicePatch).toHaveBeenCalledTimes(1);
        expect(graphServicePatch).toHaveBeenCalledWith({
          path: updateFileInfoPath,
          requestBody: modifiedRequestBodyToUpdateFileInfo,
        });
      },
    );

    it('returns the path to the uploaded file', async () => {
      whenGettingTheFileSize().mockResolvedValueOnce(getFileSizeResponse);
      whenGettingTheFile().mockResolvedValueOnce(file);
      whenGettingTheSharepointSiteId().mockResolvedValueOnce(getSharepointSiteIdResponse);
      whenGettingTheDriveId().mockResolvedValueOnce(getDriveIdResponse);
      whenGettingTheListId().mockResolvedValueOnce(getListIdResponse);
      whenGettingTheItemId().mockResolvedValueOnce(getItemIdResponse);
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
      whenGettingTheFile().mockResolvedValueOnce(file);
      whenGettingTheSharepointSiteId().mockResolvedValueOnce(getSharepointSiteIdResponse);
      whenGettingTheDriveId().mockResolvedValueOnce(getDriveIdResponse);
      whenGettingTheListId().mockResolvedValueOnce(getListIdResponse);
      whenGettingTheItemId().mockResolvedValueOnce(getItemIdResponse);
      whenMappingTheDocumentType(documentType).mockReturnValueOnce({
        documentTitle: 'Supplementary Questionnaire',
        documentTypeId: estoreDocumentTypeIdApplication,
      });

      const uploadFilePromise = service.uploadFileInDealFolder(fileName, fileLocationPath, dealId, buyerName, ukefSiteId, documentType);

      await expect(uploadFilePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(uploadFilePromise).rejects.toHaveProperty('message', 'Bad request');
    });
  });

  const whenGettingTheFileSize = (): WhenMockWithMatchers => when(getFileProperties).calledWith(fileName, fileLocationPath);

  const whenGettingTheFile = (): WhenMockWithMatchers => when(getFile).calledWith(fileName, fileLocationPath);

  const whenGettingTheSharepointSiteId = (): WhenMockWithMatchers =>
    when(graphServiceGet).calledWith({
      path: getSharepointSiteIdPath,
    });

  const whenGettingTheDriveId = (): WhenMockWithMatchers =>
    when(graphServiceGet).calledWith({
      path: getDriveIdPath,
    });

  const whenGettingTheListId = (): WhenMockWithMatchers =>
    when(graphServiceGet).calledWith({
      path: getListIdPath,
    });

  const whenGettingTheItemId = (): WhenMockWithMatchers =>
    when(graphServiceGet).calledWith({
      path: getItemIdPath,
    });

  const whenMappingTheDocumentType = (documentType: DocumentTypeEnum): WhenMockWithMatchers => when(mapDocumentTypeToTitleAndTypeId).calledWith(documentType);
});
