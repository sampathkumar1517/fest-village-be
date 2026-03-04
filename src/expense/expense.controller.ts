import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  // 3rd page: expenses listing and creation

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.create(createExpenseDto);
  }

  @Get('festival/:festivalId')
  findAllByFestival(@Param('festivalId') festivalId: string) {
    return this.expenseService.findAllByFestival(+festivalId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(+id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseService.remove(+id);
  }

  // Categories for dropdown (food, flower, petrol, etc.)

  @Post('categories')
  createCategory(
    @Body()
    body: {
      name: string;
      description?: string;
    },
  ) {
    return this.expenseService.createCategory(body.name, body.description);
  }

  @Get('categories/all')
  findAllCategories() {
    return this.expenseService.findAllCategories();
  }
}

