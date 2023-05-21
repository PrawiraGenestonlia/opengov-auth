/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const jose = require('node-jose')
const keyStore = jose.JWK.createKeyStore()
keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' }).then(() => {
  fs.writeFileSync('secret.json', JSON.stringify(keyStore.toJSON(true), null, '  '))
})
