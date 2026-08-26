import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  // ---- Expense CRUD ----

  /** POST /expenses */
  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.createExpenses(createExpenseDto);
  }

  /**
   * GET /expenses/categories/all
   * NOTE: Must be declared BEFORE the :id route to avoid shadowing.
   */
  @Get('categories/all')
  findAllCategories() {
    return this.expenseService.findAllCategories();
  }

  /** POST /expenses/categories */
  @Post('categories')
  createCategory(@Body() body: { name: string; description?: string }) {
    return this.expenseService.createCategory(body.name, body.description);
  }

  /**
   * GET /expenses/festival/:festivalId/total
   * Returns the total expense amount for a festival.
   */
  @Get('festival/:festivalId/total')
  getTotalByFestival(@Param('festivalId') festivalId: string) {
    return this.expenseService.getTotalByFestival(+festivalId);
  }

  /** GET /expenses/festival/:festivalId */
  @Get('festival/:festivalId')
  findAllByFestival(@Param('festivalId') festivalId: string) {
    return this.expenseService.findAllByFestival(+festivalId);
  }

  /** GET /expenses/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(+id);
  }

  /** PATCH /expenses/:id */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(+id, updateExpenseDto);
  }

  /** DELETE /expenses/:id */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseService.remove(+id);
  }
}
