import { registerAs } from '@nestjs/config';

export interface SharepointConfig {
  tfisSharepointUrl: string;
  scSharepointUrl: string;
  scSiteFullUrl: string;
  tfisFacilityListId: string;
  tfisFacilityHiddenListTermStoreId: string;
  tfisDealListId: string;
  tfisCaseSitesListId: string;
  taxonomyHiddenListTermStoreListId: string;
}

// TODO APIM-139: Check facility list id is named correctly (and not deal id)
export default registerAs('sharepoint', (): SharepointConfig => {
  return {
    tfisSharepointUrl: `sites/${process.env.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${process.env.SHAREPOINT_TFIS_SITE_NAME}:`,
    scSharepointUrl: `sites/${process.env.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${process.env.SHAREPOINT_SC_SITE_NAME}:`,
    scSiteFullUrl: `https://${process.env.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com/sites/${process.env.SHAREPOINT_SC_SITE_NAME}`,
    tfisFacilityListId: process.env.SHAREPOINT_TFIS_FACILITY_LIST_ID,
    tfisFacilityHiddenListTermStoreId: process.env.SHAREPOINT_TFIS_FACILITY_HIDDEN_LIST_TERM_STORE_ID,
    tfisDealListId: process.env.SHAREPOINT_TFIS_DEAL_LIST_ID,
    tfisCaseSitesListId: process.env.SHAREPOINT_TFIS_CASE_SITES_LIST_ID,
    taxonomyHiddenListTermStoreListId: process.env.SHAREPOINT_TAXONOMY_HIDDEN_LIST_TERM_STORE_LIST_ID,
  };
});
