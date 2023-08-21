import { LargeFileUploadSession, LargeFileUploadTaskOptions } from '@microsoft/microsoft-graph-client';
import { DTFS_MAX_FILE_SIZE_BYTES, ENUMS, GRAPH } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { UploadFileInDealFolderParamsDto } from '@ukef/modules/deal-folder/dto/upload-file-in-deal-folder-params.dto';
import { UploadFileInDealFolderRequestDto } from '@ukef/modules/deal-folder/dto/upload-file-in-deal-folder-request.dto';
import { UploadFileInDealFolderResponseDto } from '@ukef/modules/deal-folder/dto/upload-file-in-deal-folder-response.dto';
import { SharepointGetItemsParams, SharepointGetResourcesParams, SharepointupdateFileInformationParams } from '@ukef/modules/sharepoint/sharepoint.service';
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
      top: this.valueGenerator.integer(),
    };
  }

  protected transformRawValuesToGeneratedValues(valuesList: GenerateValues[], options: GenerateOptions): GenerateResult {
    const ecmsDocumentContentTypeId = options.ecmsDocumentContentTypeId ?? ENVIRONMENT_VARIABLES.SHAREPOINT_ECMS_DOCUMENT_CONTENT_TYPE_ID;

    const sharepointBaseUrl = options.sharepointBaseUrl ?? ENVIRONMENT_VARIABLES.SHAREPOINT_BASE_URL;
    const ukefSharepointName = options.ukefSharepointName ?? `${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com`;
    const estoreDocumentTypeIdFieldName = options.estoreDocumentTypeIdFieldName ?? ENVIRONMENT_VARIABLES.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_FIELD_NAME;
    const documentTypeId = options.documentTypeId ?? ENVIRONMENT_VARIABLES.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_APPLICATION;

    const uploadFileInDealFolderRequest: UploadFileInDealFolderRequestDto = valuesList.map((values) => ({
      buyerName: values.buyerName,
      documentType: ENUMS.DOCUMENT_TYPES.EXPORTER_QUESTIONNAIRE,
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

    const dtfsStorageFileServiceGetFileSizeResponse = { contentLength: fileSizeInBytes };

    const dtfsStorageFileServiceGetFileResponse = Readable.from([values.fileContents]) as NodeJS.ReadableStream;

    const dtfsStorageFileClientDownloadFileResponse = {
      readableStreamBody: dtfsStorageFileServiceGetFileResponse,
      _response: null,
    };

    const graphClientGetSitePath = `sites/${ukefSharepointName}:/sites/${values.ukefSiteId}`;

    const graphClientGetSiteByUkefSiteIdResponse = {
      id: values.sharepointSiteId,
    };

    const graphClientGetDriveIdPath = `${graphClientGetSitePath}:/drives`;

    const graphClientGetResourcesDriveResponse = {
      value: [
        {
          name: 'Case Library',
          id: values.driveId,
        },
      ],
    };

    const fileDestinationPath = `${values.buyerName}/D ${values.dealId}`;

    const graphClientUrlToCreateUploadSession = `${sharepointBaseUrl}/sites/${values.sharepointSiteId}/drives/${values.driveId}/root:/${fileDestinationPath}/${values.fileName}:/createUploadSession`;

    const uploadSessionHeaders = {
      item: {
        '@microsoft.graph.conflictBehavior': 'fail',
      },
    };

    const graphClientGetUploadSessionArgs: [
      string,
      {
        item: {
          '@microsoft.graph.conflictBehavior': string;
        };
      },
    ] = [graphClientUrlToCreateUploadSession, uploadSessionHeaders];

    const graphClientUploadSession: LargeFileUploadSession = {
      url: values.uploadSessionUrl,
      expiry: values.uploadSessionExpiry,
    };

    const uploadTaskOptions: LargeFileUploadTaskOptions = { rangeSize: fileSizeInBytes };

    const graphClientGetUploadTaskArgs: [string, number, LargeFileUploadSession, LargeFileUploadTaskOptions] = [
      values.fileName,
      fileSizeInBytes,
      graphClientUploadSession,
      uploadTaskOptions,
    ];

    const graphClientGetListIdPath = `${graphClientGetSitePath}:/lists`;

    const listId = values.listId;

    const graphClientGetListIdResponse = { value: [{ name: 'CaseLibrary', id: listId }] };

    const graphClientGetItemIdPath = `${graphClientGetSitePath}:/lists/${listId}/items`;

    const itemWebUrl = this.constructWebUrlForItem(values.ukefSiteId, values.dealId, values.buyerName, values.fileName, ukefSharepointName);

    const graphClientGetItemIdResponse = { value: [{ webUrl: itemWebUrl, id: values.itemId }] };

    const graphClientUpdateFileInfoPath = `${graphClientGetItemIdPath}/${values.itemId}`;

    const graphClientUpdateFileInfoRequest: {
      contentType: {
        id: string;
      };
      fields: {
        Title: string;
        Document_x0020_Status: string;
        [documentTypeIdFieldName: string]: string;
      };
    } = {
      contentType: {
        id: ecmsDocumentContentTypeId,
      },
      fields: {
        Title: 'Supplementary Questionnaire',
        Document_x0020_Status: 'Original',
        [estoreDocumentTypeIdFieldName]: documentTypeId,
      },
    };

    const sharepointServiceGetSiteByUkefSiteIdParams = values.ukefSiteId;

    const sharepointServiceGetResourcesDriveParams = {
      ukefSiteId: values.ukefSiteId,
      sharepointResourceType: ENUMS.SHAREPOINT_RESOURCE_TYPES.DRIVE,
    };

    const sharepointServiceGetResourcesListParams = {
      ukefSiteId: values.ukefSiteId,
      sharepointResourceType: ENUMS.SHAREPOINT_RESOURCE_TYPES.LIST,
    };

    const sharepointServiceGetItemsParams = {
      ukefSiteId: values.ukefSiteId,
      listId,
      top: GRAPH.INCREASED_RESULTS_PER_CALL,
    };

    const sharepointServiceUpdateFileInformationParams = {
      urlToUpdateFileInfo: graphClientUpdateFileInfoPath,
      requestBodyToUpdateFileInfo: graphClientUpdateFileInfoRequest,
    };

    const sharepointServiceGetSiteByUkefSiteIdResponse = graphClientGetSiteByUkefSiteIdResponse;
    const sharepointServiceGetResourcesDriveResponse = graphClientGetResourcesDriveResponse;
    const sharepointServiceUrlToCreateUploadSession = graphClientUrlToCreateUploadSession;
    const sharepointServiceGetListIdResponse = graphClientGetListIdResponse;
    const sharepointServiceGetItemIdResponse = graphClientGetItemIdResponse;

    return {
      uploadFileInDealFolderRequest,
      uploadFileInDealFolderResponse,
      uploadFileInDealFolderParams,
      fileSizeInBytes,
      dtfsStorageFileServiceGetFileSizeResponse,
      dtfsStorageFileServiceGetFileResponse,
      dtfsStorageFileClientDownloadFileResponse,
      graphClientGetSitePath,
      graphClientGetSiteByUkefSiteIdResponse,
      graphClientGetDriveIdPath,
      graphClientGetResourcesDriveResponse,
      graphClientUrlToCreateUploadSession,
      graphClientGetUploadSessionArgs,
      graphClientUploadSession,
      graphClientGetUploadTaskArgs,
      graphClientGetListIdPath,
      listId,
      graphClientGetListIdResponse,
      graphClientGetItemIdPath,
      graphClientGetItemIdResponse,
      graphClientUpdateFileInfoPath,
      graphClientUpdateFileInfoRequest,
      sharepointServiceGetSiteByUkefSiteIdParams,
      sharepointServiceGetResourcesDriveParams,
      sharepointServiceGetResourcesListParams,
      sharepointServiceGetItemsParams,
      sharepointServiceUpdateFileInformationParams,
      sharepointServiceGetSiteByUkefSiteIdResponse,
      sharepointServiceGetResourcesDriveResponse,
      sharepointServiceUrlToCreateUploadSession,
      sharepointServiceGetListIdResponse,
      sharepointServiceGetItemIdResponse,
    };
  }

  constructWebUrlForItem(siteId: string, dealId: string, buyerName: string, fileName: string, ukefSharepointName?: string): string {
    const sharepointName = ukefSharepointName ?? `${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com`;
    const encodedBuyerName = encodeURIComponent(buyerName);
    const encodedDealId = encodeURIComponent(dealId);
    const encodedFileDestinationPath = `${encodedBuyerName}/${encodeURIComponent('D ')}${encodedDealId}`;
    const encodedFileName = encodeURIComponent(fileName);

    return `https://${sharepointName}/sites/${siteId}/CaseLibrary/${encodedFileDestinationPath}/${encodedFileName}`;
  }
}

interface GenerateValues {
  buyerName: string;
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
  top: number;
}

interface GenerateResult {
  uploadFileInDealFolderRequest: UploadFileInDealFolderRequestDto;
  uploadFileInDealFolderResponse: UploadFileInDealFolderResponseDto;
  uploadFileInDealFolderParams: UploadFileInDealFolderParamsDto;
  fileSizeInBytes: number;
  dtfsStorageFileServiceGetFileSizeResponse: { contentLength: number };
  dtfsStorageFileServiceGetFileResponse: NodeJS.ReadableStream;
  dtfsStorageFileClientDownloadFileResponse: { readableStreamBody: NodeJS.ReadableStream; _response: any };
  graphClientGetSitePath: string;
  graphClientGetSiteByUkefSiteIdResponse: { id: string };
  graphClientGetDriveIdPath: string;
  graphClientGetResourcesDriveResponse: { value: { name: string; id: string }[] };
  graphClientUrlToCreateUploadSession: string;
  graphClientGetUploadSessionArgs: [string, { item: { '@microsoft.graph.conflictBehavior': string } }];
  graphClientUploadSession: LargeFileUploadSession;
  graphClientGetUploadTaskArgs: [string, number, LargeFileUploadSession, LargeFileUploadTaskOptions];
  graphClientGetListIdPath: string;
  listId: string;
  graphClientGetListIdResponse: { value: { name: string; id: string }[] };
  graphClientGetItemIdPath: string;
  graphClientGetItemIdResponse: { value: { webUrl: string; id: string }[] };
  graphClientUpdateFileInfoPath: string;
  graphClientUpdateFileInfoRequest: {
    contentType: {
      id: string;
    };
    fields: {
      Title: string;
      Document_x0020_Status: string;
      [documentTypeIdFieldName: string]: string;
    };
  };
  sharepointServiceGetSiteByUkefSiteIdParams: string;
  sharepointServiceGetResourcesDriveParams: SharepointGetResourcesParams;
  sharepointServiceGetResourcesListParams: SharepointGetResourcesParams;
  sharepointServiceGetItemsParams: SharepointGetItemsParams;
  sharepointServiceUpdateFileInformationParams: SharepointupdateFileInformationParams;
  sharepointServiceGetSiteByUkefSiteIdResponse: { id: string };
  sharepointServiceGetResourcesDriveResponse: { value: { name: string; id: string }[] };
  sharepointServiceUrlToCreateUploadSession: string;
  sharepointServiceGetListIdResponse: { value: { name: string; id: string }[] };
  sharepointServiceGetItemIdResponse: { value: { webUrl: string; id: string }[] };
}

interface GenerateOptions {
  ecmsDocumentContentTypeId?: string;
  sharepointBaseUrl?: string;
  ukefSharepointName?: string;
  estoreDocumentTypeIdFieldName?: string;
  documentTypeId?: string;
}
