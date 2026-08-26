import {
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsString,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export const EXPENSE_CATEGORY_NAMES = [
  'Food',
  'Flower',
  'Festival Items',
  'Petrol',
  'Dress',
  'Decoration',
  'Retail Shop',
  'Others',
] as const;

export class CreateExpenseDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  festivalId: number;

  @IsString()
  @IsOptional()
  @IsIn([...EXPENSE_CATEGORY_NAMES])
  category?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  @IsOptional()
  expenseDate?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  recordedByUserId?: number;
}
