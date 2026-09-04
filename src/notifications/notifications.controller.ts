import { Controller, Get, Post, Param, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AdminOnly, StaffOnly } from '../auth/decorators/admin-only.decorator';
import { FestivalAccessService } from '../festival/festival-access.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly festivalAccess: FestivalAccessService,
  ) {}

  @Get('festival/:festivalId/user/:userId/summary')
  @StaffOnly()
  async getSummary(
    @Param('festivalId') festivalId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalId,
    );
    return this.notificationsService.generateFestivalSummary(
      +festivalId,
      +userId,
    );
  }

  @Get('festival/:festivalId/summaries')
  @StaffOnly()
  async getAllSummaries(
    @Param('festivalId') festivalId: string,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalId,
    );
    return this.notificationsService.generateAllSummaries(+festivalId);
  }

  @Post('festival/:festivalId/user/:userId/send')
  @AdminOnly()
  async sendSummary(
    @Param('festivalId') festivalId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalId,
    );
    return this.notificationsService.sendSummary(+festivalId, +userId);
  }
}
