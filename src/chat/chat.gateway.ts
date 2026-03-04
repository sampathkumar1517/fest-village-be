import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinFestival')
  handleJoinFestival(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { festivalId: number },
  ) {
    const room = `festival-${data.festivalId}`;
    client.join(room);
    console.log(`Client ${client.id} joined room: ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('leaveFestival')
  handleLeaveFestival(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { festivalId: number },
  ) {
    const room = `festival-${data.festivalId}`;
    client.leave(room);
    console.log(`Client ${client.id} left room: ${room}`);
    return { success: true };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createChatMessageDto: CreateChatMessageDto,
  ) {
    try {
      const message = await this.chatService.create(createChatMessageDto);
      const room = `festival-${createChatMessageDto.festivalId}`;

      // Broadcast to all clients in the festival room
      this.server.to(room).emit('newMessage', message);

      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @MessageBody() data: { festivalId: number; limit?: number },
  ) {
    try {
      const messages = await this.chatService.findAllByFestival(
        data.festivalId,
        data.limit || 100,
      );
      return { success: true, messages };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
