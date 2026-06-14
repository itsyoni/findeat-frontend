import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private signToken(userId: string, email: string) {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }

  async signup(email: string, username: string, password: string) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existing) {
      throw new BadRequestException('Email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { email, username, password: hashedPassword },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    return {
      user,
      accessToken: this.signToken(user.id, user.email),
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    };

    return {
      user: safeUser,
      accessToken: this.signToken(user.id, user.email),
    };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });
  }
}
