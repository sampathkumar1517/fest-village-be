import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { AdminOnly, StaffOnly } from '../auth/decorators/admin-only.decorator';
import { FestivalAccessService } from '../festival/festival-access.service';
import { Req } from '@nestjs/common';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly festivalAccess: FestivalAccessService,
  ) {}

  @Post('messages')
  @AdminOnly()
  create(@Body() createChatMessageDto: CreateChatMessageDto) {
    return this.chatService.create(createChatMessageDto);
  }

  @Get('festival/:festivalId/messages')
  @StaffOnly()
  async findAllByFestival(
    @Param('festivalId') festivalId: string,
    @Query('limit') limit: string,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalId,
    );

    return this.chatService.findAllByFestival(
      +festivalId,
      limit ? +limit : 100,
    );
  }

  @Get('messages/:id')
  @StaffOnly()
  async findOne(@Param('id') id: string, @Req() req: any) {
    const message = await this.chatService.findOne(+id);
    if (message?.festivalId != null) {
      await this.festivalAccess.assertCanManageFestival(
        req.user,
        message.festivalId,
      );
    }
    return message;
  }

  @Delete('messages/:id')
  @AdminOnly()
  async remove(@Param('id') id: string, @Req() req: any) {
    const message = await this.chatService.findOne(+id);
    if (message?.festivalId != null) {
      await this.festivalAccess.assertCanManageFestival(
        req.user,
        message.festivalId,
      );
    }
    return this.chatService.remove(+id);
  }
}
