import {
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateFestivalDto {
  @IsString()
  @IsNotEmpty()
  festivalName: string;

  @IsNumber()
  @IsNotEmpty()
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
  @IsNotEmpty()
  organizerName: string;

  @IsString()
  @IsNotEmpty()
  InchargeName: string;
}
