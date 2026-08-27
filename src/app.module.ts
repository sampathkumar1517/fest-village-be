import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { Feedback } from './feedback/entities/feedback.entity';
import { ChatModule } from './chat/chat.module';
import { ChatMessage } from './chat/entities/chat-message.entity';
import { EventsModule } from './events/events.module';
import { Event } from './events/entities/event.entity';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CollectionsModule } from './collections/collections.module';
import { FestivalAdmin } from './festival/entities/festival-admin.entity';
import { Organizer } from './organizers/entities/organizer.entity';
import { OrganizersModule } from './organizers/organizers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const sslEnabled =
          config.get<string>('DB_SSL', 'false') === 'true' ||
          Boolean(databaseUrl?.includes('supabase'));

        const common = {
          type: 'postgres' as const,
          entities: [
            Organizer,
            Festival,
            FestivalAdmin,
            User,
            PaymentDetail,
            Expense,
            ExpenseCategory,
            Feedback,
            ChatMessage,
            Event,
          ],
          // Creates/updates tables automatically from entities on startup
          synchronize: config.get<string>('DB_SYNC', 'false') === 'true',
          ssl: sslEnabled ? { rejectUnauthorized: false } : false,
        };

        if (databaseUrl) {
          return { ...common, url: databaseUrl };
        }

        return {
          ...common,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: parseInt(config.get<string>('DB_PORT', '5433'), 10),
          username: config.get<string>('DB_USER', 'postgres'),
          password: config.get<string>('DB_PASSWORD', 'postgres'),
          database: config.get<string>('DB_NAME', 'postgres'),
        };
      },
    }),
    FestivalModule,
    UsersModule,
    OrganizersModule,
    PaymentDetailModule,
    CollectionsModule,
    ExpenseModule,
    AnalyticsModule,
    FeedbackModule,
    ChatModule,
    EventsModule,
    AuthModule,
    NotificationsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
