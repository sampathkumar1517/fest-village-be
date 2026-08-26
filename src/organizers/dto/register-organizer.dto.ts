import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterOrganizerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

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
  organizationName?: string;
}
