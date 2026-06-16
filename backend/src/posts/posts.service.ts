import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        title: dto.title,
        description: dto.description,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  findByUser(userId: string) {
    return this.prisma.post.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async getFeed(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = follows.map((f) => f.followingId);

    return this.prisma.post.findMany({
      where: {
        OR: [
          {
            userId,
          },
          {
            userId: {
              in: followingIds,
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
