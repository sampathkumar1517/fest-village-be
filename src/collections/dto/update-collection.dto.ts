import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  Matches,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  familyName?: string;

  /** Optional; empty clears the number; if provided must be 10 digits */
  @IsOptional()
  @IsString()
  @ValidateIf((_, v) => v != null && String(v).trim() !== '')
  @Matches(/^[0-9]{10}$/, {
    message: 'mobileNumber must be a 10-digit number',
  })
  mobileNumber?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  paidAmount?: number;

  @IsOptional()
  @IsString()
  @IsIn(['Cash', 'Online', 'Cheque'])
  paymentType?: string;

  @IsOptional()
  @IsString()
  collectorName?: string;
}
