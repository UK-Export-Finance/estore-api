import { CUSTODIAN } from '@ukef/constants';
import * as crypto from 'crypto';

export const getCustodianFolderCreationCacheKey = (parentFolderId: number, folderName: string): string => {
  const folderNameHash = crypto.createHash('md5').update(folderName, 'utf8').digest('hex');
  return `${CUSTODIAN.CACHE_KEY_PREFIX}-${parentFolderId.toString()}-${folderNameHash}`;
};
