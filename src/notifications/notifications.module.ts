import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { User } from '../users/entities/user.entity';
import { Festival } from '../festival/entities/festival.entity';
import { PaymentDetail } from '../payment-detail/entities/payment-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Festival, PaymentDetail])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
