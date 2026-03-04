import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFestivalDto } from './dto/create-festival.dto';
import { UpdateFestivalDto } from './dto/update-festival.dto';
import { Repository } from 'typeorm';
import { Festival } from './entities/festival.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FestivalService {
  constructor(
    @InjectRepository(Festival)
    private festivalRepository: Repository<Festival>,
  ) {}

  async create(createFestivalDto: CreateFestivalDto) {
    const festival = this.festivalRepository.create({
      ...createFestivalDto,
      collectionStartDate: new Date(createFestivalDto.collectionStartDate),
      festivalEndDate: new Date(createFestivalDto.festivalEndDate),
      isActive: createFestivalDto.isActive ?? true,
    });
    await this.festivalRepository.save(festival);
    return {
      success: true,
      message: 'Festival created successfully',
      data: festival,
    };
  }

  findAll() {
    return this.festivalRepository.find();
  }

  async findOne(id: number) {
    const festival = await this.festivalRepository.findOne({ where: { id } });
    if (!festival) {
      throw new NotFoundException(`Festival with ID ${id} not found`);
    }
    return festival;
  }

  async update(id: number, updateFestivalDto: UpdateFestivalDto) {
    await this.festivalRepository.update(id, updateFestivalDto);
    return {
      success: true,
      message: 'Festival updated successfully',
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.festivalRepository.softDelete(id);
    return {
      success: true,
      message: 'Festival deleted successfully',
    };
  }
}
