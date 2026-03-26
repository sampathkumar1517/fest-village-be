import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Festival } from '../festival/entities/festival.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Festival)
    private festivalRepository: Repository<Festival>,
  ) {}

  async create(createEventDto: CreateEventDto) {
    // Validate festival exists
    const festival = await this.festivalRepository.findOne({
      where: { id: createEventDto.festivalId },
    });

    if (!festival) {
      throw new NotFoundException(
        `Festival with ID ${createEventDto.festivalId} not found`,
      );
    }

    const event = this.eventRepository.create({
      festivalId: createEventDto.festivalId,
      name: createEventDto.name,
      description: createEventDto.description,
      startDate: new Date(createEventDto.startDate),
      endDate: new Date(createEventDto.endDate),
      location: createEventDto.location,
      status: createEventDto.status || EventStatus.PLANNED,
      capacity: createEventDto.capacity || 0,
      registeredCount: 0,
    });

    return await this.eventRepository.save(event);
  }

  async findAllByFestival(festivalId: number) {
    return this.eventRepository.find({
      where: { festivalId },
      relations: ['festival'],
      order: { startDate: 'ASC' },
    });
  }

  async findOne(id: number) {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['festival'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    await this.findOne(id);

    const updateData: any = { ...updateEventDto };
    if (updateEventDto.startDate) {
      updateData.startDate = new Date(updateEventDto.startDate);
    }
    if (updateEventDto.endDate) {
      updateData.endDate = new Date(updateEventDto.endDate);
    }

    await this.eventRepository.update(id, updateData);

    return {
      success: true,
      message: 'Event updated successfully',
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.eventRepository.softDelete(id);
    return {
      success: true,
      message: 'Event deleted successfully',
    };
  }

  async registerParticipant(eventId: number) {
    const event = await this.findOne(eventId);

    if (event.capacity > 0 && event.registeredCount >= event.capacity) {
      throw new BadRequestException('Event is at full capacity');
    }

    event.registeredCount += 1;
    await this.eventRepository.save(event);

    return {
      success: true,
      message: 'Participant registered successfully',
      registeredCount: event.registeredCount,
    };
  }

  async unregisterParticipant(eventId: number) {
    const event = await this.findOne(eventId);

    if (event.registeredCount > 0) {
      event.registeredCount -= 1;
      await this.eventRepository.save(event);
    }

    return {
      success: true,
      message: 'Participant unregistered successfully',
      registeredCount: event.registeredCount,
    };
  }
}
