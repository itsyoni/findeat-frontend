import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class UsersService {
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });
  }
}
