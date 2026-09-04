import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FestivalAccessService } from '../festival/festival-access.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly festivalAccess: FestivalAccessService,
  ) {}

  /**
   * GET /dashboard/summary?festivalId=1
   * Returns total collection, total expenses, balance, families paid/pending.
   */
  @Get('summary')
  async getSummary(
    @Query('festivalId', ParseIntPipe) festivalId: number,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      festivalId,
    );
    return this.dashboardService.getSummary(festivalId);
  }

  /**
   * GET /dashboard/overview
   * Cross-festival overview (uses the currently active festival automatically).
   */
  @Get('overview')
  async getOverview(@Req() req: any) {
    const festivalIds =
      await this.festivalAccess.getManageableFestivalIds(req.user);
    return this.dashboardService.getOverviewForFestivalIds(festivalIds);
  }
}
