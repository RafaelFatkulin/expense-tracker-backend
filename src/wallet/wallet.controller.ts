import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateWalletRequest, UpdateWalletRequest } from './models';
import { User } from 'src/user/user.decorator';
import { AuthUser } from 'src/auth/auth-user';

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

  @ApiBearerAuth()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequest: UpdateWalletRequest,
    @User() user: AuthUser,
  ): Promise<void> {
    await this.walletService.updateWallet(id, user.id, updateRequest);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthUser,
  ): Promise<void> {
    await this.walletService.deleteWallet(id, user.id);
  }
}
