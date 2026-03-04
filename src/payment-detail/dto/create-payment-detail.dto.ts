import {
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { PaymentStatus, PaymentMethod } from '../entities/payment-detail.entity';

export class CreatePaymentDetailDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  festivalId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;

  @IsString()
  @IsOptional()
  receiptNumber?: string;

  // who collected the amount (user id of collector)
  @IsNumber()
  @IsOptional()
  collectedByUserId?: number;
}
