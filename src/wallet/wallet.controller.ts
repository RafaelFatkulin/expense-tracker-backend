import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Patch,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  CreateWalletRequest,
  UpdateWalletRequest,
  WalletResponse,
  WalletResponseWithBalance,
  WalletWithTransactionsResponse,
} from './models';
import { User } from 'src/user/user.decorator';
import { AuthUser } from 'src/auth/auth-user';
import { SuccessMessageResponse } from 'src/common/models';

@ApiTags('wallets')
@Controller('wallets')
@UseGuards(AuthGuard())
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Body() createRequest: CreateWalletRequest,
  ): Promise<SuccessMessageResponse> {
    return await this.walletService.createWallet(createRequest);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequest: UpdateWalletRequest,
    @User() user: AuthUser,
  ): Promise<SuccessMessageResponse> {
    return await this.walletService.updateWallet(id, user.id, updateRequest);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthUser,
  ): Promise<SuccessMessageResponse> {
    return await this.walletService.deleteWallet(id, user.id);
  }

  @ApiBearerAuth()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUserWallets(
    @User() user: AuthUser,
  ): Promise<WalletResponseWithBalance[]> {
    return await this.walletService.getUserWallets(user.id);
  }

  @ApiBearerAuth()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneUserWallet(
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthUser,
  ): Promise<WalletWithTransactionsResponse> {
    return await this.walletService.getOneUserWallet(user.id, id);
  }
}
