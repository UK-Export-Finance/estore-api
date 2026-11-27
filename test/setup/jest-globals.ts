import { createRequire } from 'module';

/**
 * Make jest globally available without interfering with module resolution.
 * Uses createRequire to access jest in ESM context, then immediately assigns to globalThis.
 * This runs AFTER the test environment is initialized, so relative module paths in test files
 * are correctly resolved from the test file's directory, not from this setup file.
 */
// @ts-ignore - import.meta is ESM-only
const require = createRequire(import.meta.url);
globalThis.jest = require('@jest/globals').jest;
