import { registerAs } from '@nestjs/config';
import { getIntConfig } from '@ukef/helpers/get-int-config';

export const KEY = 'custodian';

export interface CustodianConfig {
  baseUrl: string;
  apiKeyHeaderName: string;
  apiKeyHeaderValue: string;
  maxRedirects: number;
  timeout: number;
  buyerTemplateId: string;
  buyerTypeGuid: string;
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
    maxRedirects: getIntConfig(process.env.CUSTODIAN_MAX_REDIRECTS, 5),
    timeout: getIntConfig(process.env.CUSTODIAN_TIMEOUT, 30000),
    buyerTemplateId: process.env.CUSTODIAN_BUYER_TEMPLATE_ID,
    buyerTypeGuid: process.env.CUSTODIAN_BUYER_TYPE_GUID,
    dealTemplateId: process.env.CUSTODIAN_DEAL_TEMPLATE_ID,
    dealTypeGuid: process.env.CUSTODIAN_DEAL_TYPE_GUID,
    facilityTemplateId: process.env.CUSTODIAN_FACILITY_TEMPLATE_ID,
    facilityTypeGuid: process.env.CUSTODIAN_FACILITY_TYPE_GUID,
  }),
);
