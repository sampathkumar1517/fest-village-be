import {
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFestivalDto {
  @IsString()
  @IsNotEmpty()
  festivalName: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amountPerFamily: number;

  @IsDateString()
  @IsNotEmpty()
  collectionStartDate: string;

  @IsDateString()
  @IsNotEmpty()
  festivalEndDate: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  organizerName?: string;

  @IsString()
  @IsOptional()
  InchargeName?: string;
}
