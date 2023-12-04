import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateWalletRequest } from './models';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard())
  async create(@Body() createRequest: CreateWalletRequest): Promise<void> {
    await this.walletService.createWallet(createRequest);
  }
}
