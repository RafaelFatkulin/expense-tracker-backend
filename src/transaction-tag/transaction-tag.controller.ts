import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionTagService } from './transaction-tag.service';
import {
  CreateTransactionTagRequest,
  TransactionTagResponse,
  UpdateTransactionTagRequest,
} from './models';
import { User } from '../user/user.decorator';
import { AuthUser } from '../auth/auth-user';
import { SuccessMessageResponse } from '../common/models';

@ApiTags('transaction-tags')
@Controller('transaction-tags')
@UseGuards(AuthGuard())
export class TransactionTagController {
  constructor(private readonly transactionTagService: TransactionTagService) {}

  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createRequest: CreateTransactionTagRequest,
    @User() user: AuthUser,
  ): Promise<SuccessMessageResponse> {
    return await this.transactionTagService.createTransactionTag(
      user.id,
      createRequest,
    );
  }

  @ApiBearerAuth()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequest: UpdateTransactionTagRequest,
    @User() user: AuthUser,
  ): Promise<SuccessMessageResponse> {
    return await this.transactionTagService.updateTransactionTag(
      user.id,
      id,
      updateRequest,
    );
  }

  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthUser,
  ): Promise<SuccessMessageResponse> {
    return await this.transactionTagService.deleteTransactionTag(id, user.id);
  }

  @ApiBearerAuth()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUserTransactionTags(
    @User() user: AuthUser,
  ): Promise<TransactionTagResponse[]> {
    return await this.transactionTagService.getTransactionTags(user.id);
  }

  @ApiBearerAuth()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneUserTransactionTag(
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthUser,
  ): Promise<TransactionTagResponse> {
    return await this.transactionTagService.getTransactionTag(id, user.id);
  }
}
