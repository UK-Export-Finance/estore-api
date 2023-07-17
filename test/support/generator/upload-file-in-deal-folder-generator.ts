import { LargeFileUploadSession, LargeFileUploadTaskOptions } from '@microsoft/microsoft-graph-client';
import { DOCUMENT_X0020_STATUS, DTFS_MAX_FILE_SIZE_BYTES } from '@ukef/constants';
import { DocumentTypeEnum } from '@ukef/constants/enums/document-type';
import { UkefId } from '@ukef/helpers';
import { DocumentTypeMapper } from '@ukef/modules/deal-folder/document-type-mapper';
import { UploadFileInDealFolderParamsDto } from '@ukef/modules/deal-folder/dto/upload-file-in-deal-folder-params.dto';
import { UploadFileInDealFolderRequestDto } from '@ukef/modules/deal-folder/dto/upload-file-in-deal-folder-request.dto';
import { UploadFileInDealFolderResponseDto } from '@ukef/modules/deal-folder/dto/upload-file-in-deal-folder-response.dto';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { Readable } from 'stream';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class UploadFileInDealFolderGenerator extends AbstractGenerator<GenerateValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      buyerName: this.valueGenerator.buyerName(),
      documentType: this.valueGenerator.enumValue<DocumentTypeEnum>(DocumentTypeEnum),
      fileName: this.valueGenerator.fileName(),
      fileLocationPath: this.valueGenerator.fileLocationPath(),
      ukefSiteId: this.valueGenerator.ukefSiteId(),
      dealId: this.valueGenerator.ukefId(),
      fileSizeInBytes: this.valueGenerator.nonnegativeInteger({ max: DTFS_MAX_FILE_SIZE_BYTES }),
      fileContents: this.valueGenerator.word(),
      sharepointSiteId: this.valueGenerator.string(),
      driveId: this.valueGenerator.string(),
      uploadSessionUrl: this.valueGenerator.httpsUrl(),
      uploadSessionExpiry: this.valueGenerator.date(),
      listId: this.valueGenerator.string(),
      itemId: this.valueGenerator.string(),
    };
  }

  protected transformRawValuesToGeneratedValues(valuesList: GenerateValues[]): GenerateResult {
    const uploadFileInDealFolderRequest: UploadFileInDealFolderRequestDto = valuesList.map((values) => ({
      buyerName: values.buyerName,
      documentType: values.documentType,
      fileName: values.fileName,
      fileLocationPath: values.fileLocationPath,
    }));

    const [values] = valuesList;

    const uploadFileInDealFolderResponse: UploadFileInDealFolderResponseDto = {
      fileUpload: `/sites/${values.ukefSiteId}/CaseLibrary/${values.buyerName}/D ${values.dealId}/${values.fileName}`,
    };

    const uploadFileInDealFolderParams: UploadFileInDealFolderParamsDto = {
      siteId: values.ukefSiteId,
      dealId: values.dealId,
    };

    const fileSizeInBytes = values.fileSizeInBytes;

    const downloadFileResponse = {
      readableStreamBody: Readable.from([values.fileContents]) as NodeJS.ReadableStream,
      _response: null,
    };

    const getSharepointSiteIdPath = `sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${values.ukefSiteId}`;

    const getSharepointSiteIdResponse = {
      id: values.sharepointSiteId,
    };

    const getDriveIdPath = `${getSharepointSiteIdPath}:/drives`;

    const getDriveIdResponse = {
      value: [
        {
          name: 'Case Library',
          id: values.driveId,
        },
      ],
    };

    const fileDestinationPath = `${values.buyerName}/D ${values.dealId}`;

    const urlToCreateUploadSession = `${ENVIRONMENT_VARIABLES.SHAREPOINT_BASE_URL}/sites/${values.sharepointSiteId}/drives/${values.driveId}/root:/${fileDestinationPath}/${values.fileName}:/createUploadSession`;

    const uploadSessionHeaders = {
      item: {
        '@microsoft.graph.conflictBehavior': 'fail',
      },
    };

    const getUploadSessionArgs: [
      string,
      {
        item: {
          '@microsoft.graph.conflictBehavior': string;
        };
      },
    ] = [urlToCreateUploadSession, uploadSessionHeaders];

    const uploadSession: LargeFileUploadSession = {
      url: values.uploadSessionUrl,
      expiry: values.uploadSessionExpiry,
    };

    const uploadTaskOptions: LargeFileUploadTaskOptions = { rangeSize: fileSizeInBytes };

    const getUploadTaskArgs: [string, number, LargeFileUploadSession, LargeFileUploadTaskOptions] = [
      values.fileName,
      fileSizeInBytes,
      uploadSession,
      uploadTaskOptions,
    ];

    const getListIdPath = `${getSharepointSiteIdPath}:/lists`;

    const getListIdResponse = { value: [{ name: 'CaseLibrary', id: values.listId }] };

    const getItemIdPath = `${getSharepointSiteIdPath}:/lists/${values.listId}/items`;

    const encodedBuyerName = encodeURIComponent(values.buyerName);
    const encodedDealId = encodeURIComponent(values.dealId);
    const encodedFileDestinationPath = `${encodedBuyerName}/${encodeURIComponent('D ')}${encodedDealId}`;
    const encodedFileName = encodeURIComponent(values.fileName);

    const itemWebUrl = `https://${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com/sites/${values.ukefSiteId}/CaseLibrary/${encodedFileDestinationPath}/${encodedFileName}`;

    const getItemIdResponse = { value: [{ webUrl: itemWebUrl, id: values.itemId }] };

    const updateFileInfoPath = `${getItemIdPath}/${values.itemId}/fields`;

    const { documentTitle, documentTypeId } = new DocumentTypeMapper({
      estoreDocumentTypeIdApplication: ENVIRONMENT_VARIABLES.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_APPLICATION,
      estoreDocumentTypeIdFinancialStatement: ENVIRONMENT_VARIABLES.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_FINANCIAL_STATEMENT,
      estoreDocumentTypeIdBusinessInformation: ENVIRONMENT_VARIABLES.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_BUSINESS_INFORMATION,
    }).mapDocumentTypeToTitleAndTypeId(values.documentType);

    const updateFileInfoRequest: {
      [documentTypeIdFieldName: string]: string;
      Title: string;
      Document_x0020_Status: string;
    } = {
      Title: documentTitle,
      Document_x0020_Status: DOCUMENT_X0020_STATUS,
      [ENVIRONMENT_VARIABLES.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_FIELD_NAME]: documentTypeId,
    };

    return {
      uploadFileInDealFolderRequest,
      uploadFileInDealFolderResponse,
      uploadFileInDealFolderParams,
      fileSizeInBytes,
      downloadFileResponse,
      getSharepointSiteIdPath,
      getSharepointSiteIdResponse,
      getDriveIdPath,
      getDriveIdResponse,
      getUploadSessionArgs,
      uploadSession,
      getUploadTaskArgs,
      getListIdPath,
      getListIdResponse,
      getItemIdPath,
      getItemIdResponse,
      updateFileInfoPath,
      updateFileInfoRequest,
    };
  }
}

interface GenerateValues {
  buyerName: string;
  documentType: DocumentTypeEnum;
  fileName: string;
  fileLocationPath: string;
  ukefSiteId: string;
  dealId: UkefId;
  fileSizeInBytes: number;
  fileContents: string;
  sharepointSiteId: string;
  driveId: string;
  uploadSessionUrl: string;
  uploadSessionExpiry: Date;
  listId: string;
  itemId: string;
}

interface GenerateResult {
  uploadFileInDealFolderRequest: UploadFileInDealFolderRequestDto;
  uploadFileInDealFolderResponse: UploadFileInDealFolderResponseDto;
  uploadFileInDealFolderParams: UploadFileInDealFolderParamsDto;
  fileSizeInBytes: number;
  downloadFileResponse: { readableStreamBody: NodeJS.ReadableStream; _response: any };
  getSharepointSiteIdPath: string;
  getSharepointSiteIdResponse: { id: string };
  getDriveIdPath: string;
  getDriveIdResponse: { value: { name: string; id: string }[] };
  getUploadSessionArgs: [string, { item: { '@microsoft.graph.conflictBehavior': string } }];
  uploadSession: LargeFileUploadSession;
  getUploadTaskArgs: [string, number, LargeFileUploadSession, LargeFileUploadTaskOptions];
  getListIdPath: string;
  getListIdResponse: { value: { name: string; id: string }[] };
  getItemIdPath: string;
  getItemIdResponse: { value: { webUrl: string; id: string }[] };
  updateFileInfoPath: string;
  updateFileInfoRequest: {
    [documentTypeIdFieldName: string]: string;
    Title: string;
    Document_x0020_Status: string;
  };
}

type GenerateOptions = unknown;
