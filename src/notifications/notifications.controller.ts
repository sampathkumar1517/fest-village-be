import { Controller, Get, Post, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('festival/:festivalId/user/:userId/summary')
  getSummary(@Param('festivalId') festivalId: string, @Param('userId') userId: string) {
    return this.notificationsService.generateFestivalSummary(+festivalId, +userId);
  }

  @Get('festival/:festivalId/summaries')
  getAllSummaries(@Param('festivalId') festivalId: string) {
    return this.notificationsService.generateAllSummaries(+festivalId);
  }

  @Post('festival/:festivalId/user/:userId/send')
  @AdminOnly()
  sendSummary(@Param('festivalId') festivalId: string, @Param('userId') userId: string) {
    return this.notificationsService.sendSummary(+festivalId, +userId);
  }
}
