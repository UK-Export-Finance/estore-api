import { registerAs } from '@nestjs/config';

export const KEY = 'custodian';

export interface CustodianConfig {
  baseUrl: string;
  apiKeyHeaderName: string;
  apiKeyHeaderValue: string;
  maxRedirects: number;
  timeout: number;
  dealTemplateId: string;
  dealTypeGuid: string;
  facilityTemplateId: string;
  facilityTypeGuid: string;
}

export default registerAs(
  KEY,
  (): CustodianConfig => ({
    baseUrl: process.env.CUSTODIAN_BASE_URL,
    apiKeyHeaderName: process.env.CUSTODIAN_API_KEY_HEADER_NAME,
    apiKeyHeaderValue: process.env.CUSTODIAN_API_KEY_HEADER_VALUE,
    maxRedirects: parseInt(process.env.CUSTODIAN_MAX_REDIRECTS) || 5,
    timeout: parseInt(process.env.CUSTODIAN_TIMEOUT) || 30000,
    dealTemplateId: process.env.CUSTODIAN_DEAL_TEMPLATE_ID,
    dealTypeGuid: process.env.CUSTODIAN_DEAL_TYPE_GUID,
    facilityTemplateId: process.env.CUSTODIAN_FACILITY_TEMPLATE_ID,
    facilityTypeGuid: process.env.CUSTODIAN_FACILITY_TYPE_GUID,
  }),
);
