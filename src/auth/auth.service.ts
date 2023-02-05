import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthenticationDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register({ email, password }: AuthenticationDto) {
    const existingAccount = await this.findAccountByEmail(email);
    if (existingAccount) return { message: 'this email already exists' };
    const hashedPassword = await this.hashPassword(password);
    await this.prisma.account.create({
      data: { email, password: hashedPassword },
    });
    return { message: 'register complete' };
  }

  async login({ email, password }: AuthenticationDto) {
    const account = await this.findAccountByEmail(email);
    if (!account) return { message: 'email or password invalid' };
    const isVerifiedPassword = await this.verifyPassword(
      password,
      account.password,
    );
    if (!isVerifiedPassword) return { message: 'email or password invalid' };
    return { token: randomUUID() };
  }

  async findAccountByEmail(email: string) {
    return await this.prisma.account.findFirst({
      where: { email },
    });
  }

  async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async hashPassword(newPassword: string) {
    return await bcrypt.hash(newPassword, 10);
  }
}
