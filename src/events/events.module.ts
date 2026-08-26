import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { Festival } from '../festival/entities/festival.entity';
import { FestivalModule } from '../festival/festival.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Festival]), FestivalModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
