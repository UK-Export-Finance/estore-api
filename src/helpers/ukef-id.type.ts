// Defining multiple String Literal Types, this doesn't support constants.
type SiteUkefIdStart = '0070';

// Value example 007000001
export type UkefSiteId = `${SiteUkefIdStart}${number}`;
