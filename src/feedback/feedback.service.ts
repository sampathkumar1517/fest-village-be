import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto) {
    const feedback = this.feedbackRepository.create(createFeedbackDto);
    await this.feedbackRepository.save(feedback);
    return {
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    };
  }

  // For you (developer) to review all feedback
  findAll() {
    return this.feedbackRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}

