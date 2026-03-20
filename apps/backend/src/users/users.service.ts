import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class UsersService {
  findAll() {
    return prisma.user.findMany();
  }

  findOne() {
    return prisma.user.findFirst();
  }
}
