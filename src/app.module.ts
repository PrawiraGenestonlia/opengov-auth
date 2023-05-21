import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { config } from './config'
import { AuthModule } from './modules/auth/auth.module'
import { SgidModule } from './modules/sgid/sgid.module'
import { JwtModule } from '@nestjs/jwt'
import { KeyManagerModule } from './modules/key-manager/key-manager.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config]
    }),
    JwtModule.register({
      privateKey: String(process.env.JWT_PRIVATE_KEY),
      global: true
    }),
    AuthModule,
    SgidModule,
    KeyManagerModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
