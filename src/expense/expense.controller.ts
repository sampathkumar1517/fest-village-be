import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { OrganizerOnly, StaffOnly } from '../auth/decorators/admin-only.decorator';
import { FestivalAccessService } from '../festival/festival-access.service';

@Controller('expenses')
export class ExpenseController {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly festivalAccess: FestivalAccessService,
  ) {}

  @Post()
  @StaffOnly()
  async create(@Body() createExpenseDto: CreateExpenseDto, @Req() req: any) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      createExpenseDto.festivalId,
    );
    return this.expenseService.createExpenses(createExpenseDto);
  }

  @Get('categories/all')
  findAllCategories() {
    return this.expenseService.findAllCategories();
  }

  @Post('categories')
  @OrganizerOnly()
  createCategory(@Body() body: { name: string; description?: string }) {
    return this.expenseService.createCategory(body.name, body.description);
  }

  @Get('festival/:festivalId/total')
  @StaffOnly()
  async getTotalByFestival(
    @Param('festivalId') festivalId: string,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalId,
    );
    return this.expenseService.getTotalByFestival(+festivalId);
  }

  @Get('festival/:festivalId')
  @StaffOnly()
  async findAllByFestival(
    @Param('festivalId') festivalId: string,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalId,
    );
    return this.expenseService.findAllByFestival(+festivalId);
  }

  @Get(':id')
  @StaffOnly()
  async findOne(@Param('id') id: string, @Req() req: any) {
    const expense = await this.expenseService.findEntity(+id);
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      expense.festivalId,
    );
    return this.expenseService.findOne(+id);
  }

  @Patch(':id')
  @StaffOnly()
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Req() req: any,
  ) {
    const expense = await this.expenseService.findEntity(+id);
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      expense.festivalId,
    );
    return this.expenseService.update(+id, updateExpenseDto);
  }

  @Delete(':id')
  @StaffOnly()
  async remove(@Param('id') id: string, @Req() req: any) {
    const expense = await this.expenseService.findEntity(+id);
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      expense.festivalId,
    );
    return this.expenseService.remove(+id);
  }
}
