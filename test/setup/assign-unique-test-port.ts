/**
 * Assigns a unique port to each API test suite to prevent port conflicts when test suites run sequentially.
 *
 * Each test file gets a unique port based on a hash of its filename.
 * This ensures that if multiple test suites run one after another, they don't collide on the same port
 * during the TCP socket cleanup period (TIME_WAIT state).
 *
 * With maxWorkers: 1 in jest.config.ts, test suites run sequentially, so each app instance
 * is fully created and destroyed before the next one starts, allowing time for sockets to close.
 */

import { createHash } from 'crypto';

const BASE_PORT = 3100;
const PORT_RANGE = 100;

// Get the current test file path from Jest's environment
const testFile = process.env.JEST_WORKER_ID || 'default';

// Create a stable hash of the test file path to get a consistent port
const hash = createHash('sha256').update(testFile).digest('hex');
const hashNumber = parseInt(hash.slice(0, 8), 16);
const portOffset = hashNumber % PORT_RANGE;
const port = BASE_PORT + portOffset;

process.env.PORT = String(port);
