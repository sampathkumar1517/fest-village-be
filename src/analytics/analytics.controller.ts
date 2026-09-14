import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /** Public read — anyone can view festival analytics */
  @Get('festival/:festivalId')
  getFestivalSummary(@Param('festivalId') festivalId: string) {
    return this.analyticsService.getFestivalSummary(+festivalId);
  }

  @Get('compare')
  compareFestivals(
    @Query('festivalA') festivalA: string,
    @Query('festivalB') festivalB: string,
  ) {
    return this.analyticsService.compareFestivals(+festivalA, +festivalB);
  }

  @Get('festival/:festivalId/families')
  getFamilyCollectionView(@Param('festivalId') festivalId: string) {
    return this.analyticsService.getFamilyCollectionView(+festivalId);
  }

  @Get('festival/:festivalId/detailed')
  getDetailedAnalytics(@Param('festivalId') festivalId: string) {
    return this.analyticsService.getDetailedAnalytics(+festivalId);
  }
}
