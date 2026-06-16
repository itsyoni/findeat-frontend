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

  async findOne(userId: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        posts: {
          orderBy: { createdAt: 'desc' },
        },
        followers: true,
        following: true,
      },
    });

    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    return {
      ...user,
      followersCount: user?.followers.length ?? 0,
      followingCount: user?.following.length ?? 0,
      isFollowing: !!follow,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        posts: {
          orderBy: { createdAt: 'desc' },
        },
        followers: true,
        following: true,
      },
    });

    return {
      ...user,
      followersCount: user?.followers.length ?? 0,
      followingCount: user?.following.length ?? 0,
    };
  }

  updateMe(
    userId: string,
    data: {
      username?: string;
      bio?: string;
      avatarUrl?: string;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }
}
