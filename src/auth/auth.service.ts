import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailSenderService } from 'src/mail-sender/mail-sender.service';
import {
  ChangeEmailRequest,
  ChangePasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  SignupRequest,
} from './models';
import { nanoid } from 'nanoid';
import { Prisma } from '@prisma/client';
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
      const createdUser = await this.prisma.user.create({
        data: {
          username: signupRequest.username.toLowerCase(),
          email: signupRequest.email.toLowerCase(),
          passwordHash: await bcrypt.hash(signupRequest.password, 10),
          firstName: signupRequest.firstName,
          lastName: signupRequest.lastName,
          middleName: signupRequest.middleName || '',
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
          signupRequest.firstName,
          signupRequest.email,
          emailVerificationToken,
        );

        return { message: 'Регистрация успешна' };
      }
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException();
        } else throw e;
      } else throw e;
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

      return { message: 'Почта подтверждена' };
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
        firstName: true,
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
      user.firstName,
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

    this.mailSenderService.sendPasswordChangeInfoMail(name, email);

    return { message: 'Письмо для смены пароля отправлено на вашу почту' };
  }

  async validateUser(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (user !== null && user.email === payload.email) {
      return user;
    }
    throw new UnauthorizedException();
  }

  async login(loginRequest: LoginRequest): Promise<string> {
    try {
      const normalizedIdentifier = loginRequest.email.toLowerCase();
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            {
              username: normalizedIdentifier,
            },
            {
              email: normalizedIdentifier,
            },
          ],
        },
        select: {
          id: true,
          passwordHash: true,
          email: true,
          username: true,
        },
      });

      if (
        user === null ||
        !bcrypt.compareSync(loginRequest.password, user.passwordHash)
      ) {
        throw new UnauthorizedException('Введены неверные данные');
      }

      const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
      };

      return this.jwtService.signAsync(payload, {
        expiresIn: loginRequest.remember ? '60d' : '1d',
      });
    } catch (err) {
      Logger.log(err);

      if (err instanceof UnauthorizedException) {
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
