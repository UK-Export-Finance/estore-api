import { BadRequestException, Injectable } from '@nestjs/common';
import { MAX_FILE_SIZE_BYTES } from '@ukef/constants';

import { DtfsStorageFileService } from '../dtfs-storage/dtfs-storage-file.service';
import GraphService from '../graph/graph.service';
import { UploadFileInDealFolderRequestItem } from './dto/upload-file-in-deal-folder-request.dto';

@Injectable()
export class DealFolderService {
  constructor(private readonly dtfsStorageFileService: DtfsStorageFileService, private readonly graphService: GraphService) {}

  async uploadFileInDealFolder(fileInfoFromRequest: UploadFileInDealFolderRequestItem): Promise<string> {
    const { fileName, fileLocationPath } = fileInfoFromRequest;

    const fileSizeInBytes = await this.getFileSizeIfDoesNotExceedMax(fileName, fileLocationPath);

    const fileToUpload = await this.getFile(fileName, fileLocationPath);

    this.graphService.uploadFile(
      ``,
      fileToUpload,
      fileName,
      fileSizeInBytes,
    );

    return 'hello world';
    // const { contentType, documentTitle, documentType } = DOCUMENT_TYPE_MAPPING[documentTypeFromRequest];
  }

  private async getFileSizeIfDoesNotExceedMax(fileName: string, fileLocationPath: string): Promise<number> {
    const fileSizeInBytes = await this.dtfsStorageFileService.getFileProperties(fileName, fileLocationPath).then((response) => {
      return response.contentLength;
    });
    if (fileSizeInBytes > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Bad request', `The file exceeds the maximum allowed size of ${MAX_FILE_SIZE_BYTES} bytes.`);
    }
    return fileSizeInBytes;
  }

  private getFile(fileName: string, fileLocationPath: string): Promise<NodeJS.ReadableStream> {
    return this.dtfsStorageFileService.getFile(fileName, fileLocationPath);
  }
}
