import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { CASE_LIBRARY, DOCUMENT_X0020_STATUS, ENUMS, MAX_FILE_SIZE_BYTES } from '@ukef/constants';
import { DocumentTypeEnum } from '@ukef/constants/enums/document-type';
import { SharepointResourceTypeEnum } from '@ukef/constants/enums/sharepoint-resource-type';
import { DocumentTypeMapper } from '@ukef/modules/deal-folder/document-type-mapper';
import { DtfsStorageFileService } from '@ukef/modules/dtfs-storage/dtfs-storage-file.service';
import GraphService from '@ukef/modules/graph/graph.service';

import { UploadFileInDealFolderResponseDto } from './dto/upload-file-in-deal-folder-response.dto';
type RequiredConfigKeys = 'baseUrl' | 'ukefSharepointName' | 'estoreDocumentTypeIdFieldName';

@Injectable()
export class DealFolderService {
  constructor(
    @Inject(SharepointConfig.KEY)
    private readonly config: Pick<ConfigType<typeof SharepointConfig>, RequiredConfigKeys>,
    private readonly documentTypeMapper: DocumentTypeMapper,
    private readonly dtfsStorageFileService: DtfsStorageFileService,
    private readonly graphService: GraphService,
  ) {}

  async uploadFileInDealFolder(
    fileName: string,
    fileLocationPath: string,
    dealId: string,
    buyerName: string,
    ukefSiteId: string,
    documentType: DocumentTypeEnum,
  ): Promise<UploadFileInDealFolderResponseDto> {
    const fileSizeInBytes = await this.checkFileIsNotTooLargeAndReturnSizeInBytes(fileName, fileLocationPath);

    const file = await this.downloadFileFromDtfs(fileName, fileLocationPath);

    await this.uploadFileToSharepoint(file, fileSizeInBytes, fileName, dealId, buyerName, ukefSiteId);

    const fileLeafRef = await this.updateFileInformationInSharepoint(fileName, dealId, buyerName, ukefSiteId, documentType);

    return {
      fileUpload: fileLeafRef,
    };
  }

  private async checkFileIsNotTooLargeAndReturnSizeInBytes(fileName: string, fileLocationPath: string): Promise<number> {
    const fileSizeInBytes = await this.dtfsStorageFileService.getFileProperties(fileName, fileLocationPath).then((response) => response.contentLength);
    if (fileSizeInBytes > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Bad request', `The file exceeds the maximum allowed size of ${MAX_FILE_SIZE_BYTES} bytes.`);
    }
    return fileSizeInBytes;
  }

  private downloadFileFromDtfs(fileName: string, fileLocationPath: string): Promise<NodeJS.ReadableStream> {
    return this.dtfsStorageFileService.getFile(fileName, fileLocationPath);
  }

  private async uploadFileToSharepoint(
    file: NodeJS.ReadableStream,
    fileSizeInBytes: number,
    fileName: string,
    dealId: string,
    buyerName: string,
    ukefSiteId: string,
  ): Promise<void> {
    const urlToCreateUploadSession = await this.constructUrlToCreateUploadSession(fileName, dealId, buyerName, ukefSiteId);
    await this.graphService.uploadFile(file, fileSizeInBytes, fileName, urlToCreateUploadSession);
  }

  private async updateFileInformationInSharepoint(
    fileName: string,
    dealId: string,
    buyerName: string,
    ukefSiteId: string,
    documentType: DocumentTypeEnum,
  ): Promise<string> {
    const { urlToUpdateFileInfo, fileLeafRef } = await this.constructUrlToUpdateFileInfo(fileName, dealId, buyerName, ukefSiteId);
    const requestBodyToUpdateFileInfo = this.constructRequestBodyToUpdateFileInfo(documentType);

    await this.graphService.patch<
      {
        Title: string;
        Document_x0020_Status: string;
      },
      unknown
    >({
      path: urlToUpdateFileInfo,
      requestBody: requestBodyToUpdateFileInfo,
    });

    return fileLeafRef;
  }

  private async constructUrlToCreateUploadSession(fileName: string, dealId: string, buyerName: string, ukefSiteId: string): Promise<string> {
    const sharepointSiteId = await this.getSharepointSiteIdByUkefSiteId(ukefSiteId);
    const driveId = await this.getResourceIdByName(ukefSiteId, CASE_LIBRARY.DRIVE_NAME, ENUMS.SHAREPOINT_RESOURCE_TYPES.DRIVE);
    /* Getting the sharepointSiteId (of the format {ukefSharepointName},{alphanumeric code including hyphens},{another alphanumeric code including hyphens}) 
    and driveId appears to necessary because using the ukefSiteId and drive name only appears to work when accessing drives, not items *within* drives. */
    const fileDestinationPath = `${buyerName}/D ${dealId}`;

    return `${this.config.baseUrl}/sites/${sharepointSiteId}/drives/${driveId}/root:/${fileDestinationPath}/${fileName}:/createUploadSession`;
  }

  private getSharepointSiteIdByUkefSiteId(ukefSiteId: string): Promise<string> {
    return this.graphService
      .get<{ id: string }>({
        path: `sites/${this.config.ukefSharepointName}:/sites/${ukefSiteId}`,
      })
      .then((site) => site.id);
  }

  private getResourceIdByName(ukefSiteId: string, resourceName: string, sharepointResourceType: SharepointResourceTypeEnum): Promise<string> {
    return (
      this.graphService
        .get<{ value: { name: string; id: string }[] }>({
          path: `sites/${this.config.ukefSharepointName}:/sites/${ukefSiteId}:/${sharepointResourceType}s`,
        })
        .then((response) => response.value)
        .then((resources) => resources.find((resource) => resource.name === resourceName))
        /* The line above is necessary because the 'filter' query parameter does not currently support the 'name' field on lists/list items 
      (see comment from Microsoft employee https://learn.microsoft.com/en-us/answers/questions/980144/graph-api-sharepoint-list-filter-by-createddatetim).
      Additionally, the 'filter' query parameter is not supported at all by the 'List available drives' endpoint 
      (see https://learn.microsoft.com/en-us/graph/api/drive-list?view=graph-rest-1.0&tabs=http#optional-query-parameters for a list of supported parameters). */
        .then((resource) => resource.id)
    );
  }

  private constructRequestBodyToUpdateFileInfo(documentType: DocumentTypeEnum): {
    Title: string;
    Document_x0020_Status: string;
  } {
    const { documentTitle, documentTypeId } = this.documentTypeMapper.mapDocumentTypeToTitleAndTypeId(documentType);

    return {
      Title: documentTitle,
      Document_x0020_Status: DOCUMENT_X0020_STATUS,
      [this.config.estoreDocumentTypeIdFieldName]: documentTypeId,
    };
  }

  private async constructUrlToUpdateFileInfo(
    fileName: string,
    dealId: string,
    buyerName: string,
    ukefSiteId: string,
  ): Promise<{ urlToUpdateFileInfo: string; fileLeafRef: string }> {
    const listId = await this.getResourceIdByName(ukefSiteId, CASE_LIBRARY.LIST_NAME, ENUMS.SHAREPOINT_RESOURCE_TYPES.LIST);

    const webUrlRegExpForFile = this.constructWebUrlRegExpForFile(fileName, dealId, buyerName, ukefSiteId);
    const { itemId, fileLeafRef } = await this.getItemIdAndFileLeafRefByWebUrlRegExp(ukefSiteId, listId, webUrlRegExpForFile);

    const urlToUpdateFileInfo = `sites/${this.config.ukefSharepointName}:/sites/${ukefSiteId}:/lists/${listId}/items/${itemId}/fields`;

    return {
      urlToUpdateFileInfo,
      fileLeafRef,
    };
  }

  private constructWebUrlRegExpForFile(fileName: string, dealId: string, buyerName: string, ukefSiteId: string): RegExp {
    const encodedBuyerName = encodeURIComponent(buyerName);
    const encodedDealId = encodeURIComponent(dealId);
    const encodedFileDestinationPath = `${encodedBuyerName}/${encodeURIComponent('D ')}${encodedDealId}`;
    const encodedFileName = encodeURIComponent(fileName);

    return new RegExp(
      `https://${this.config.ukefSharepointName}/sites/${ukefSiteId}/${CASE_LIBRARY.LIST_NAME}/${encodedFileDestinationPath}/.*${encodedFileName}`, // TODO APIM-138: remove Reg Exp if no longer needed and return to hardcoded string.
    );
    // Using a reg exp is necessary because Sharepoint temporarily prepends a code (which appears to always start with '~tmp') to the file name in the web url.
  }

  private getItemIdAndFileLeafRefByWebUrlRegExp(ukefSiteId: string, listId: string, webUrlRegExp: RegExp): Promise<{ itemId: string; fileLeafRef: string }> {
    return (
      this.graphService
        .get<{ value: { webUrl: string; id: string; fields: { FileLeafRef: string } }[] }>({
          path: `sites/${this.config.ukefSharepointName}:/sites/${ukefSiteId}:/lists/${listId}/items`,
          expand: 'fields',
        })
        .then((response) => response.value)
        .then((list) => list.find((item) => webUrlRegExp.test(item.webUrl)))
        /* The line above is necessary because the 'filter' query parameter does not currently support the 'webUrl' field on lists/list items 
      (see comment from Microsoft employee https://learn.microsoft.com/en-us/answers/questions/980144/graph-api-sharepoint-list-filter-by-createddatetim). */
        .then((item) => ({ itemId: item.id, fileLeafRef: item.fields.FileLeafRef }))
    );
  }
}
