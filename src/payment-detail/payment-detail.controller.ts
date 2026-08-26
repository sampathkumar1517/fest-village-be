import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { PaymentDetailService } from './payment-detail.service';
import { CreatePaymentDetailDto } from './dto/create-payment-detail.dto';
import { UpdatePaymentDetailDto } from './dto/update-payment-detail.dto';
import { StaffOnly } from '../auth/decorators/admin-only.decorator';
import { FestivalAccessService } from '../festival/festival-access.service';

@Controller('payment-detail')
export class PaymentDetailController {
  constructor(
    private readonly paymentDetailService: PaymentDetailService,
    private readonly festivalAccess: FestivalAccessService,
  ) {}

  @Post('add-payment')
  @StaffOnly()
  async AddPayment(
    @Body() createPaymentDetailDto: CreatePaymentDetailDto,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      createPaymentDetailDto.festivalId,
    );
    return this.paymentDetailService.AddPayment(createPaymentDetailDto);
  }

  @Post('get-all-payments')
  findAll(@Body() body: { festivalId: number }) {
    return this.paymentDetailService.findAll(body.festivalId);
  }

  @Get('festival/:festivalId/total')
  getTotalCollection(@Param('festivalId') festivalId: string) {
    return this.paymentDetailService.getTotalCollectionByFestival(+festivalId);
  }

  @Get('festival/:festivalId')
  findByFestivalIdGet(@Param('festivalId') festivalId: string) {
    return this.paymentDetailService.findByFestivalId(+festivalId);
  }

  @Post('get-payment-statistics')
  getStatistics(@Body() body: { festivalId?: number }) {
    return this.paymentDetailService.getPaymentStatistics(body.festivalId);
  }

  @Post('get-payments-by-user')
  findByUserId(@Body() body: { userId: number }) {
    return this.paymentDetailService.findByUserId(body.userId);
  }

  @Post('get-payments-by-festival')
  findByFestivalId(@Body() body: { festivalId: number }) {
    return this.paymentDetailService.findByFestivalId(body.festivalId);
  }

  @Post('get-payment-by-id')
  findOne(@Body() body: { id: number }) {
    return this.paymentDetailService.findOne(body.id);
  }

  @Patch('update-payment')
  @StaffOnly()
  async update(
    @Body()
    body: { id: number; updatePaymentDetailDto: UpdatePaymentDetailDto },
    @Req() req: any,
  ) {
    const existing = await this.paymentDetailService.findOne(body.id);
    const festivalId =
      body.updatePaymentDetailDto?.festivalId ?? existing?.festivalId;
    if (festivalId) {
      await this.festivalAccess.assertCanManageFestival(req.user, festivalId);
    }
    return this.paymentDetailService.update(
      body.id,
      body.updatePaymentDetailDto,
    );
  }

  @Delete('delete-payment')
  @StaffOnly()
  async remove(@Body() body: { id: number }, @Req() req: any) {
    const existing = await this.paymentDetailService.findOne(body.id);
    if (existing?.festivalId) {
      await this.festivalAccess.assertCanManageFestival(
        req.user,
        existing.festivalId,
      );
    }
    return this.paymentDetailService.remove(body.id);
  }
}
