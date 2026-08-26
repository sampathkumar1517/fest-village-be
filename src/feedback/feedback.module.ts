import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { FestivalModule } from '../festival/festival.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback]), FestivalModule],
  providers: [FeedbackService],
  controllers: [FeedbackController],
})
export class FeedbackModule {}
