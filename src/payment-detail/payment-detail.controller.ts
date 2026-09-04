import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
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
  @StaffOnly()
  async findAll(@Body() body: { festivalId: number }, @Req() req: any) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      body.festivalId,
    );
    return this.paymentDetailService.findAll(body.festivalId);
  }

  @Get('festival/:festivalId/total')
  @StaffOnly()
  async getTotalCollection(
    @Param('festivalId') festivalId: string,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalId,
    );
    return this.paymentDetailService.getTotalCollectionByFestival(+festivalId);
  }

  @Get('festival/:festivalId')
  @StaffOnly()
  async findByFestivalIdGet(
    @Param('festivalId') festivalId: string,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalId,
    );
    return this.paymentDetailService.findByFestivalId(+festivalId);
  }

  @Post('get-payment-statistics')
  @StaffOnly()
  async getStatistics(
    @Body() body: { festivalId?: number },
    @Req() req: any,
  ) {
    if (!body.festivalId) {
      throw new BadRequestException('festivalId is required');
    }
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      body.festivalId,
    );
    return this.paymentDetailService.getPaymentStatistics(body.festivalId);
  }

  @Post('get-payments-by-user')
  @StaffOnly()
  async findByUserId(@Body() body: { userId: number }, @Req() req: any) {
    const manageableFestivalIds =
      await this.festivalAccess.getManageableFestivalIds(req.user);
    const result = await this.paymentDetailService.findByUserId(body.userId);
    const filterIds = new Set(manageableFestivalIds.map(Number));
    return (result || []).filter((p) => filterIds.has(Number(p.festivalId)));
  }

  @Post('get-payments-by-festival')
  @StaffOnly()
  async findByFestivalId(
    @Body() body: { festivalId: number },
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      body.festivalId,
    );
    return this.paymentDetailService.findByFestivalId(body.festivalId);
  }

  @Post('get-payment-by-id')
  @StaffOnly()
  async findOne(@Body() body: { id: number }, @Req() req: any) {
    const payment = await this.paymentDetailService.findOne(body.id);
    if (payment?.festivalId != null) {
      await this.festivalAccess.assertCanManageFestival(
        req.user,
        payment.festivalId,
      );
    }
    return payment;
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
