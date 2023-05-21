import { Controller, Get, Query, Req, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'

@ApiTags('auth')
@Controller({
  path: 'auth'
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/login')
  login(
    @Res({ passthrough: true }) response: Response,
    @Query('redirectUrl') redirectUrl: string,
    @Query('state') state?: string
  ) {
    return this.authService.login(response, redirectUrl, state)
  }

  @Get('/callback')
  callback(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Query('code') code: string,
    @Query('state') state?: string
  ) {
    return this.authService.callback(request, response, code, state)
  }

  @ApiBearerAuth('access-token')
  @Get('/verify')
  verify(@Req() request: Request) {
    return this.authService.verify(request)
  }
}
