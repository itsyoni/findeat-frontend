import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateChatDto } from "./dto/create-chat.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
  };
};

@Controller("chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("conversations")
  createConversation(
    @Req() req: AuthenticatedRequest,
    @Body() createChatDto: CreateChatDto,
  ) {
    return this.chatService.createConversation(req.user.id, createChatDto);
  }

  @Get("conversations")
  getMyConversations(@Req() req: AuthenticatedRequest) {
    return this.chatService.getMyConversations(req.user.id);
  }

  @Get("conversations/:id/messages")
  getMessages(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Query("cursor") cursor?: string,
  ) {
    return this.chatService.getMessages(req.user.id, id, cursor);
  }

  @Post("conversations/:id/messages")
  sendMessage(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(req.user.id, id, sendMessageDto);
  }
}
