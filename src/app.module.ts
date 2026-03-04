import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FestivalModule } from './festival/festival.module';
import { UsersModule } from './users/users.module';
import { PaymentDetailModule } from './payment-detail/payment-detail.module';
import { Festival } from './festival/entities/festival.entity';
import { User } from './users/entities/user.entity';
import { PaymentDetail } from './payment-detail/entities/payment-detail.entity';
import { Expense } from './expense/entities/expense.entity';
import { ExpenseCategory } from './expense/entities/expense-category.entity';
import { ExpenseModule } from './expense/expense.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ChatModule } from './chat/chat.module';
import { ChatMessage } from './chat/entities/chat-message.entity';
import { EventsModule } from './events/events.module';
import { Event } from './events/entities/event.entity';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'sampath',
      database: 'postgres',
      entities: [
        Festival,
        User,
        PaymentDetail,
        Expense,
        ExpenseCategory,
        ChatMessage,
        Event,
      ],
      synchronize: true,
    }),
    FestivalModule,
    UsersModule,
    PaymentDetailModule,
    ExpenseModule,
    AnalyticsModule,
    FeedbackModule,
    ChatModule,
    EventsModule,
    AuthModule,
    NotificationsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

