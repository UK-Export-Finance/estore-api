import { registerAs } from '@nestjs/config';

const KEY = 'dtfsStorage';

export { KEY as DTFS_STORAGE_CONFIG_KEY };

export type DtfsStorageConfigType = {
  baseUrl: string;
  accountName: string;
  accountKey: string;
  dealDocumentsFolderPath: string;
};

export const DtfsStorageConfig = registerAs(KEY, (): DtfsStorageConfigType => {
  return {
    baseUrl: `https://${process.env.DTFS_STORAGE_ACCOUNT_NAME}.file.core.windows.net`,
    accountName: process.env.DTFS_STORAGE_ACCOUNT_NAME,
    accountKey: process.env.DTFS_STORAGE_ACCOUNT_KEY,
    dealDocumentsFolderPath: process.env.DTFS_STORAGE_DEAL_DOCUMENTS_FOLDER_PATH,
  };
});
