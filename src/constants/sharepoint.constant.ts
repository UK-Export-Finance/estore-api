import { ALLOWED_DOCUMENT_FILE_TYPE } from './allowed-document-file-type.constant';

export const SHAREPOINT = {
  RESOURCE_NAME: {
    REGEX: /^[\w\-.()\s]+$/,
  },
  DOCUMENT_FILE_NAME: {
    REGEX: new RegExp(`^(?!\\s)[\\w\\-.()\\s]+\.(${Object.values(ALLOWED_DOCUMENT_FILE_TYPE).join('|')})(?<![\\s.])$`),
  },
};
