import { regexToString } from '@ukef/helpers';

import { ALLOWED_DOCUMENT_FILE_TYPE } from './allowed-document-file-type.constant';

/*
 * The following limitations for folder naming are taken from sharepoint limitations:
 * https://support.microsoft.com/en-gb/office/restrictions-and-limitations-in-onedrive-and-sharepoint-64883a5d-228e-48f5-b3d2-eb39e07630fa
 */
const disallowedPrefixes = ['\\s', '~\\$'];
const disallowedSuffixes = ['\\s'];
const disallowedCharacters = ['"', '*', '<', '>', '?', '/', '\\\\', '\\|'];
const disallowedSubstrings = ['_vti_'];
const disallowedStrings = ['\\.lock', 'CON', 'PRN', 'AUX', 'NUL', 'COM\\d', 'LPT\\d', 'desktop\\.ini'];
const disallowedStringsOnRoot = ['forms'];

const disallowedPrefixesRegex = new RegExp(`(?!(${disallowedPrefixes.join(`)|(`)}))`);
const disallowedSuffixesRegex = new RegExp(`(?!.*(${disallowedSuffixes.join(')|(')})$)`);
const disallowedCharactersRegex = new RegExp(`(?!.*[${disallowedCharacters.join('')}])`);
const disallowedSubstringsRegex = new RegExp(`(?!.*(${disallowedSubstrings.join(')|(')}))`);
const disallowedStringsRegex = new RegExp(`(?!(${disallowedStrings.join('|')})$)`);
const disallowedStringsOnRootRegex = new RegExp(`(?!(${disallowedStringsOnRoot.join('|')})$)`);

const assembledRegexExpression = new RegExp(
  '^' +
    [
      regexToString(disallowedPrefixesRegex),
      regexToString(disallowedSuffixesRegex),
      regexToString(disallowedCharactersRegex),
      regexToString(disallowedSubstringsRegex),
      regexToString(disallowedStringsRegex),
      regexToString(disallowedStringsOnRootRegex),
    ].join('') +
    '.*$',
);

export const SHAREPOINT = {
  RESOURCE_NAME: {
    REGEX: /^[\w\-.()\s]+$/,
  },
  DOCUMENT_FILE_NAME: {
    REGEX: new RegExp(`^(?!\\s)[\\w\\-.()\\s]+\.(${Object.values(ALLOWED_DOCUMENT_FILE_TYPE).join('|')})(?<![\\s.])$`),
  },
  CASE_SITE_URL: {
    REGEX: /^[^,&!@~#$%*:;()+./\\[\]\-]+$/,
  },
  SAFE_FOLDER_NAME: {
    REGEX: assembledRegexExpression,
  },
};
