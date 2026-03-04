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

  @Post()
  create(@Body() createPaymentDetailDto: CreatePaymentDetailDto) {
    return this.paymentDetailService.create(createPaymentDetailDto);
  }

  @Get()
  findAll(@Query('festivalId') festivalId?: string) {
    if (festivalId) {
      return this.paymentDetailService.findByFestivalId(+festivalId);
    }
    return this.paymentDetailService.findAll();
  }

  @Get('statistics')
  getStatistics(@Query('festivalId') festivalId?: string) {
    return this.paymentDetailService.getPaymentStatistics(
      festivalId ? +festivalId : undefined,
    );
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.paymentDetailService.findByUserId(+userId);
  }

  @Get('festival/:festivalId')
  findByFestivalId(@Param('festivalId') festivalId: string) {
    return this.paymentDetailService.findByFestivalId(+festivalId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentDetailService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentDetailDto: UpdatePaymentDetailDto,
  ) {
    return this.paymentDetailService.update(+id, updatePaymentDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentDetailService.remove(+id);
  }
}
