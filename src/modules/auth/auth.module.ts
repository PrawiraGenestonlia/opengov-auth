import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { SgidModule } from '../sgid/sgid.module'
import { KeyManagerModule } from '../key-manager/key-manager.module'

@Module({
  imports: [SgidModule, KeyManagerModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
