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

  @Post()
  @StaffOnly()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFeedbackDto: CreateFeedbackDto, @Req() req: any) {
    if (createFeedbackDto.festivalId) {
      await this.festivalAccess.assertCanManageFestival(
        req.user,
        createFeedbackDto.festivalId,
      );
    } else if (!this.festivalAccess.isOrganizer(req.user)) {
      throw new ForbiddenException(
        'Festival admins must submit feedback for their assigned festival',
      );
    }
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
