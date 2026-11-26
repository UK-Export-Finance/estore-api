// Start of id differs depending on environment
type DealFacilityUkefIdStart = '0020' | '0030' | '0040';

// Value example 0030000321
export type UkefId = `${DealFacilityUkefIdStart}${number}`;
