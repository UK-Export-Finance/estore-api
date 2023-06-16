import { registerAs } from '@nestjs/config';

export interface DtfsConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  tenantId: string;
  scope: string;
}

export default registerAs('dtfs', (): DtfsConfig => {
  return {
    baseUrl: process.env.DTFS_BASE_URL,
    clientId: process.env.DTFS_AUTHENTICATION_CLIENT_ID,
    clientSecret: process.env.DTFS_AUTHENTICATION_CLIENT_SECRET,
    tenantId: process.env.DTFS_AUTHENTICATION_TENANT_ID,
    scope: 'https://storage.azure.com/.default',
  };
});
