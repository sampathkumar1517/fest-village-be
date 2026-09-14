import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatMessage } from './entities/chat-message.entity';
import { Festival } from '../festival/entities/festival.entity';
import { User } from '../users/entities/user.entity';
import { FestivalModule } from '../festival/festival.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, Festival, User]),
    FestivalModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
