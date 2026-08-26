import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  Matches,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCollectionDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  festivalId: number;

  @IsString()
  @IsNotEmpty()
  familyName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, {
    message: 'mobileNumber must be a 10-digit number',
  })
  mobileNumber: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  paidAmount: number;

  @IsString()
  @IsIn(['Cash', 'Online', 'Cheque'])
  paymentType: string;

  @IsString()
  @IsOptional()
  collectorName?: string;
}
