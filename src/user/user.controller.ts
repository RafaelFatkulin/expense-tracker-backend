import {
  Controller,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserRequest } from './models';
import { User } from './user.decorator';
import { AuthUser } from 'src/auth/auth-user';
import { AuthGuard } from '@nestjs/passport';
import { SuccessMessageResponse } from 'src/common/models';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard())
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequest: UpdateUserRequest,
    @User() user: AuthUser,
  ): Promise<SuccessMessageResponse> {
    return await this.userService.updateUser(id, user.id, updateRequest);
  }
}
