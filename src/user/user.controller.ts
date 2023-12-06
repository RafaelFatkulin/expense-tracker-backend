import {
  Controller,
  Body,
  Put,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserRequest } from './models';
import { User } from './user.decorator';
import { AuthUser } from 'src/auth/auth-user';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard())
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequest: UpdateUserRequest,
    @User() user: AuthUser,
  ): Promise<void> {
    if (id !== user.id) {
      throw new UnauthorizedException();
    }

    await this.userService.updateUser(id, updateRequest);
  }

  @ApiBearerAuth()
  @Get(':id/wallets')
  @HttpCode(HttpStatus.OK)
  async getWallets(
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthUser,
  ) {
    if (id !== user.id) {
      throw new UnauthorizedException();
    }

    return await this.userService.getUserWallets(id);
  }

  @ApiBearerAuth()
  @Get(':id/wallets/:walletId')
  @HttpCode(HttpStatus.OK)
  async getOneWallet(
    @Param('id', ParseIntPipe) id: number,
    @Param('walletId', ParseIntPipe) walletId: number,
    @User() user: AuthUser,
  ) {
    if (id !== user.id) {
      throw new UnauthorizedException();
    }

    return await this.userService.getOneUserWallet(id, walletId);
  }
}
