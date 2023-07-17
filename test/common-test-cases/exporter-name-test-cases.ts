interface exporterNameRegexTestCase {
  value: string;
  testTitle: string;
}

const validSubstring = 'substring';
const disallowedPrefixesAndSuffixes = [' '];
const disallowedPrefixes = ['~$'];
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

export const allowedStringTestCases = [...allowedStrings].map((testCaseValue) => {
  return { value: testCaseValue, testTitle: `Allowed as a string: '${testCaseValue}'` };
});

export const disallowedStringTestCases: exporterNameRegexTestCase[] = [
  ...disallowedPrefixesAndSuffixes,
  ...disallowedPrefixes,
  ...disallowedCharacters,
  ...disallowedSubstrings,
  ...disallowedStrings,
  ...disallowedStringsOnRoot,
].map((testCaseValue) => {
  return { value: testCaseValue, testTitle: `Disallowed as a string: '${testCaseValue}'` };
});

export const allowedSubstringTestCases: exporterNameRegexTestCase[] = [
  ...disallowedPrefixesAndSuffixes,
  ...disallowedPrefixes,
  ...disallowedStrings,
  ...disallowedStringsOnRoot,
  ...allowedStrings,
].map((testCaseValue) => {
  return { value: `${validSubstring}${testCaseValue}${validSubstring}`, testTitle: `Allowed as a substring: '${testCaseValue}'` };
});

export const disallowedSubstringTestCases: exporterNameRegexTestCase[] = [...disallowedSubstrings, ...disallowedCharacters].map((testCaseValue) => {
  return { value: `${validSubstring}${testCaseValue}${validSubstring}`, testTitle: `Disallowed substring: '${testCaseValue}'` };
});

export const allowedPrefixTestCases: exporterNameRegexTestCase[] = [...disallowedStrings, ...disallowedStringsOnRoot].map((testCaseValue) => {
  return { value: `${testCaseValue}${validSubstring}`, testTitle: `Allowed as a prefix: '${testCaseValue}'` };
});

export const disallowedPrefixTestCases: exporterNameRegexTestCase[] = [
  ...disallowedPrefixesAndSuffixes,
  ...disallowedPrefixes,
  ...disallowedCharacters,
  ...disallowedSubstrings,
].map((testCaseValue) => {
  return { value: `${testCaseValue}${validSubstring}`, testTitle: `Disallowed as a prefix: '${testCaseValue}'` };
});

export const allowedSuffixTestCases: exporterNameRegexTestCase[] = [...disallowedPrefixes, ...disallowedStrings, ...disallowedStringsOnRoot].map(
  (testCaseValue) => {
    return { value: `${validSubstring}${testCaseValue}`, testTitle: `Allowed as a suffix: '${testCaseValue}'` };
  },
);

export const disallowedSuffixTestCases: exporterNameRegexTestCase[] = [...disallowedPrefixesAndSuffixes, ...disallowedCharacters, ...disallowedSubstrings].map(
  (testCaseValue) => {
    return { value: `${validSubstring}${testCaseValue}`, testTitle: `Disallowed as a suffix: '${testCaseValue}'` };
  },
);
