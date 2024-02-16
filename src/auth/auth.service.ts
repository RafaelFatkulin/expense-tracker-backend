import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException, UnprocessableEntityException
} from "@nestjs/common";
import { PrismaService } from 'src/common/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailSenderService } from 'src/mail-sender/mail-sender.service';
import {
  ChangeEmailRequest,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  SignupRequest,
} from './models';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt.payload';
import { AuthUser } from './auth-user';
import { SuccessMessageResponse } from 'src/common/models';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailSenderService: MailSenderService,
  ) {}

  async signup(signupRequest: SignupRequest): Promise<SuccessMessageResponse> {
    const emailVerificationToken = nanoid();

    try {
      const isEmailAvailable = await this.isEmailAvailable(signupRequest.email);
      const isUsernameAvailable = await this.isUsernameAvailable(
        signupRequest.username,
      );

      if (!isEmailAvailable) {
        throw new InternalServerErrorException(
          'Данный адрес электронной почты занят',
        );
      }

      if (!isUsernameAvailable) {
        throw new InternalServerErrorException('Данный никнейм занят');
      }

      const createdUser = await this.prisma.user.create({
        data: {
          username: signupRequest.username.toLowerCase(),
          email: signupRequest.email.toLowerCase(),
          passwordHash: await bcrypt.hash(signupRequest.password, 10),
          emailVerification: {
            create: {
              token: emailVerificationToken,
            },
          },
        },
        select: null,
      });

      if (createdUser) {
        await this.mailSenderService.sendVerifyEmailMail(
          signupRequest.username,
          signupRequest.email,
          emailVerificationToken,
        );

        return {
          message: `Вы успешно зарегистрировались, для входа в аккаунт вам нужно подтвердить свой почтовый адрес "${signupRequest.email}"`,
        };
      }
    } catch (err) {
      Logger.error(JSON.stringify(err));

      throw new InternalServerErrorException(err.message);
    }
  }

  async resendVerificationMail(
    name: string,
    email: string,
    userId: number,
  ): Promise<SuccessMessageResponse> {
    const deletePrevEmailVerificationIfExist =
      this.prisma.emailVerification.deleteMany({ where: { userId } });

    const token = nanoid();

    const createEmailVerification = this.prisma.emailVerification.create({
      data: {
        userId,
        token,
      },
      select: null,
    });

    await this.prisma.$transaction([
      deletePrevEmailVerificationIfExist,
      createEmailVerification,
    ]);

    await this.mailSenderService.sendVerifyEmailMail(name, email, token);

    return { message: 'Письмо отправлено на вашу почту' };
  }

  async verifyEmail(token: string): Promise<SuccessMessageResponse> {
    const emailVerification = await this.prisma.emailVerification.findUnique({
      where: { token },
    });

    if (
      emailVerification !== null &&
      emailVerification.validUntil > new Date()
    ) {
      await this.prisma.user.update({
        where: { id: emailVerification.userId },
        data: {
          emailVerified: true,
        },
        select: null,
      });

      return {
        message: 'Ваша почта подтверждена, теперь вы можете войти в аккаунт',
      };
    } else {
      Logger.log(`Verify email called with invalid email token ${token}`);
      throw new NotFoundException();
    }
  }

  async sendChangeEmailMail(
    changeEmailRequest: ChangeEmailRequest,
    userId: number,
    name: string,
    oldEmail: string,
  ): Promise<SuccessMessageResponse> {
    const emailAvailable = await this.isEmailAvailable(
      changeEmailRequest.newEmail,
    );

    if (!emailAvailable) {
      Logger.log(
        `User with id ${userId} tried to change its email to already used ${changeEmailRequest.newEmail}`,
      );
      throw new ConflictException();
    }

    const deletePrevEmailChangeExist = this.prisma.emailChange.deleteMany({
      where: { userId },
    });

    const token = nanoid();

    const createEmailChange = this.prisma.emailChange.create({
      data: {
        userId,
        token,
        newEmail: changeEmailRequest.newEmail,
      },
      select: null,
    });

    await this.prisma.$transaction([
      deletePrevEmailChangeExist,
      createEmailChange,
    ]);

    await this.mailSenderService.sendChangeEmailMail(name, oldEmail, token);

    return { message: 'Письмо отправлено на вашу почту' };
  }

  async changeEmail(token: string): Promise<SuccessMessageResponse> {
    const emailChange = await this.prisma.emailChange.findUnique({
      where: { token },
    });

    if (emailChange !== null && emailChange.validUntil > new Date()) {
      await this.prisma.user.update({
        where: { id: emailChange.userId },
        data: {
          email: emailChange.newEmail.toLowerCase(),
        },
        select: null,
      });

      return { message: 'Почта изменилась успешно' };
    } else {
      Logger.log(`Invalid email change token ${token} is rejected.`);
      throw new NotFoundException();
    }
  }

  async sendResetPasswordMail(email: string): Promise<SuccessMessageResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (user === null) {
      throw new NotFoundException();
    }

    const deletePrevPasswordResetIfExist = this.prisma.passwordReset.deleteMany(
      {
        where: { userId: user.id },
      },
    );

    const token = nanoid();

    const createPasswordReset = this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
      },
      select: null,
    });

    await this.prisma.$transaction([
      deletePrevPasswordResetIfExist,
      createPasswordReset,
    ]);

    await this.mailSenderService.sendResetPasswordMail(
      user.username,
      user.email,
      token,
    );

    return { message: 'Письмо для сброса пароля отправлено на вашу почту' };
  }

  async resetPassword(
    resetPasswordRequest: ResetPasswordRequest,
  ): Promise<SuccessMessageResponse> {
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token: resetPasswordRequest.token },
    });

    if (passwordReset !== null && passwordReset.validUntil > new Date()) {
      await this.prisma.user.update({
        where: { id: passwordReset.userId },
        data: {
          passwordHash: await bcrypt.hash(resetPasswordRequest.newPassword, 10),
        },
        select: null,
      });

      return { message: 'Письмо изменен успешно' };
    } else {
      Logger.log(
        `Invalid reset password token ${resetPasswordRequest.token} is rejected`,
      );
      throw new NotFoundException();
    }
  }

  async changePassword(
    changePasswordRequest: ChangePasswordRequest,
    userId: number,
    name: string,
    email: string,
  ): Promise<SuccessMessageResponse> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        passwordHash: await bcrypt.hash(changePasswordRequest.newPassword, 10),
      },
      select: null,
    });

    await this.mailSenderService.sendPasswordChangeInfoMail(name, email);

    return { message: 'Письмо для смены пароля отправлено на вашу почту' };
  }

  async validateUser(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (user !== null && user.username === payload.username) {
      return user;
    }
    throw new UnauthorizedException();
  }

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    try {
      const email = loginRequest.email.toLowerCase();
      const user = await this.prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      if (
        user === null ||
        !bcrypt.compareSync(loginRequest.password, user.passwordHash)
      ) {
        throw new UnprocessableEntityException('Введены неверные данные');
      }

      if (!user.emailVerified) {
        throw new ForbiddenException(
          'Подтвердите почту в отправленном вам письме',
        );
      }

      const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
      };

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: loginRequest.remember ? '7d' : '1h',
      });

      return { token };
    } catch (err) {
      Logger.log(err);

      if (
        err instanceof UnauthorizedException ||
        err instanceof ForbiddenException ||
        err instanceof UnprocessableEntityException
      ) {
        console.log(err);
        throw err;
      }

      throw new NotFoundException('Введены неверные данные');
    }
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { username: true },
    });
    return user === null;
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { email: true },
    });
    return user === null;
  }
}
