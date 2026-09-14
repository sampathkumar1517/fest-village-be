import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { StaffOnly } from '../auth/decorators/admin-only.decorator';
import { FestivalAccessService } from '../festival/festival-access.service';

@Controller('feedback')
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly festivalAccess: FestivalAccessService,
  ) {}

  /** Public — anyone can share feedback */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(createFeedbackDto);
  }

  @Get()
  findAll() {
    return this.feedbackService.findAll();
  }

  @Delete(':id')
  @StaffOnly()
  async remove(@Param('id') id: string, @Req() req: any) {
    const fb = await this.feedbackService.findEntity(+id);
    if (fb.festivalId) {
      await this.festivalAccess.assertCanManageFestival(
        req.user,
        fb.festivalId,
      );
    } else if (!this.festivalAccess.isOrganizer(req.user)) {
      throw new ForbiddenException('Only organizers can delete global feedback');
    }
    return this.feedbackService.remove(+id);
  }
}
