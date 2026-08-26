import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/summary?festivalId=1
   * Returns total collection, total expenses, balance, families paid/pending.
   */
  @Get('summary')
  getSummary(@Query('festivalId', ParseIntPipe) festivalId: number) {
    return this.dashboardService.getSummary(festivalId);
  }

  /**
   * GET /dashboard/overview
   * Cross-festival overview (uses the currently active festival automatically).
   */
  @Get('overview')
  getOverview() {
    return this.dashboardService.getOverview();
  }
}
