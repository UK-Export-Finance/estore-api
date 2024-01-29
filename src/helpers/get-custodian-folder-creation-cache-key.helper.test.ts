import { CUSTODIAN } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { getCustodianFolderCreationCacheKey } from './get-custodian-folder-creation-cache-key.helper';

describe('GetCustodianFolderCreationCacheKey helper test', () => {
  const valueGenerator = new RandomValueGenerator();

  describe('getCustodianFolderCreationCacheKey', () => {
    const parentFolderId = valueGenerator.nonnegativeInteger();
    const folderName = valueGenerator.string();
    const anotherFolderName = valueGenerator.string();

    it('generates a cache key of the correct format', () => {
      const key1 = getCustodianFolderCreationCacheKey(parentFolderId, folderName);

      expect(key1).toEqual(expect.any(String));
      expect(key1).toMatch(new RegExp(`^${CUSTODIAN.CACHE_KEY_PREFIX}-${parentFolderId.toString()}-?`));
    });

    it('different input returns different output', () => {
      const key1 = getCustodianFolderCreationCacheKey(parentFolderId, folderName);
      const key2 = getCustodianFolderCreationCacheKey(parentFolderId, anotherFolderName);

      expect(key1).toEqual(expect.any(String));
      expect(key2).toEqual(expect.any(String));
      expect(key1).not.toEqual(key2);
      expect(key1).toMatch(new RegExp(`^${CUSTODIAN.CACHE_KEY_PREFIX}-${parentFolderId.toString()}-?`));
      expect(key2).toMatch(new RegExp(`^${CUSTODIAN.CACHE_KEY_PREFIX}-${parentFolderId.toString()}-?`));
    });
  });
});
