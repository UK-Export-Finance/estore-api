import { DOCUMENT_FILE_TYPE } from './document-file-type.constant';

export const SHAREPOINT = {
  RESOURCE_NAME: {
    REGEX: /^[\w\-.()\s]+$/,
  },
  DOCUMENT_FILE_NAME: {
    REGEX: new RegExp(`^(?!\\s)[\\w\\-.()\\s]+\.(${Object.values(DOCUMENT_FILE_TYPE).join('|')})(?<![\\s.])$`, 'i'),
  },
};
