import { Module } from '@nestjs/common';
import { PaymentDetailService } from './payment-detail.service';
import { PaymentDetailController } from './payment-detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentDetail } from './entities/payment-detail.entity';
import { User } from '../users/entities/user.entity';
import { Festival } from '../festival/entities/festival.entity';
import { FestivalModule } from '../festival/festival.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentDetail, User, Festival]),
    FestivalModule,
  ],
  controllers: [PaymentDetailController],
  providers: [PaymentDetailService],
  exports: [PaymentDetailService],
})
export class PaymentDetailModule {}
