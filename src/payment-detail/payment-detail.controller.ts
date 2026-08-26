import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PaymentDetailService } from './payment-detail.service';
import { CreatePaymentDetailDto } from './dto/create-payment-detail.dto';
import { UpdatePaymentDetailDto } from './dto/update-payment-detail.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment-detail')
export class PaymentDetailController {
  constructor(
    private readonly paymentDetailService: PaymentDetailService,
  ) {}

  /** POST /payment-detail/add-payment */
  @Post('add-payment')
  AddPayment(@Body() createPaymentDetailDto: CreatePaymentDetailDto) {
    return this.paymentDetailService.AddPayment(createPaymentDetailDto);
  }

  /** POST /payment-detail/get-all-payments */
  @Post('get-all-payments')
  @UseGuards(JwtAuthGuard)
  findAll(@Body() body: { festivalId: number }) {
    return this.paymentDetailService.findAll(body.festivalId);
  }

  /**
   * GET /payment-detail/festival/:festivalId/total
   * Total collection summary for a festival (maps to GET /collection/total).
   */
  @Get('festival/:festivalId/total')
  @UseGuards(JwtAuthGuard)
  getTotalCollection(@Param('festivalId') festivalId: string) {
    return this.paymentDetailService.getTotalCollectionByFestival(+festivalId);
  }

  /** GET /payment-detail/festival/:festivalId */
  @Get('festival/:festivalId')
  @UseGuards(JwtAuthGuard)
  findByFestivalIdGet(@Param('festivalId') festivalId: string) {
    return this.paymentDetailService.findByFestivalId(+festivalId);
  }

  /** POST /payment-detail/get-payment-statistics */
  @Post('get-payment-statistics')
  @UseGuards(JwtAuthGuard)
  getStatistics(@Body() body: { festivalId?: number }) {
    return this.paymentDetailService.getPaymentStatistics(body.festivalId);
  }

  /** POST /payment-detail/get-payments-by-user */
  @Post('get-payments-by-user')
  @UseGuards(JwtAuthGuard)
  findByUserId(@Body() body: { userId: number }) {
    return this.paymentDetailService.findByUserId(body.userId);
  }

  /** POST /payment-detail/get-payments-by-festival */
  @Post('get-payments-by-festival')
  @UseGuards(JwtAuthGuard)
  findByFestivalId(@Body() body: { festivalId: number }) {
    return this.paymentDetailService.findByFestivalId(body.festivalId);
  }

  /** POST /payment-detail/get-payment-by-id */
  @Post('get-payment-by-id')
  @UseGuards(JwtAuthGuard)
  findOne(@Body() body: { id: number }) {
    return this.paymentDetailService.findOne(body.id);
  }

  /** PATCH /payment-detail/update-payment */
  @Patch('update-payment')
  @UseGuards(JwtAuthGuard)
  update(
    @Body()
    body: { id: number; updatePaymentDetailDto: UpdatePaymentDetailDto },
  ) {
    return this.paymentDetailService.update(
      body.id,
      body.updatePaymentDetailDto,
    );
  }

  /** DELETE /payment-detail/delete-payment */
  @Delete('delete-payment')
  @UseGuards(JwtAuthGuard)
  remove(@Body() body: { id: number }) {
    return this.paymentDetailService.remove(body.id);
  }
}
