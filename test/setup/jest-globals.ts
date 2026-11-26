import { createRequire } from 'module';

// @ts-ignore - import.meta is ESM-only
const require = createRequire(import.meta.url);
globalThis.jest = require('@jest/globals').jest;
