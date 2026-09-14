import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { PaymentDetail } from '../payment-detail/entities/payment-detail.entity';
import { Expense } from '../expense/entities/expense.entity';
import { ExpenseCategory } from '../expense/entities/expense-category.entity';
import { Festival } from '../festival/entities/festival.entity';
import { Event } from '../events/entities/event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentDetail,
      Expense,
      ExpenseCategory,
      Festival,
      Event,
    ]),
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
