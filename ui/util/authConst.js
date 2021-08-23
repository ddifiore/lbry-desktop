export const IDENTITY_CONFIG = {
  authority: 'https://sso.odysee.com/auth/realms/Users', // (string): The URL of the OIDC provider.
  client_id: 'odysee.com', // (string): Your client application's identifier as registered with the OIDC provider.
  redirect_uri: process.env.REACT_APP_REDIRECT_URL, // The URI of your client application to receive a response from the OIDC provider.
  login: process.env.REACT_APP_AUTH_URL + '/oidclogin',
  logout: process.env.REACT_APP_AUTH_URL,
  automaticSilentRenew: true, // (boolean, default: false): Flag to indicate if there should be an automatic attempt to renew the access token prior to its expiration.
  loadUserInfo: true, // (boolean, default: true): Flag to control if additional identity data is loaded from the user info endpoint in order to populate the user's profile.
  silent_redirect_uri: process.env.REACT_APP_SILENT_REDIRECT_URL, // (string): The URL for the page containing the code handling the silent renew.
  post_logout_redirect_uri: process.env.REACT_APP_LOGOFF_REDIRECT_URL, // (string): The OIDC post-logout redirect URI.
  // audience: 'https://example.com', // is there a way to specific the audience when making the jwt
  responseType: 'code', // (string, default: 'id_token'): The type of response desired from the OIDC provider.
  grantType: 'authorization_code',
  scope: 'openid internal-apis odysee-apis', // (string, default: 'openid'): The scope being requested from the OIDC provider.
  webAuthResponseType: 'id_token code',
};

export const METADATA_OIDC = {
  issuer: 'https://sso.odysee.com/auth/realms/Users',
  jwks_uri: 'https://sso.odysee.com/auth/realms/Users/protocol/openid-connect/certs',
  authorization_endpoint: 'https://sso.odysee.com/auth/realms/Users/protocol/openid-connect/auth',
  token_endpoint: 'https://sso.odysee.com/auth/realms/Users/protocol/openid-connect/token',
  userinfo_endpoint: 'https://sso.odysee.com/auth/realms/Users/protocol/openid-connect/userinfo',
  end_session_endpoint: 'https://sso.odysee.com/auth/realms/Users/protocol/openid-connect/logout',
  check_session_iframe: 'https://sso.odysee.com/auth/realms/Users/protocol/openid-connect/login-status-iframe.html',
  revocation_endpoint: 'https://sso.odysee.com/auth/realms/Users/protocol/openid-connect/revoke',
  introspection_endpoint: 'https://sso.odysee.com/auth/realms/Users/protocol/openid-connect/token/introspect',
};
