interface SharepointFolderNameRegexTestCase {
  value: string;
  testTitle: string;
}

const validSubstring = 'substring';
const disallowedPrefixesAndSuffixes = [' '];
const disallowedPrefixes = ['~$'];
const disallowedCharacters = ['"', '*', '<', '>', '?', '/', '\\', '|', ':'];
const disallowedSubstrings = ['_vti_'];
const disallowedStrings = ['.lock', 'CON', 'PRN', 'AUX', 'NUL', 'COM0', 'COM5', 'COM9', 'LPT0', 'LPT5', 'LPT9', 'desktop.ini'];
const disallowedStringsOnRoot = ['forms'];
const allowedStrings = [
  'testString',
  'Test String With Spaces',
  'testStringWith$Symbol',
  'commonAccentedCharacters áÁàÀâÂäÄãÃåÅæÆçÇéÉèÈêÊëËíÍìÌîÎïÏñÑóÓòÒôÔöÖõÕøØœŒßúÚùÙûÛüÜ',
  '.loc',
  'COMA',
  // cspell:disable-next-line
  'alock',
  // cspell:disable-next-line
  'desktopaini',
];

export const allowedStringTestCases = [...allowedStrings].map((testCaseValue) => {
  return { value: testCaseValue, testTitle: `'${testCaseValue}' is allowed as a string (testing string '${testCaseValue}')` };
});

export const disallowedStringTestCases: SharepointFolderNameRegexTestCase[] = [
  ...disallowedPrefixesAndSuffixes,
  ...disallowedPrefixes,
  ...disallowedCharacters,
  ...disallowedSubstrings,
  ...disallowedStrings,
  ...disallowedStringsOnRoot,
].map((testCaseValue) => {
  return { value: testCaseValue, testTitle: `'${testCaseValue}' is disallowed as a string (testing string '${testCaseValue}')` };
});

export const allowedSubstringTestCases: SharepointFolderNameRegexTestCase[] = [
  ...disallowedPrefixesAndSuffixes,
  ...disallowedPrefixes,
  ...disallowedStrings,
  ...disallowedStringsOnRoot,
  ...allowedStrings,
].map((testCaseValue) => {
  const testString = `${validSubstring}${testCaseValue}${validSubstring}`;
  return { value: testString, testTitle: `'${testCaseValue}' is allowed as a substring (testing string '${testString}')` };
});

export const disallowedSubstringTestCases: SharepointFolderNameRegexTestCase[] = [...disallowedSubstrings, ...disallowedCharacters].map((testCaseValue) => {
  const testString = `${validSubstring}${testCaseValue}${validSubstring}`;
  return { value: testString, testTitle: `'${testCaseValue}' is disallowed as a substring (testing string '${testString}')` };
});

export const allowedPrefixTestCases: SharepointFolderNameRegexTestCase[] = [...disallowedStrings, ...disallowedStringsOnRoot].map((testCaseValue) => {
  const testString = `${testCaseValue}${validSubstring}`;
  return { value: testString, testTitle: `'${testCaseValue}' is allowed as a prefix (testing string '${testString}')` };
});

export const disallowedPrefixTestCases: SharepointFolderNameRegexTestCase[] = [
  ...disallowedPrefixesAndSuffixes,
  ...disallowedPrefixes,
  ...disallowedCharacters,
  ...disallowedSubstrings,
].map((testCaseValue) => {
  const testString = `${testCaseValue}${validSubstring}`;
  return { value: testString, testTitle: `'${testCaseValue}' is disallowed as a prefix (testing string '${testString}')` };
});

export const allowedSuffixTestCases: SharepointFolderNameRegexTestCase[] = [...disallowedPrefixes, ...disallowedStrings, ...disallowedStringsOnRoot].map(
  (testCaseValue) => {
    const testString = `${validSubstring}${testCaseValue}`;
    return { value: testString, testTitle: `'${testCaseValue}' is allowed as a suffix (testing string '${testString}')` };
  },
);

export const disallowedSuffixTestCases: SharepointFolderNameRegexTestCase[] = [
  ...disallowedPrefixesAndSuffixes,
  ...disallowedCharacters,
  ...disallowedSubstrings,
].map((testCaseValue) => {
  const testString = `${validSubstring}${testCaseValue}`;
  return { value: testString, testTitle: `'${testCaseValue}' is disallowed as a suffix (testing string '${testString}')` };
});
