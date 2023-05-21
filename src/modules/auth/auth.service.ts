import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request, Response } from 'express'
import crypto from 'crypto'
import { SgidService } from '../sgid/sgid.service'
import { SgidSessionStoreObject } from 'src/types'
import { userInfo } from 'os'
import { KeyManagerService } from '../key-manager/key-manager.service'

@Injectable()
export class AuthService {
  private cookieName = String(this.configService.get('sgid.cookieName'))

  constructor(
    private readonly configService: ConfigService,
    private readonly sgidService: SgidService,
    private readonly keyManagerService: KeyManagerService
  ) {}

  login(response: Response, redirectUrl: string, state?: string) {
    const sgidSession = crypto.randomUUID()
    const pkcePair = this.sgidService.generatePkcePair()
    const { url, nonce } = this.sgidService.authorizeUrl({
      state,
      codeChallenge: pkcePair.codeChallenge,
      scope: this.configService.get('sgid.scope')
    })

    this.sgidService.session.set<SgidSessionStoreObject>(sgidSession, {
      codeVerifier: pkcePair.codeVerifier,
      state,
      redirectUrl,
      nonce
    })

    response.cookie(this.cookieName, sgidSession, { httpOnly: true })
    return response.redirect(url)
  }

  async callback(request: Request, response: Response, code: string, state?: string) {
    const sgidSession = request.cookies[this.cookieName]
    const sessionStorage = this.sgidService.session.get<SgidSessionStoreObject>(sgidSession || '')
    if (!sessionStorage || state !== sessionStorage.state) {
      return response.redirect('/auth/login')
    }

    const { accessToken, sub } = await this.sgidService.callback({
      code,
      codeVerifier: sessionStorage.codeVerifier,
      nonce: sessionStorage.nonce
    })

    const userinfo = await this.sgidService.userinfo({ accessToken, sub })
    if (!userInfo) {
      return response.redirect('/auth/login')
    }

    const jwtToken = await this.keyManagerService.sign({
      ...userinfo,
      iss: this.configService.get('jwt.issuer'),
      aud: sessionStorage.redirectUrl || 'http://localhost',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
      iat: Math.floor(Date.now() / 1000)
    })

    this.sgidService.session.del(sgidSession)
    response.clearCookie(this.cookieName)
    const topLevelDomain = request.headers.host?.split('.').slice(-2).join('.')?.split(':')[0]
    response.cookie('ssoToken', jwtToken, { httpOnly: true, secure: true, sameSite: 'strict', domain: topLevelDomain })
    if (sessionStorage.redirectUrl) {
      // extract main domain from request
      return response.redirect(sessionStorage.redirectUrl + '?token=' + jwtToken)
    } else {
      return { userinfo, jwtToken }
    }
  }

  async verify(request: Request) {
    if (!request.headers.authorization) throw new BadRequestException('No authorization header')
    if (request.headers.authorization.split(' ')?.length !== 2)
      throw new BadRequestException('Bearer token is corrupted')
    return this.keyManagerService.verify(
      request.headers.authorization?.split(' ')[1],
      String(this.configService.get('jwt.issuer'))
    )
  }
}
