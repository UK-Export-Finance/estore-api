export const TEST = {
  /**
   * Matches any string containing the substring `test`.
   *
   * Examples:
   * - `test` (an exact match)
   * - `a test case` (contains `test` as a substring)
   *
   * Does not match:
   * - `tes` (missing the final `t`)
   */
  SIMPLE_WORD: /test/,

  /**
   * Matches any string containing the literal substring `test/test`.
   *
   * Examples:
   * - `test/test`
   *
   * Does not match:
   * - `testtest` (missing the `/` separator)
   */
  WORD_WITH_FORWARD_SLASH: /test\/test/,

  /**
   * Matches a string of word characters, hyphens, periods, parentheses, and whitespace, that does not start
   * with whitespace and does not end with whitespace or a period.
   *
   * Examples:
   * - `My Folder (final)` (no leading/trailing whitespace, and does not end with a period)
   *
   * Does not match:
   * - ` My Folder` (starts with whitespace)
   * - `My Folder.` (ends with a period)
   */
  WORD_CHARACTERS_WITHOUT_SURROUNDING_WHITESPACE: /^(?!\s)[\w\-.()\s]+(?<![\s.])$/,

  /**
   * Matches a string consisting only of word characters, hyphens, colons, forward slashes, backslashes,
   * parentheses, and whitespace.
   *
   * Examples:
   * - `folder/sub-folder:1 (final)`
   *
   * Does not match:
   * - `folder*name` (contains the disallowed character `*`)
   */
  WORD_CHARACTERS_WITH_SLASHES: /^[\w\-:/\\()\s]+$/,

  /**
   * Matches the message `Login failed for user '<username>'` and captures the quote characters either side
   * of the username (groups `$1` and `$2`), so the username can be redacted while keeping the quotes.
   *
   * Examples:
   * - `Login failed for user 'bob'` (captures `'` before and after `bob`)
   *
   * Does not match:
   * - `Login succeeded for user 'bob'` (does not contain the phrase `Login failed for user '`)
   */
  LOGIN_FAILED_FOR_USER: /(Login failed for user ').*(')/g,
};
