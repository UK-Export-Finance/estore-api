// Defining multiple String Literal Types, this doesn't support constants.
// Start of id differs depending on environment
type DealFacilityUkefIdStart = '0020' | '0030' | '0040';
type SiteUkefIdStart = '070';

// Value example 0030000321
export type UkefId = `${DealFacilityUkefIdStart}${number}`;

// Value example 07000001
export type UkefSiteId = `${SiteUkefIdStart}${number}`;
