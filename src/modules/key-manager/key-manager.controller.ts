import { Controller, Get, Res } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { KeyManagerService } from './key-manager.service'
import { Response } from 'express'

@ApiTags('key-manager')
@Controller({
  path: ''
})
export class KeyManagerController {
  constructor(private readonly keyManagerService: KeyManagerService) {}

  @Get('/.well-known/jwks.json')
  getKeys(@Res({ passthrough: true }) response: Response) {
    return this.keyManagerService.getKeys(response)
  }
}
