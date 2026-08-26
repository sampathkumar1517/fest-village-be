import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFestivalDto } from './dto/create-festival.dto';
import { UpdateFestivalDto } from './dto/update-festival.dto';
import { Repository } from 'typeorm';
import { Festival } from './entities/festival.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentDetail } from '../payment-detail/entities/payment-detail.entity';
import { Expense } from '../expense/entities/expense.entity';

function mapFestival(festival: Festival) {
  return {
    id: festival.id,
    festivalName: festival.festivalName,
    name: festival.festivalName,
    amountPerFamily: Number(festival.amountPerFamily),
    perFamilyAmount: Number(festival.amountPerFamily),
    collectionStartDate: festival.collectionStartDate,
    festivalEndDate: festival.festivalEndDate,
    startDate: festival.collectionStartDate,
    endDate: festival.festivalEndDate,
    isActive: festival.isActive,
    organizerName: festival.organizerName,
    organizers: festival.organizerName,
    InchargeName: festival.InchargeName,
    incharge: festival.InchargeName,
    createdAt: festival.festivalCreatedAt,
  };
}

@Injectable()
export class FestivalService {
  constructor(
    @InjectRepository(Festival)
    private festivalRepository: Repository<Festival>,
    @InjectRepository(PaymentDetail)
    private paymentRepository: Repository<PaymentDetail>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async AddFestival(createFestivalDto: CreateFestivalDto) {
    const festival = this.festivalRepository.create({
      festivalName: createFestivalDto.festivalName,
      amountPerFamily: createFestivalDto.amountPerFamily,
      collectionStartDate: new Date(createFestivalDto.collectionStartDate),
      festivalEndDate: new Date(createFestivalDto.festivalEndDate),
      isActive: createFestivalDto.isActive ?? true,
      organizerName: createFestivalDto.organizerName ?? '',
      InchargeName: createFestivalDto.InchargeName ?? '',
    });
    await this.festivalRepository.save(festival);
    return {
      success: true,
      message: 'Festival created successfully',
      data: mapFestival(festival),
    };
  }

  async GetAllFestivals() {
    const festivals = await this.festivalRepository.find({
      order: { festivalCreatedAt: 'DESC' },
    });
    const result = festivals.map(mapFestival);
    return {
      success: true,
      message: 'Festival fetched successfully',
      data: result,
      listData: [{ data: result }],
      total: result.length,
      page: 1,
      limit: result.length || 10,
      totalPages: 1,
    };
  }

  async GetFestivalById(id: number) {
    const festival = await this.festivalRepository.findOne({ where: { id } });
    if (!festival) {
      throw new NotFoundException(`Festival with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Festival fetched successfully',
      data: mapFestival(festival),
      listData: [{ data: mapFestival(festival) }],
    };
  }

  async UpdateFestival(id: number, updateFestivalDto: UpdateFestivalDto) {
    const festival = await this.festivalRepository.findOne({ where: { id } });
    if (!festival) {
      throw new NotFoundException(`Festival with ID ${id} not found`);
    }
    const updateData: Partial<Festival> = { ...updateFestivalDto } as any;
    if (updateFestivalDto.collectionStartDate) {
      updateData.collectionStartDate = new Date(
        updateFestivalDto.collectionStartDate,
      );
    }
    if (updateFestivalDto.festivalEndDate) {
      updateData.festivalEndDate = new Date(updateFestivalDto.festivalEndDate);
    }
    await this.festivalRepository.update(id, updateData);
    const updated = await this.festivalRepository.findOne({ where: { id } });
    return {
      success: true,
      message: 'Festival updated successfully',
      data: updated ? mapFestival(updated) : null,
    };
  }

  async DeleteFestival(id: number) {
    const festival = await this.festivalRepository.findOne({ where: { id } });
    if (!festival) {
      throw new NotFoundException(`Festival with ID ${id} not found`);
    }
    await this.festivalRepository.softDelete(id);
    return {
      success: true,
      message: 'Festival deleted successfully',
    };
  }

  async GetFestivalSummary(id: number) {
    const festival = await this.festivalRepository.findOne({ where: { id } });
    if (!festival) {
      throw new NotFoundException(`Festival with ID ${id} not found`);
    }

    const payments = await this.paymentRepository.find({
      where: { festivalId: id },
    });
    const expenses = await this.expenseRepository.find({
      where: { festivalId: id },
    });

    const totalCollected = payments.reduce(
      (sum, p) => sum + (Number(p.paidAmount) || 0),
      0,
    );
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + (Number(e.amount) || 0),
      0,
    );
    const collectionCount = payments.length;
    const balance = totalCollected - totalExpenses;

    return {
      success: true,
      message: 'Festival summary fetched successfully',
      data: {
        festivalId: festival.id,
        festivalName: festival.festivalName,
        totalCollected,
        totalExpenses,
        balance,
        collectionCount,
      },
    };
  }
}
