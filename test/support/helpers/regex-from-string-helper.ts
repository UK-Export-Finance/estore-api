/**
 * Rebuilds a `RegExp` from its string source. Used in tests to assert that a regex converted to a string
 * (for example by `regexToString`) round-trips back into an equivalent regular expression.
 */
export const regexFromString = (source: string): RegExp => new RegExp(source);
