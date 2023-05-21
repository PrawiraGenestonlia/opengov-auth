import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { Response } from 'express'
import fs from 'fs'
import jose from 'node-jose'

@Injectable()
export class KeyManagerService {
  private keyStore: jose.JWK.KeyStore | undefined

  async loadKeys() {
    const ks = fs.readFileSync('secret.json')
    if (!this.keyStore) this.keyStore = await jose.JWK.asKeyStore(ks.toString())
  }

  async getKeys(response: Response) {
    await this.loadKeys()
    if (!this.keyStore) throw new InternalServerErrorException('Key store not loaded')
    return response.send(this.keyStore.toJSON())
  }

  async sign(payload: object) {
    await this.loadKeys()
    if (!this.keyStore) throw new InternalServerErrorException('Key store not loaded')
    const [key] = this.keyStore.all({ use: 'sig' })
    const token = await jose.JWS.createSign(
      {
        compact: true,
        fields: { typ: 'jwt' },
        alg: 'RS256'
      },
      key
    )
      .update(JSON.stringify({ ...payload, kid: key.kid, kty: key.kty }))
      .final()
    return token
  }

  async verify(token: string, issuer: string) {
    await this.loadKeys()
    if (!this.keyStore) throw new InternalServerErrorException('Key store is not loaded')
    const [key] = this.keyStore.all({ use: 'sig' })
    const result = await jose.JWS.createVerify(key)
      .verify(token)
      .catch(() => {
        throw new BadRequestException('Token is not verified')
      })
    if (!result) throw new BadRequestException('Token is not verified')
    const payload = JSON.parse(result.payload.toString())
    if (payload.exp < Date.now() / 1000) throw new BadRequestException('Token has expired')
    if (payload.iss !== issuer) throw new BadRequestException('Token is not issued by this server')
    return payload
  }
}
