import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PaymentDetailService } from './payment-detail.service';
import { CreatePaymentDetailDto } from './dto/create-payment-detail.dto';
import { UpdatePaymentDetailDto } from './dto/update-payment-detail.dto';

@Controller('payment-detail')
export class PaymentDetailController {
  constructor(
    private readonly paymentDetailService: PaymentDetailService,
  ) {}

  @Post('add-payment')
  AddPayment(@Body() createPaymentDetailDto: CreatePaymentDetailDto) {
    return this.paymentDetailService.AddPayment(createPaymentDetailDto);
  }

  @Post('get-all-payments')
  findAll(@Body() body: { festivalId: number }) {
    return this.paymentDetailService.findAll(body.festivalId);
  } 

  @Post('get-payment-statistics')
  getStatistics(@Body() body: { festivalId: number }) {
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
  update(@Body() body: { id: number, updatePaymentDetailDto: UpdatePaymentDetailDto }) {
    return this.paymentDetailService.update(body.id, body.updatePaymentDetailDto);
  }

  @Delete('delete-payment')
  remove(@Body() body: { id: number }) {
    return this.paymentDetailService.remove(body.id);
  }
}
