import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { StaffOnly } from '../auth/decorators/admin-only.decorator';
import { FestivalAccessService } from '../festival/festival-access.service';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly festivalAccess: FestivalAccessService,
  ) {}

  @Post()
  @StaffOnly()
  async create(@Body() createEventDto: CreateEventDto, @Req() req: any) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      createEventDto.festivalId,
    );
    return this.eventsService.create(createEventDto);
  }

  @Get('festival/:festivalId')
  @StaffOnly()
  async findAllByFestival(
    @Param('festivalId') festivalId: string,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalId,
    );
    return this.eventsService.findAllByFestival(+festivalId);
  }

  @Get(':id')
  @StaffOnly()
  async findOne(@Param('id') id: string, @Req() req: any) {
    const event = await this.eventsService.findOne(+id);
    if (event?.festivalId != null) {
      await this.festivalAccess.assertCanManageFestival(
        req.user,
        event.festivalId,
      );
    }
    return event;
  }

  @Patch(':id')
  @StaffOnly()
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: any,
  ) {
    const event = await this.eventsService.findOne(+id);
    const festivalId = event?.festivalId ?? updateEventDto.festivalId;
    if (festivalId) {
      await this.festivalAccess.assertCanManageFestival(req.user, festivalId);
    }
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  @StaffOnly()
  async remove(@Param('id') id: string, @Req() req: any) {
    const event = await this.eventsService.findOne(+id);
    if (event?.festivalId) {
      await this.festivalAccess.assertCanManageFestival(
        req.user,
        event.festivalId,
      );
    }
    return this.eventsService.remove(+id);
  }

  @Post(':id/register')
  @StaffOnly()
  async registerParticipant(@Param('id') id: string, @Req() req: any) {
    const event = await this.eventsService.findOne(+id);
    if (event?.festivalId != null) {
      await this.festivalAccess.assertCanManageFestival(
        req.user,
        event.festivalId,
      );
    }
    return this.eventsService.registerParticipant(+id);
  }

  @Post(':id/unregister')
  @StaffOnly()
  async unregisterParticipant(@Param('id') id: string, @Req() req: any) {
    const event = await this.eventsService.findOne(+id);
    if (event?.festivalId != null) {
      await this.festivalAccess.assertCanManageFestival(
        req.user,
        event.festivalId,
      );
    }
    return this.eventsService.unregisterParticipant(+id);
  }
}
