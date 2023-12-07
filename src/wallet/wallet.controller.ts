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
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  CreateWalletRequest,
  UpdateWalletRequest,
  WalletResponse,
} from './models';
import { User } from 'src/user/user.decorator';
import { AuthUser } from 'src/auth/auth-user';

@Controller('wallets')
@UseGuards(AuthGuard())
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createRequest: CreateWalletRequest,
  ): Promise<WalletResponse> {
    return await this.walletService.createWallet(createRequest);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequest: UpdateWalletRequest,
    @User() user: AuthUser,
  ): Promise<WalletResponse> {
    return await this.walletService.updateWallet(id, user.id, updateRequest);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthUser,
  ): Promise<void> {
    return await this.walletService.deleteWallet(id, user.id);
  }

  @ApiBearerAuth()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUserWallets(@User() user: AuthUser): Promise<WalletResponse[]> {
    return await this.walletService.getUserWallets(user.id);
  }

  @ApiBearerAuth()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneUserWallet(
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthUser,
  ) {
    return await this.walletService.getOneUserWallet(user.id, id);
  }
}
