import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Festival } from '../festival/entities/festival.entity';
import { User } from '../users/entities/user.entity';
import { seedExpenseCategories } from '../database/seed-categories';

function mapExpense(expense: Expense) {
  return {
    id: expense.id,
    festivalId: expense.festivalId,
    categoryId: expense.categoryId,
    category:
      expense.category ||
      expense.categoryRelation?.name ||
      'Others',
    categoryName:
      expense.category ||
      expense.categoryRelation?.name ||
      'Others',
    amount: Number(expense.amount),
    expenseDate: expense.expenseDate,
    description: expense.description,
    recordedByUserId: expense.recordedByUserId,
    createdAt: expense.createdAt,
  };
}

@Injectable()
export class ExpenseService implements OnModuleInit {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseCategory)
    private readonly categoryRepository: Repository<ExpenseCategory>,
    @InjectRepository(Festival)
    private readonly festivalRepository: Repository<Festival>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      await seedExpenseCategories(this.dataSource);
    } catch (err) {
      console.warn('Expense category seed skipped:', (err as Error).message);
    }
  }

  async createExpenses(createExpenseDto: CreateExpenseDto) {
    const festival = await this.festivalRepository.findOne({
      where: { id: createExpenseDto.festivalId },
    });
    if (!festival) {
      throw new NotFoundException(
        `Festival with ID ${createExpenseDto.festivalId} not found`,
      );
    }

    let categoryName = createExpenseDto.category;
    let categoryId = createExpenseDto.categoryId ?? null;

    if (categoryName) {
      const byName = await this.categoryRepository.findOne({
        where: { name: categoryName },
      });
      if (byName) categoryId = byName.id;
    } else if (categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Expense category with ID ${categoryId} not found`,
        );
      }
      categoryName = category.name;
    } else {
      throw new BadRequestException('category or categoryId is required');
    }

    if (createExpenseDto.recordedByUserId) {
      const user = await this.userRepository.findOne({
        where: { id: createExpenseDto.recordedByUserId },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${createExpenseDto.recordedByUserId} not found`,
        );
      }
    }

    const expense = this.expenseRepository.create({
      festivalId: createExpenseDto.festivalId,
      categoryId,
      category: categoryName,
      amount: createExpenseDto.amount,
      description: createExpenseDto.description,
      recordedByUserId: createExpenseDto.recordedByUserId,
      expenseDate: createExpenseDto.expenseDate
        ? new Date(createExpenseDto.expenseDate)
        : new Date(),
    });
    await this.expenseRepository.save(expense);

    return {
      success: true,
      message: 'Expense created successfully',
      data: mapExpense(expense),
    };
  }

  async findAllByFestival(festivalId: number) {
    const expenses = await this.expenseRepository.find({
      where: { festivalId },
      relations: ['categoryRelation', 'festival', 'recordedByUser'],
      order: { createdAt: 'DESC' },
    });
    return {
      success: true,
      message: 'Expenses fetched successfully',
      data: expenses.map(mapExpense),
    };
  }

  async findOne(id: number) {
    const expense = await this.expenseRepository.findOne({
      where: { id },
      relations: ['categoryRelation', 'festival', 'recordedByUser'],
    });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return mapExpense(expense);
  }

  async update(id: number, updateExpenseDto: UpdateExpenseDto) {
    await this.findOne(id);
    const updateData: any = { ...updateExpenseDto };
    if (updateExpenseDto.expenseDate) {
      updateData.expenseDate = new Date(updateExpenseDto.expenseDate);
    }
    if ((updateExpenseDto as any).category) {
      updateData.category = (updateExpenseDto as any).category;
    }
    await this.expenseRepository.update(id, updateData);
    return {
      success: true,
      message: 'Expense updated successfully',
    };
  }

  async remove(id: number) {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    await this.expenseRepository.softDelete(id);
    return {
      success: true,
      message: 'Expense deleted successfully',
    };
  }

  createCategory(name: string, description?: string) {
    const category = this.categoryRepository.create({ name, description });
    return this.categoryRepository.save(category);
  }

  async findAllCategories() {
    const categories = await this.categoryRepository.find({
      order: { name: 'ASC' },
    });
    return {
      success: true,
      message: 'Categories fetched successfully',
      data: categories,
    };
  }

  async getTotalByFestival(festivalId: number) {
    const festival = await this.festivalRepository.findOne({
      where: { id: festivalId },
    });
    if (!festival) {
      throw new NotFoundException(`Festival with ID ${festivalId} not found`);
    }

    const expenses = await this.expenseRepository.find({
      where: { festivalId },
    });
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + (Number(e.amount) || 0),
      0,
    );
    const byCategoryMap: Record<string, number> = {};
    expenses.forEach((e) => {
      const cat = e.category || 'Others';
      byCategoryMap[cat] = (byCategoryMap[cat] || 0) + (Number(e.amount) || 0);
    });

    return {
      success: true,
      data: {
        festivalId,
        festivalName: festival.festivalName,
        totalExpenses,
        byCategory: Object.entries(byCategoryMap).map(([category, amount]) => ({
          category,
          amount,
        })),
      },
    };
  }
}
