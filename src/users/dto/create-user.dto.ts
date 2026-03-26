import {
  IsString, 
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  MinLength,
  IsEmail,
} from 'class-validator';
import { User} from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;  

  // @IsString()
  // @IsOptional()
  // lastName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  houseNumber?: string;

  

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
