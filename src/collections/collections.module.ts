import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { PaymentDetail } from '../payment-detail/entities/payment-detail.entity';
import { Festival } from '../festival/entities/festival.entity';
import { FestivalModule } from '../festival/festival.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentDetail, Festival]),
    FestivalModule,
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
