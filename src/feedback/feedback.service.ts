import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

function mapFeedback(fb: Feedback) {
  return {
    id: fb.id,
    festivalId: fb.festivalId,
    rating: Number(fb.rating),
    comment: fb.comment || fb.comments || '',
    comments: fb.comments || fb.comment || '',
    fromName: fb.fromName,
    createdAt: fb.createdAt,
  };
}

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto) {
    const commentText =
      createFeedbackDto.comment?.trim() ||
      createFeedbackDto.comments?.trim() ||
      '';
    const feedback = this.feedbackRepository.create({
      festivalId: createFeedbackDto.festivalId ?? null,
      fromName: createFeedbackDto.fromName ?? 'Anonymous',
      fromPhone: createFeedbackDto.fromPhone ?? null,
      fromRole: createFeedbackDto.fromRole ?? null,
      rating: createFeedbackDto.rating,
      comment: commentText,
      comments: commentText,
    });
    await this.feedbackRepository.save(feedback);
    return {
      success: true,
      message: 'Feedback submitted successfully',
      data: mapFeedback(feedback),
    };
  }

  async findAll() {
    const list = await this.feedbackRepository.find({
      order: { createdAt: 'DESC' },
    });
    return {
      success: true,
      message: 'Feedback fetched successfully',
      data: list.map(mapFeedback),
    };
  }

  async findEntity(id: number) {
    const feedback = await this.feedbackRepository.findOne({ where: { id } });
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return feedback;
  }

  async remove(id: number) {
    await this.findEntity(id);
    await this.feedbackRepository.delete(id);
    return {
      success: true,
      message: 'Feedback deleted successfully',
    };
  }
}
