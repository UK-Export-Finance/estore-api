import { registerAs } from '@nestjs/config';

export interface SharepointConfig {
  ukefSharepointName: string;
  tfisSiteName: string;
  tfisScSiteName: string;
  tfisListId: string;
  tfisTermStoreId: string;
  tfisFacilityListId: string;
  tfisFacilityHiddenListTermStoreId: string;
}

// TODO: apim-139: raise ticket for deployment of new env vars
// TODO: apim-139: Check facility list id is named correctly (and not deal id)
export default registerAs('sharepoint', (): SharepointConfig => {
  return {
    ukefSharepointName: process.env.SHAREPOINT_MAIN_SITE_NAME + '.sharepoint.com',
    tfisSiteName: process.env.SHAREPOINT_TFIS_SITE_NAME,
    tfisScSiteName: process.env.SHAREPOINT_TFIS_SC_SITE_NAME,
    tfisListId: process.env.SHAREPOINT_TFIS_LIST_ID,
    tfisTermStoreId: process.env.SHAREPOINT_TFIS_TERM_STORE,
    tfisFacilityListId: process.env.SHAREPOINT_TFIS_FACILITY_LIST_ID,
    tfisFacilityHiddenListTermStoreId: process.env.SHAREPOINT_TFIS_FACILITY_HIDDEN_LIST_TERM_STORE_ID,
  };
});
