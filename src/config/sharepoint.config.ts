import { registerAs } from '@nestjs/config';

export interface SharepointConfig {
  baseUrl: string;
  ukefSharepointName: string;
  tfisSharepointUrl: string;
  scSharepointUrl: string;
  scSiteFullUrl: string;
  scCaseSitesListId: string;
  tfisFacilityListId: string;
  tfisFacilityListTitle: string;
  tfisFacilityHiddenListTermStoreId: string;
  tfisDealListId: string;
  tfisCaseSitesListId: string;
  taxonomyHiddenListTermStoreListId: string;
  estoreDocumentTypeIdFieldName: string;
  estoreDocumentTypeIdApplication: string;
  estoreDocumentTypeIdFinancialStatement: string;
  estoreDocumentTypeIdBusinessInformation: string;
  ecmsDocumentContentTypeId: string;
}

export default registerAs('sharepoint', (): SharepointConfig => {
  return {
    baseUrl: process.env.SHAREPOINT_BASE_URL,
    ukefSharepointName: `${process.env.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com`,
    tfisSharepointUrl: `sites/${process.env.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${process.env.SHAREPOINT_TFIS_SITE_NAME}:`,
    scSharepointUrl: `sites/${process.env.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${process.env.SHAREPOINT_SC_SITE_NAME}:`,
    scSiteFullUrl: `https://${process.env.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com/sites/${process.env.SHAREPOINT_SC_SITE_NAME}`,
    scCaseSitesListId: process.env.SHAREPOINT_SC_CASE_SITES_LIST_ID,
    tfisFacilityListId: process.env.SHAREPOINT_TFIS_FACILITY_LIST_ID,
    tfisFacilityListTitle: process.env.SHAREPOINT_TFIS_FACILITY_LIST_TITLE,
    tfisFacilityHiddenListTermStoreId: process.env.SHAREPOINT_TFIS_FACILITY_HIDDEN_LIST_TERM_STORE_ID,
    tfisDealListId: process.env.SHAREPOINT_TFIS_DEAL_LIST_ID,
    tfisCaseSitesListId: process.env.SHAREPOINT_TFIS_CASE_SITES_LIST_ID,
    taxonomyHiddenListTermStoreListId: process.env.SHAREPOINT_TAXONOMY_HIDDEN_LIST_TERM_STORE_LIST_ID,
    estoreDocumentTypeIdFieldName: process.env.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_FIELD_NAME,
    estoreDocumentTypeIdApplication: process.env.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_APPLICATION,
    estoreDocumentTypeIdFinancialStatement: process.env.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_FINANCIAL_STATEMENT,
    estoreDocumentTypeIdBusinessInformation: process.env.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_BUSINESS_INFORMATION,
    ecmsDocumentContentTypeId: process.env.SHAREPOINT_ECMS_DOCUMENT_CONTENT_TYPE_ID,
  };
});
