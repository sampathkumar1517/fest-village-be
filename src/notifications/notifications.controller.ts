import { Controller, Get, Post, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

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
  sendSummary(@Param('festivalId') festivalId: string, @Param('userId') userId: string) {
    return this.notificationsService.sendSummary(+festivalId, +userId);
  }
}
