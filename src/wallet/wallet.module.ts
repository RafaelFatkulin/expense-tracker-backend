import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [WalletController],
  providers: [WalletService, PrismaService],
  exports: [WalletService],
})
export class WalletModule {}
