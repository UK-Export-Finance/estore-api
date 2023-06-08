import './load-dotenv';

import { registerAs } from '@nestjs/config';

export default registerAs(
  'doc',
  (): Record<string, any> => ({
    name: process.env.DOC_NAME || 'ESTORE API Specification',
    description: 'ESTORE API documentation',
    version: process.env.DOC_VERSION || '1.0',
    prefix: '/docs',
  }),
);
