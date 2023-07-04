import { TermsFacilityExistsException } from '../terms/exception/terms-facility-exists.exception';

export type KnownErrors = KnownError[];

export type KnownError = { caseInsensitiveSubstringsToFind: string[]; throwError: (error: Error) => never };

export const postFacilityTermExistsKnownError = (): KnownError => ({
  caseInsensitiveSubstringsToFind: ['One or more fields with unique constraints already has the provided value'],
  throwError: (error) => {
    throw new TermsFacilityExistsException('Facility Term item with this identifier already exists.', error);
  },
});
