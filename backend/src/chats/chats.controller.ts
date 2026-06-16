import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { ChatsService } from './chats.service';

@Controller('chats')
@UseGuards(AuthGuard('jwt'))
export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  @Post('start/:userId')
  startDirectChat(@Param('userId') targetUserId: string, @Req() req: Request) {
    const user = req.user as { userId: string; email: string };

    return this.chatsService.startDirectChat(user.userId, targetUserId);
  }

  @Get()
  findMyChats(@Req() req: Request) {
    const user = req.user as { userId: string; email: string };

    return this.chatsService.findMyChats(user.userId);
  }

  @Get(':id/messages')
  getMessages(@Param('id') conversationId: string, @Req() req: Request) {
    const user = req.user as { userId: string; email: string };

    return this.chatsService.getMessages(conversationId, user.userId);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') conversationId: string,
    @Req() req: Request,
    @Body() body: { content: string },
  ) {
    const user = req.user as { userId: string; email: string };

    return this.chatsService.sendMessage(
      conversationId,
      user.userId,
      body.content,
    );
  }
}
