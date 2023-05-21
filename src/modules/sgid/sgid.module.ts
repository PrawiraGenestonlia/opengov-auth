import { Module } from '@nestjs/common'
import { SgidService } from './sgid.service'

@Module({
  providers: [SgidService],
  exports: [SgidService]
})
export class SgidModule {}
