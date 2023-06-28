// Start of id differs depending on environment
type DealFacilityUkefIdStart = '0020' | '0030' | '0040';

// Value example 0030000321
export type UkefId = `${DealFacilityUkefIdStart}${number}`;

// Defining multiple String Literal Types, this doesn't support constants.
type SiteUkefIdStart = '0070';

// Value example 007000001
export type UkefSiteId = `${SiteUkefIdStart}${number}`;
