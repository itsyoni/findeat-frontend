import { Injectable } from "@nestjs/common";
import { prisma } from "@repo/db";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });
  }

  async searchUsers(currentUserId: string, query: string) {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    return prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },
        OR: [
          {
            username: {
              contains: trimmedQuery,
              mode: "insensitive",
            },
          },
          {
            displayName: {
              contains: trimmedQuery,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: trimmedQuery,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        profilePictureUrl: true,
      },
      take: 20,
    });
  }

  async updateUser(userId: string, data: UpdateUserDto) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data,
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        profilePictureUrl: true,
        gender: true,
        pronouns: true,
      },
    });
  }
}
