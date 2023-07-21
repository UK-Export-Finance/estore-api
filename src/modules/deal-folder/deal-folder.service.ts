import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { CASE_LIBRARY, DOCUMENT_X0020_STATUS, DTFS_MAX_FILE_SIZE_BYTES, ENUMS } from '@ukef/constants';
import { DocumentTypeEnum } from '@ukef/constants/enums/document-type';
import { SharepointResourceTypeEnum } from '@ukef/constants/enums/sharepoint-resource-type';
import { DocumentTypeMapper } from '@ukef/modules/deal-folder/document-type-mapper';
import { DtfsStorageFileService } from '@ukef/modules/dtfs-storage/dtfs-storage-file.service';
import GraphService from '@ukef/modules/graph/graph.service';
import { SharepointService } from '../sharepoint/sharepoint.service';

import { UploadFileInDealFolderResponseDto } from './dto/upload-file-in-deal-folder-response.dto';
import SharepointConfig from '@ukef/config/sharepoint.config';

type RequiredSharepointConfigKeys = 'baseUrl' | 'estoreDocumentTypeIdFieldName' | 'ukefSharepointName';
@Injectable()
export class DealFolderService {
  constructor(
    @Inject(SharepointConfig.KEY)
    private readonly sharepointConfig: Pick<ConfigType<typeof SharepointConfig>, RequiredSharepointConfigKeys>,
    private readonly documentTypeMapper: DocumentTypeMapper,
    private readonly dtfsStorageFileService: DtfsStorageFileService,
    private readonly sharepointService: SharepointService,
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

    await this.updateFileInformationInSharepoint(fileName, dealId, buyerName, ukefSiteId, documentType);

    return {
      fileUpload: `/sites/${ukefSiteId}/${CASE_LIBRARY.LIST_NAME}/${buyerName}/D ${dealId}/${fileName}`,
    };
  }

  private async checkFileIsNotTooLargeAndReturnSizeInBytes(fileName: string, fileLocationPath: string): Promise<number> {
    const fileSizeInBytes = await this.dtfsStorageFileService.getFileProperties(fileName, fileLocationPath).then((response) => response.contentLength);
    if (fileSizeInBytes > DTFS_MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Bad request', `The file exceeds the maximum allowed size of ${DTFS_MAX_FILE_SIZE_BYTES} bytes.`);
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
    await this.sharepointService.uploadFile({file, fileSizeInBytes, fileName, urlToCreateUploadSession});
  }

  private async updateFileInformationInSharepoint(
    fileName: string,
    dealId: string,
    buyerName: string,
    ukefSiteId: string,
    documentType: DocumentTypeEnum,
  ): Promise<void> {
    const urlToUpdateFileInfo = await this.constructUrlToUpdateFileInfo(fileName, dealId, buyerName, ukefSiteId);
    const requestBodyToUpdateFileInfo = this.constructRequestBodyToUpdateFileInfo(documentType);

    await this.sharepointService.uploadFileInformation({ urlToUpdateFileInfo, requestBodyToUpdateFileInfo });
  }

  // TODO apim-472 - remove reliance on sharepoint config
  private async constructUrlToCreateUploadSession(fileName: string, dealId: string, buyerName: string, ukefSiteId: string): Promise<string> {
    const sharepointSiteId = await this.getSharepointSiteIdByUkefSiteId(ukefSiteId);
    const driveId = await this.getResourceIdByName(ukefSiteId, CASE_LIBRARY.DRIVE_NAME, ENUMS.SHAREPOINT_RESOURCE_TYPES.DRIVE);
    /* Getting the sharepointSiteId (of the format {ukefSharepointName},{alphanumeric code including hyphens},{another alphanumeric code including hyphens}) 
    and driveId appears to necessary because using the ukefSiteId and drive name only appears to work when accessing drives, not items *within* drives. */
    const fileDestinationPath = `${buyerName}/D ${dealId}`;

    return `${this.sharepointConfig.baseUrl}/sites/${sharepointSiteId}/drives/${driveId}/root:/${fileDestinationPath}/${fileName}:/createUploadSession`;
  }

  private getSharepointSiteIdByUkefSiteId(ukefSiteId: string): Promise<string> {
    return this.sharepointService.getSiteByUkefSiteId(ukefSiteId).then((site) => site.id);
  }

  private getResourceIdByName(ukefSiteId: string, resourceName: string, sharepointResourceType: SharepointResourceTypeEnum): Promise<string> {
    return (
      this.sharepointService
        .getResources({ ukefSiteId, sharepointResourceType })
        .then((response) => response.value)
        .then((resources) => resources.find((resource) => resource.name === resourceName))
        /* The line above is necessary because the 'filter' query parameter does not currently support the 'name' field on lists/list items 
      (see comment from Microsoft employee https://learn.microsoft.com/en-us/answers/questions/980144/graph-api-sharepoint-list-filter-by-createddatetim).
      Additionally, the 'filter' query parameter is not supported at all by the 'List available drives' endpoint 
      (see https://learn.microsoft.com/en-us/graph/api/drive-list?view=graph-rest-1.0&tabs=http#optional-query-parameters for a list of supported parameters). */
        .then((resource) => resource.id)
    );
  }

  // TODO apim-472 - remove reliance on sharepoint config
  private constructRequestBodyToUpdateFileInfo(documentType: DocumentTypeEnum): {
    Title: string;
    Document_x0020_Status: string;
  } {
    const { documentTitle, documentTypeId } = this.documentTypeMapper.mapDocumentTypeToTitleAndTypeId(documentType);

    return {
      Title: documentTitle,
      Document_x0020_Status: DOCUMENT_X0020_STATUS,
      [this.sharepointConfig.estoreDocumentTypeIdFieldName]: documentTypeId,
    };
  }

  // TODO apim-472 - remove reliance on sharepoint config
  private async constructUrlToUpdateFileInfo(fileName: string, dealId: string, buyerName: string, ukefSiteId: string): Promise<string> {
    const listId = await this.getResourceIdByName(ukefSiteId, CASE_LIBRARY.LIST_NAME, ENUMS.SHAREPOINT_RESOURCE_TYPES.LIST);

    const webUrlForFile = this.constructWebUrlForFile(fileName, dealId, buyerName, ukefSiteId);
    const itemId = await this.getItemIdByWebUrl(ukefSiteId, listId, webUrlForFile);

    return `sites/${this.sharepointConfig.ukefSharepointName}:/sites/${ukefSiteId}:/lists/${listId}/items/${itemId}/fields`;
  }

  private constructWebUrlForFile(fileName: string, dealId: string, buyerName: string, ukefSiteId: string): string {
    const encodedBuyerName = encodeURIComponent(buyerName);
    const encodedDealId = encodeURIComponent(dealId);
    const encodedFileDestinationPath = `${encodedBuyerName}/${encodeURIComponent('D ')}${encodedDealId}`;
    const encodedFileName = encodeURIComponent(fileName);

    return `https://${this.sharepointConfig.ukefSharepointName}/sites/${ukefSiteId}/${CASE_LIBRARY.LIST_NAME}/${encodedFileDestinationPath}/${encodedFileName}`;
  }

  private getItemIdByWebUrl(ukefSiteId: string, listId: string, webUrl: string): Promise<string> {
    return (
      this.sharepointService
        .getItems({ ukefSiteId, listId })
        .then((response) => response.value)
        .then((list) => list.find((item) => item.webUrl === webUrl))
        /* The line above is necessary because the 'filter' query parameter does not currently support the 'webUrl' field on lists/list items 
      (see comment from Microsoft employee https://learn.microsoft.com/en-us/answers/questions/980144/graph-api-sharepoint-list-filter-by-createddatetim). */
        .then((item) => item.id)
    );
  }
}
