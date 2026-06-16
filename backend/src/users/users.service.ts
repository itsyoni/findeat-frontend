import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  search(query: string, currentUserId: string) {
    return this.prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },
        username: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
      take: 20,
    });
  }

  async follow(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    return this.prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });
  }

  unfollow(currentUserId: string, targetUserId: string) {
    return this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });
  }

  followers(userId: string) {
    return this.prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  following(userId: string) {
    return this.prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }
}
