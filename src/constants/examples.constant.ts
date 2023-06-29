import { DTFS_MAX_FILE_SIZE_BYTES } from './dtfs-max-file-size-bytes.constant';
import { ENUMS } from './enum.constant';

export const EXAMPLES = {
  SITE_ID: '12345678',
  SITE_STATUS_CODE: ENUMS.SITE_STATUSES.CREATED,
  DEAL_ID: '0030000321',
  FACILITY_ID: '0030000322',
  FILE_SIZE: DTFS_MAX_FILE_SIZE_BYTES,
  FILE_NAME: process.env.DTFS_STORAGE_EXAMPLE_FILE_NAME,
  FILE_LOCATION_PATH: process.env.DTFS_STORAGE_EXAMPLE_FILE_LOCATION_PATH,
  FOLDER_NAME: 'Example folder name', // TODO apim-139: Check this folder name
};
