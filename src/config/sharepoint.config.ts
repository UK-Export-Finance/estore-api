import { registerAs } from '@nestjs/config';

export interface SharepointConfig {
  tfisSharepointUrl: string;
  scSharepointUrl: string;
  scSiteFullUrl: string;
  tfisListId: string;
  tfisFacilityListId: string;
  tfisFacilityHiddenListTermStoreId: string;
}

// TODO: apim-139: raise ticket for deployment of new env vars
// TODO: apim-139: Check facility list id is named correctly (and not deal id)
export default registerAs('sharepoint', (): SharepointConfig => {
  return {
    tfisSharepointUrl: `sites/${process.env.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${process.env.SHAREPOINT_TFIS_SITE_NAME}`,
    scSharepointUrl: `sites/${process.env.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${process.env.SHAREPOINT_SC_SITE_NAME}`,
    scSiteFullUrl: `https://${process.env.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com/sites/${process.env.SHAREPOINT_SC_SITE_NAME}`,
    tfisListId: process.env.SHAREPOINT_TFIS_LIST_ID,
    tfisFacilityListId: process.env.SHAREPOINT_TFIS_FACILITY_LIST_ID,
    tfisFacilityHiddenListTermStoreId: process.env.SHAREPOINT_TFIS_FACILITY_HIDDEN_LIST_TERM_STORE_ID,
  };
});
