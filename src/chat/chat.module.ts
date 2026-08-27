import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
// Disabled for SnapDeploy free tier (WebSockets require Always-On). Uncomment to restore:
// import { ChatGateway } from './chat.gateway';
import { ChatMessage } from './entities/chat-message.entity';
import { Festival } from '../festival/entities/festival.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, Festival, User])],
  controllers: [ChatController],
  // ChatGateway disabled for free deploy — uncomment when Always-On / paid WS is available:
  // providers: [ChatService, ChatGateway],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
