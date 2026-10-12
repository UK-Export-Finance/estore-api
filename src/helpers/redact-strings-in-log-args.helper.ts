import { get } from 'lodash';

// Segments that could be used to reach the prototype chain and pollute it via a crafted path.
const UNSAFE_PATH_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);

const isPathAllowed = (path: string): boolean => path.split('.').every((segment) => !UNSAFE_PATH_SEGMENTS.has(segment));

// Sets a value at a dotted path, only ever creating/traversing own properties so the prototype chain cannot be touched.
const setOwnPath = (target: Record<string, any>, path: string, value: unknown): void => {
  const segments = path.split('.');
  let current: Record<string, any> = target;

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] = value;

      return;
    }

    if (!Object.prototype.hasOwnProperty.call(current, segment) || typeof current[segment] !== 'object' || current[segment] === null) {
      current[segment] = {};
    }

    current = current[segment];
  });
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

  args.forEach((arg, index) => {
    redactPaths.forEach((path) => {
      if (!isPathAllowed(path)) {
        return;
      }

      const value: string = get(arg, path);

      if (value) {
        const safeValue = redactString(redactStrings, value);
        setOwnPath(args[index], path, safeValue);
      }
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
