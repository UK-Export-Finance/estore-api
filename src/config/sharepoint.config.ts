import { registerAs } from '@nestjs/config';

export interface SharepointConfig {
  ukefSharepointName: string;
  tfisSiteName: string;
  tfisListId: string;
}

export default registerAs('sharepoint', (): SharepointConfig => {
  return {
    ukefSharepointName: process.env.SHAREPOINT_MAIN_SITE_NAME + '.sharepoint.com',
    tfisSiteName: process.env.SHAREPOINT_TFIS_SITE_NAME,
    tfisListId: process.env.SHAREPOINT_TFIS_LIST_ID,
  };
});
