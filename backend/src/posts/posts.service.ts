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
        likes: true,
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
        likes: true,
      },
    });
  }

  like(postId: string, userId: string) {
    return this.prisma.like.create({
      data: {
        postId,
        userId,
      },
    });
  }

  unlike(postId: string, userId: string) {
    return this.prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  }

  addComment(postId: string, userId: string, content: string) {
    return this.prisma.comment.create({
      data: {
        postId,
        userId,
        content,
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

  getComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
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

    const posts = await this.prisma.post.findMany({
      where: {
        OR: [{ userId }, { userId: { in: followingIds } }],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        likes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts.map((post) => ({
      ...post,
      likesCount: post.likes.length,
      isLiked: post.likes.some((like) => like.userId === userId),
    }));
  }
}
