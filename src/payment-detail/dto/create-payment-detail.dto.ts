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
import { Max } from 'class-validator';
export class CreatePaymentDetailDto {
  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsNumber()
  @IsNotEmpty()
  festivalId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  // Cap to DB column numeric(10,2): max < 100,000,000
  @Max(99999999.99)
  paidAmount: number;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;



  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;


  @IsString()
  @IsOptional()
  collectedBy?: string;
}
