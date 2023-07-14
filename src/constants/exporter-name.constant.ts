import { regexToString } from '@ukef/helpers';


/* 
 * The following limitations for folder naming are taken from sharepoint limitations:
 * https://support.microsoft.com/en-gb/office/restrictions-and-limitations-in-onedrive-and-sharepoint-64883a5d-228e-48f5-b3d2-eb39e07630fa
 */ 

// TODO apim-474 resolve Found non-literal argument to RegExp constructor
const disallowedPrefixes = ['\\s', '~\\$'];
const disallowedSuffixes = ['\\s'];
const disallowedCharacters = ['"', '*', '<', '>', '?', '/', '\\\\', '\\|'];
const disallowedSubstrings = ['_vti_'];
const disallowedStrings = ['.lock', 'CON', 'PRN', 'AUX', 'NUL', 'COM[0-9]', 'LPT[0-9]'];
const disallowedStringsOnRoot = ['forms'];

const disallowedPrefixesRegex = new RegExp(`(?!^(?=${disallowedPrefixes.join('|')}).*$)`);
const disallowedSuffixesRegex = new RegExp(`(?!(^.*(?<=${disallowedSuffixes.join('|')})$))`);
const disallowedCharactersRegex = new RegExp(`(?!(^.*[${disallowedCharacters.join('|')}].*$))`);
const disallowedSubstringsRegex = new RegExp(`(?!(^.*(?=${disallowedSubstrings.join('|')}).*$))`);
const disallowedStringsRegex = new RegExp(`(?!((^${disallowedStrings.join('$)|(^')}$)))`);
const disallowedStringsOnRootRegex = new RegExp(`(?!((^${disallowedStringsOnRoot.join('$)|(^')}$)))`);

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

export const EXPORTER_NAME = {
  REGEX: assembledRegexExpression,
};
