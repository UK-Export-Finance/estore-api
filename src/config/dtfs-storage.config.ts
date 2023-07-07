import { registerAs } from '@nestjs/config';

export interface DtfsStorageConfig {
  baseUrl: string;
  accountName: string;
  accountKey: string;
}

export default registerAs('dtfsStorage', (): DtfsStorageConfig => {
  return {
    baseUrl: `https://${process.env.DTFS_STORAGE_ACCOUNT_NAME}.file.core.windows.net`,
    accountName: process.env.DTFS_STORAGE_ACCOUNT_NAME,
    accountKey: process.env.DTFS_STORAGE_ACCOUNT_KEY,
  };
});
