import { Injectable } from '@nestjs/common';
import { prisma } from 'src/prisma/prisma.service';
import { compareSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InvalidEmailOrPassword } from 'src/errors/invalid-email-password-error';
import { UserNotFound } from 'src/errors/user-not-found-error';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async login(
    email,
    password,
  ): Promise<{
    fullname: string;
    token: string;
  }> {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        email,
      },
    });

    if (!user) throw new InvalidEmailOrPassword();

    const isMatch = await compareSync(password, user.password_hash);

    if (!isMatch) throw new InvalidEmailOrPassword();

    const payload = {
      sub: user.id,
      fullname: user.fullname,
    };

    const token = this.jwtService.sign(payload);

    return {
      fullname: user.fullname,
      token,
    };
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new UserNotFound();

    const newPassword = Math.random().toString(36).slice(-10);

    const saltOrRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltOrRounds);

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        password_hash,
      },
    });

    await this.mailerService.sendMail({
      to: email,
      from: 'trocafacil@lojasantoantonio.com.br',
      subject: 'Esqueceu sua senha?',
      template: 'forgotPassword',
      context: {
        user: user.fullname.split(' ')[0],
        password: newPassword,
      },
    });

    return {
      message: 'Nova senha encaminhada para seu e-mail!',
    };
  }
}
