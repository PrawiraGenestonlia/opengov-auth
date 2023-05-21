export const config = () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  sgid: {
    clientId: String(process.env.SGID_CLIENT_ID),
    clientSecret: String(process.env.SGID_CLIENT_SECRET),
    privateKey: String(process.env.SGID_PRIVATE_KEY),
    scope: String(process.env.SGID_SCOPE),
    redirectUri: String(process.env.HOST) + '/auth/callback',
    cookieName: String(process.env.SGID_COOKIE_NAME)
  },
  jwt: {
    issuer: String(process.env.JWT_ISSUER)
  }
})
