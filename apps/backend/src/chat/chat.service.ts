import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { prisma } from "@repo/db";
import { CreateChatDto } from "./dto/create-chat.dto";
import { SendMessageDto } from "./dto/send-message.dto";

@Injectable()
export class ChatService {
  async createConversation(userId: string, dto: CreateChatDto) {
    const participantIds = [...new Set([userId, ...dto.participantIds])];

    if (participantIds.length < 2) {
      throw new BadRequestException(
        "A conversation must have at least 2 participants",
      );
    }

    const isGroup = dto.isGroup ?? participantIds.length > 2;

    if (!isGroup && participantIds.length === 2) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: {
                in: participantIds,
              },
            },
            some: {
              userId: participantIds[0],
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
        },
      });

      if (existingConversation) {
        const exactParticipantCount =
          existingConversation.participants.length === 2;

        if (exactParticipantCount) {
          return existingConversation;
        }
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        isGroup,
        name: dto.name,
        participants: {
          create: participantIds.map((participantId) => ({
            userId: participantId,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
    });

    return conversation;
  }

  async getMyConversations(userId: string) {
    const start = Date.now();

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return conversations;
  }

  async getMessages(
    userId: string,
    conversationId: string,
    lastMessageId?: string,
  ) {
    const start = Date.now();

    const membership = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new UnauthorizedException("You are not part of this conversation");
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePictureUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      cursor: lastMessageId ? { id: lastMessageId } : undefined,
      skip: lastMessageId ? 1 : 0,
    });

    return messages.reverse();
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ) {
    const content = dto.content.trim();

    if (!content) {
      throw new BadRequestException("Message content is required");
    }

    return prisma.$transaction(async (tx) => {
      const membership = await tx.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        select: { id: true },
      });

      if (!membership) {
        throw new UnauthorizedException(
          "You are not part of this conversation",
        );
      }

      if (dto.clientId) {
        const existingMessage = await tx.message.findFirst({
          where: {
            conversationId,
            senderId: userId,
            clientId: dto.clientId,
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePictureUrl: true,
              },
            },
          },
        });

        if (existingMessage) {
          return existingMessage;
        }
      }

      const message = await tx.message.create({
        data: {
          conversationId,
          senderId: userId,
          content,
          clientId: dto.clientId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePictureUrl: true,
            },
          },
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          updatedAt: message.createdAt,
        },
      });

      return message;
    });
  }
}
