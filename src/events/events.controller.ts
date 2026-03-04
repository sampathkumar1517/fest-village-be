import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get('festival/:festivalId')
  findAllByFestival(@Param('festivalId') festivalId: string) {
    return this.eventsService.findAllByFestival(+festivalId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }

  @Post(':id/register')
  registerParticipant(@Param('id') id: string) {
    return this.eventsService.registerParticipant(+id);
  }

  @Post(':id/unregister')
  unregisterParticipant(@Param('id') id: string) {
    return this.eventsService.unregisterParticipant(+id);
  }
}
