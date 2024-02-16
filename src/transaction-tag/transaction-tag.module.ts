import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TransactionTagController } from './transaction-tag.controller';
import { TransactionTagService } from './transaction-tag.service';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [TransactionTagController],
  providers: [TransactionTagService, PrismaService],
  exports: [TransactionTagService],
})
export class TransactionTagModule {}
