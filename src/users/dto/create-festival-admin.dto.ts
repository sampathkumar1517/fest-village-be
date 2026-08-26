import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFestivalAdminDto {
  @Type(() => Number)
  @IsInt()
  festivalId: number;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  houseNumber?: string;
}
