import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Festival } from '../festival/entities/festival.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseCategory)
    private readonly categoryRepository: Repository<ExpenseCategory>,
    @InjectRepository(Festival)
    private readonly festivalRepository: Repository<Festival>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ---- Expense CRUD ----

  async create(createExpenseDto: CreateExpenseDto) {
    const festival = await this.festivalRepository.findOne({
      where: { id: createExpenseDto.festivalId },
    });
    if (!festival) {
      throw new NotFoundException(
        `Festival with ID ${createExpenseDto.festivalId} not found`,
      );
    }

    const category = await this.categoryRepository.findOne({
      where: { id: createExpenseDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Expense category with ID ${createExpenseDto.categoryId} not found`,
      );
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
      ...createExpenseDto,
      expenseDate: new Date(createExpenseDto.expenseDate),
    });
    await this.expenseRepository.save(expense);

    return {
      success: true,
      message: 'Expense created successfully',
      data: expense,
    };
  }

  findAllByFestival(festivalId: number) {
    return this.expenseRepository.find({
      where: { festivalId },
      relations: ['category', 'festival', 'recordedByUser'],
      order: { expenseDate: 'ASC' },
    });
  }

  async findOne(id: number) {
    const expense = await this.expenseRepository.findOne({
      where: { id },
      relations: ['category', 'festival', 'recordedByUser'],
    });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  async update(id: number, updateExpenseDto: UpdateExpenseDto) {
    await this.findOne(id);
    if (updateExpenseDto.expenseDate) {
      (updateExpenseDto as any).expenseDate = new Date(
        updateExpenseDto.expenseDate,
      );
    }
    await this.expenseRepository.update(id, updateExpenseDto);
    return {
      success: true,
      message: 'Expense updated successfully',
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.expenseRepository.softDelete(id);
    return {
      success: true,
      message: 'Expense deleted successfully',
    };
  }

  // ---- Categories ----

  createCategory(name: string, description?: string) {
    const category = this.categoryRepository.create({ name, description });
    return this.categoryRepository.save(category);
  }

  findAllCategories() {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }
}

