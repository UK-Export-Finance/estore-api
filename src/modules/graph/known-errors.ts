export type KnownErrors = KnownError[];

export type KnownError = { caseInsensitiveSubstringsToFind: string[]; throwError: (error: Error) => never };
