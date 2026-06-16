import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatsService: ChatsService) {}

  @SubscribeMessage('join_conversation')
  joinConversation(
    @MessageBody() body: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(body.conversationId);

    return {
      ok: true,
      conversationId: body.conversationId,
    };
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody()
    body: {
      conversationId: string;
      userId: string;
      content: string;
    },
  ) {
    const message = await this.chatsService.sendMessage(
      body.conversationId,
      body.userId,
      body.content,
    );

    this.server.to(body.conversationId).emit('receive_message', message);

    return message;
  }
}
