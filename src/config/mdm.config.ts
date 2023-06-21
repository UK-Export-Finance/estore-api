import { registerAs } from '@nestjs/config';

export const KEY = 'mdm';

export interface MdmConfig {
  baseUrl: string;
  apiKeyHeaderName: string;
  apiKeyHeaderValue: string;
  maxRedirects: number;
  timeout: number;
}

export default registerAs(
  KEY,
  (): MdmConfig => ({
    baseUrl: process.env.MDM_BASE_URL,
    apiKeyHeaderName: process.env.MDM_API_KEY_HEADER_NAME,
    apiKeyHeaderValue: process.env.MDM_API_KEY_HEADER_VALUE,
    // TODO APIM-133: what about 0?
    maxRedirects: parseInt(process.env.MDM_MAX_REDIRECTS) || 5,
    timeout: parseInt(process.env.MDM_TIMEOUT) || 30000,
  }),
);
