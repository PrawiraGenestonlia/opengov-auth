import { Module } from '@nestjs/common'
import { KeyManagerService } from './key-manager.service'
import { KeyManagerController } from './key-manager.controller'

@Module({
  providers: [KeyManagerService],
  controllers: [KeyManagerController],
  exports: [KeyManagerService]
})
export class KeyManagerModule {}
