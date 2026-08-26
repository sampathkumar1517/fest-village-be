import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  @AdminOnly()
  create(@Body() createChatMessageDto: CreateChatMessageDto) {
    return this.chatService.create(createChatMessageDto);
  }

  @Get('festival/:festivalId/messages')
  findAllByFestival(
    @Param('festivalId') festivalId: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.findAllByFestival(
      +festivalId,
      limit ? +limit : 100,
    );
  }

  @Get('messages/:id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(+id);
  }

  @Delete('messages/:id')
  @AdminOnly()
  remove(@Param('id') id: string) {
    return this.chatService.remove(+id);
  }
}
