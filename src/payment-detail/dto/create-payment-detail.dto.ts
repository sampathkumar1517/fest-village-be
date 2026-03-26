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
  @IsNotEmpty()
  collectedBy: string;
}
