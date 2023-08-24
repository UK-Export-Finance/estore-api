export const REDACT_STRINGS = [
  { searchValue: process.env.GRAPH_AUTHENTICATION_CLIENT_ID, replaceValue: '[Redacted]' },
  { searchValue: process.env.CUSTODIAN_API_KEY_HEADER_VALUE, replaceValue: '[Redacted]' },
];
