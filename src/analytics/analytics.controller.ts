import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Analytics page: collected, expenses, balance for one festival
  @Get('festival/:festivalId')
  getFestivalSummary(@Param('festivalId') festivalId: string) {
    return this.analyticsService.getFestivalSummary(+festivalId);
  }

  // Compare two festivals
  @Get('compare')
  compareFestivals(
    @Query('festivalA') festivalA: string,
    @Query('festivalB') festivalB: string,
  ) {
    return this.analyticsService.compareFestivals(+festivalA, +festivalB);
  }

  // Per-family breakdown (family name, paid, balance, phone number)
  @Get('festival/:festivalId/families')
  getFamilyCollectionView(@Param('festivalId') festivalId: string) {
    return this.analyticsService.getFamilyCollectionView(+festivalId);
  }

  // Detailed analytics with charts data
  @Get('festival/:festivalId/detailed')
  getDetailedAnalytics(@Param('festivalId') festivalId: string) {
    return this.analyticsService.getDetailedAnalytics(+festivalId);
  }
}

