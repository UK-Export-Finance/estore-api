import { registerAs } from '@nestjs/config';

export interface GraphAuthenticationConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  scope: string;
}

export default registerAs('graphAuthentication', (): GraphAuthenticationConfig => {
  return {
    clientId: process.env.GRAPH_AUTHENTICATION_CLIENT_ID,
    clientSecret: process.env.GRAPH_AUTHENTICATION_CLIENT_SECRET,
    tenantId: process.env.GRAPH_AUTHENTICATION_TENANT_ID,
    scope: `openid offline_access ${process.env.GRAPH_BASE_URL}/.default`,
  };
});
