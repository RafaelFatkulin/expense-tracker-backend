import {
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Param,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ChangeEmailRequest,
  ChangePasswordRequest,
  CheckEmailResponse,
  CheckUsernameResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  SignupRequest,
} from './models';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/user.decorator';
import { AuthUser } from './auth-user';
import { UserResponse } from 'src/user/models';
import { SuccessMessageResponse } from 'src/common/models';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('check-username')
  @HttpCode(HttpStatus.OK)
  async checkUsernameAvailability(
    @Body() checkUsernameRequest: { username: string },
  ): Promise<CheckUsernameResponse> {
    const isAvailable = await this.authService.isUsernameAvailable(
      checkUsernameRequest.username,
    );

    if (isAvailable) {
      return new CheckUsernameResponse(isAvailable);
    }

    throw new InternalServerErrorException('Данный никнейм занят');
  }

  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  async checkEmailAvailability(
    @Body() checkEmailRequest: { email: string },
  ): Promise<CheckEmailResponse> {
    const isAvailable = await this.authService.isEmailAvailable(
      checkEmailRequest.email,
    );

    if (isAvailable) {
      return new CheckEmailResponse(isAvailable);
    }

    throw new InternalServerErrorException('Данная почта занята');
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() signupRequest: SignupRequest,
  ): Promise<SuccessMessageResponse> {
    try {
      return await this.authService.signup(signupRequest);
    } catch (err) {
      throw new InternalServerErrorException(
        'Произошла ошибка при регистрации',
      );
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginRequest: LoginRequest): Promise<LoginResponse> {
    return new LoginResponse(await this.authService.login(loginRequest));
  }

  @ApiBearerAuth()
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  async getUserWithToken(@User() user: AuthUser): Promise<UserResponse> {
    return UserResponse.fromUserEntity(user);
  }

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verifyMail(
    @Query('token') token: string,
  ): Promise<SuccessMessageResponse> {
    return await this.authService.verifyEmail(token);
  }

  @ApiBearerAuth()
  @Post('change-email')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  async sendChangeEmailMail(
    @User() user: AuthUser,
    @Body() changeEmailRequest: ChangeEmailRequest,
  ): Promise<SuccessMessageResponse> {
    return await this.authService.sendChangeEmailMail(
      changeEmailRequest,
      user.id,
      user.firstName,
      user.email,
    );
  }

  @Get('change-email')
  @HttpCode(HttpStatus.OK)
  async changeEmail(
    @Query('token') token: string,
  ): Promise<SuccessMessageResponse> {
    return await this.authService.changeEmail(token);
  }

  @Post('forgot-password/:email')
  @HttpCode(HttpStatus.OK)
  async sendResetPassword(
    @Param('email') email: string,
  ): Promise<SuccessMessageResponse> {
    return await this.authService.sendResetPasswordMail(email);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  async changePassword(
    @Body() changePasswordRequest: ChangePasswordRequest,
    @User() user: AuthUser,
  ): Promise<SuccessMessageResponse> {
    return await this.authService.changePassword(
      changePasswordRequest,
      user.id,
      user.firstName,
      user.email,
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordRequest: ResetPasswordRequest,
  ): Promise<SuccessMessageResponse> {
    return await this.authService.resetPassword(resetPasswordRequest);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  async resendVerificationMail(
    @User() user: AuthUser,
  ): Promise<SuccessMessageResponse> {
    return await this.authService.resendVerificationMail(
      user.firstName,
      user.email,
      user.id,
    );
  }
}
