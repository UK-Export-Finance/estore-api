const validSubString = 'substring';
const disallowedPrefixes = ['~$', ' '];
const disallowedSuffixes = [' '];
const disallowedCharacters = ['"', '*', '<', '>', '?', '/', '\\', '|'];
const disallowedSubstrings = ['_vti_'];
const disallowedStrings = ['.lock', 'CON', 'PRN', 'AUX', 'NUL', 'COM0', 'COM5', 'COM9', 'LPT0', 'LPT5', 'LPT9'];
const disallowedStringsOnRoot = ['forms'];
const allowedStrings = [
  'testString',
  'Test String With Spaces',
  'testStringWith$Symbol',
  'commonAccentedCharacters áÁàÀâÂäÄãÃåÅæÆçÇéÉèÈêÊëËíÍìÌîÎïÏñÑóÓòÒôÔöÖõÕøØœŒßúÚùÙûÛüÜ',
];

export const allowedStringTestCases = [...allowedStrings];

export const disallowedStringTestCases = [
  ...disallowedPrefixes,
  ...disallowedSuffixes,
  ...disallowedCharacters,
  ...disallowedSubstrings,
  ...disallowedStrings,
  ...disallowedStringsOnRoot,
];

export const allowedSubstringTestCases = [
  ...disallowedPrefixes,
  ...disallowedSuffixes,
  ...disallowedStrings,
  ...disallowedStringsOnRoot,
  ...allowedStrings,
].map((item) => `${validSubString}${item}${validSubString}`);

export const disallowedSubstringTestCases = [...disallowedSubstrings, ...disallowedCharacters].map((item) => `${validSubString}${item}${validSubString}`);

export const disallowedPrefixeTestCase = [...disallowedPrefixes].map((item) => `${item}${validSubString}`);

export const disallowedSuffixTestCase = [...disallowedSuffixes].map((item) => `${validSubString}${item}`);
