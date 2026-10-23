// Segments that could be used to reach the prototype chain and pollute it via a crafted path.
const UNSAFE_PATH_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);

const isPathAllowed = (path: string): boolean => path.split('.').every((segment) => !UNSAFE_PATH_SEGMENTS.has(segment));

// Only traverse own data properties; inherited objects must never be mutated.
const redactOwnPath = (target: unknown, path: string, redactStrings: { searchValue: string | RegExp; replaceValue: string }[]): void => {
  const segments = path.split('.');
  let current: unknown = target;

  for (const [index, segment] of segments.entries()) {
    if (typeof current !== 'object' || current === null) {
      return;
    }

    const descriptor = Object.getOwnPropertyDescriptor(current, segment);

    if (!descriptor || !('value' in descriptor)) {
      return;
    }

    const value: unknown = descriptor.value;

    if (index === segments.length - 1) {
      if (typeof value === 'string' && value) {
        Object.defineProperty(current, segment, { ...descriptor, value: redactString(redactStrings, value) });
      }

      return;
    }

    current = value;
  }
};

// This helper function is used to redact sensitive data in Error object strings.
export const redactStringsInLogArgs = (
  redactLogs: boolean,
  redactPaths: string[],
  redactStrings: { searchValue: string | RegExp; replaceValue: string }[],
  args: any[],
): any => {
  if (!redactLogs) {
    return args;
  }

  args.forEach((arg) => {
    redactPaths.forEach((path) => {
      if (!isPathAllowed(path)) {
        return;
      }

      redactOwnPath(arg, path, redactStrings);
    });
  });
  return args;
};

const redactString = (redactStrings: { searchValue: string | RegExp; replaceValue: string }[], logMessage: string): string => {
  let safeString: string = logMessage;

  redactStrings.forEach((redact) => {
    safeString = safeString.replaceAll(redact.searchValue, redact.replaceValue);
  });

  return safeString;
};
