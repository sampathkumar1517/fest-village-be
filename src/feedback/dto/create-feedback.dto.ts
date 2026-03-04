import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  IsNumber,
} from 'class-validator';

export class CreateFeedbackDto {
  @IsNumber()
  @IsOptional()
  festivalId?: number;

  @IsString()
  @IsNotEmpty()
  fromName: string;

  @IsString()
  @IsOptional()
  fromPhone?: string;

  @IsString()
  @IsOptional()
  fromRole?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  comments?: string;
}

