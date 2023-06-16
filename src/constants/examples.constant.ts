import { ENUMS } from './enum.constant';

import { MAX_FILE_SIZE } from './max-file-size.constant';

export const EXAMPLES = {
  SITE_ID: '12345678',
  SITE_STATUS_CODE: ENUMS.SITE_STATUSES.CREATED,
  DEAL_ID: '0030000321',
  FACILITY_ID: '0030000322',
  FILE_SIZE: MAX_FILE_SIZE / 2,
  FILE_NAME: 'document.txt',
  FILE_LOCATION_PATH: '', // TODO (APIM-450): check if this includes file name and extension.
};
