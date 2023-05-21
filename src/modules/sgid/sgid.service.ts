import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import SgidClient, {
  AuthorizationUrlParams,
  CallbackParams,
  UserInfoParams,
  generatePkcePair
} from '@opengovsg/sgid-client'
import NodeCache from 'node-cache'

@Injectable()
export class SgidService {
  private readonly sgidClient: SgidClient
  public readonly session: NodeCache

  constructor(private readonly configService: ConfigService) {
    this.sgidClient = new SgidClient({
      clientId: String(this.configService.get('sgid.clientId')),
      clientSecret: String(this.configService.get('sgid.clientSecret')),
      redirectUri: this.configService.get('sgid.redirectUri'),
      privateKey: String(this.configService.get('sgid.privateKey'))
    })
    this.session = new NodeCache({ stdTTL: 600, checkperiod: 120 })
  }

  authorizeUrl(options: AuthorizationUrlParams) {
    return this.sgidClient.authorizationUrl(options)
  }

  callback(options: CallbackParams) {
    return this.sgidClient.callback(options)
  }

  userinfo(options: UserInfoParams) {
    return this.sgidClient.userinfo(options)
  }

  generatePkcePair() {
    return generatePkcePair()
  }
}
