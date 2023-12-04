import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailSenderModule } from './mail-sender/mail-sender.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 50,
    }),
    UserModule,
    AuthModule,
    MailSenderModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    AppService,
  ],
})
export class AppModule {}
