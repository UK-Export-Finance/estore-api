// Defining multiple String Literal Types, this doesn't support constants.
type SiteUkefIdStart = '070';

// Value example 07000001
export type UkefSiteId = `${SiteUkefIdStart}${number}`;
