import { UploadFileInDealFolderExistsException } from '../deal-folder/exception/upload-file-in-deal-folder-exists.exception';
import { TermsFacilityExistsException } from '../terms/exception/terms-facility-exists.exception';

export type KnownErrors = KnownError[];

export type KnownError = { caseInsensitiveSubstringsToFind: string[]; throwError: (error: Error) => never };

export const postFacilityTermExistsKnownError = (): KnownError => ({
  caseInsensitiveSubstringsToFind: ['One or more fields with unique constraints already has the provided value'],
  throwError: (error) => {
    throw new TermsFacilityExistsException('Facility Term item with this identifier already exists.', error);
  },
});

export const uploadFileExistsKnownError = (fileName: string): KnownError => ({
  caseInsensitiveSubstringsToFind: ['The specified item name already exists'],
  throwError: (error) => {
    throw new UploadFileInDealFolderExistsException(`A file with the name ${fileName} already exists for the buyer name and deal ID specified.`, error);
  },
});
