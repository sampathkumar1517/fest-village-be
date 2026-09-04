import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { StaffOnly } from '../auth/decorators/admin-only.decorator';
import { FestivalAccessService } from '../festival/festival-access.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly festivalAccess: FestivalAccessService,
  ) {}

  // Analytics page: collected, expenses, balance for one festival
  @Get('festival/:festivalId')
  @StaffOnly()
  async getFestivalSummary(
    @Param('festivalId') festivalId: string,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalId,
    );
    return this.analyticsService.getFestivalSummary(+festivalId);
  }

  // Compare two festivals
  @Get('compare')
  @StaffOnly()
  async compareFestivals(
    @Query('festivalA') festivalA: string,
    @Query('festivalB') festivalB: string,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalA,
    );
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalB,
    );
    return this.analyticsService.compareFestivals(
      +festivalA,
      +festivalB,
    );
  }

  // Per-family breakdown (family name, paid, balance, phone number)
  @Get('festival/:festivalId/families')
  @StaffOnly()
  async getFamilyCollectionView(
    @Param('festivalId') festivalId: string,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalId,
    );
    return this.analyticsService.getFamilyCollectionView(+festivalId);
  }

  // Detailed analytics with charts data
  @Get('festival/:festivalId/detailed')
  @StaffOnly()
  async getDetailedAnalytics(
    @Param('festivalId') festivalId: string,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalId,
    );
    return this.analyticsService.getDetailedAnalytics(+festivalId);
  }
}

