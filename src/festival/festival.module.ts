import { Module, forwardRef } from '@nestjs/common';
import { FestivalService } from './festival.service';
import { FestivalController } from './festival.controller';
import { FestivalAccessService } from './festival-access.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Festival } from './entities/festival.entity';
import { FestivalAdmin } from './entities/festival-admin.entity';
import { PaymentDetail } from '../payment-detail/entities/payment-detail.entity';
import { Expense } from '../expense/entities/expense.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Festival,
      FestivalAdmin,
      PaymentDetail,
      Expense,
      User,
    ]),
  ],
  controllers: [FestivalController],
  providers: [FestivalService, FestivalAccessService],
  exports: [FestivalService, FestivalAccessService],
})
export class FestivalModule {}
