import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateChatMessageDto {
  @IsNumber()
  @IsNotEmpty()
  festivalId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsBoolean()
  @IsOptional()
  isBroadcast?: boolean;

  @IsNumber()
  @IsOptional()
  replyToMessageId?: number;
}
