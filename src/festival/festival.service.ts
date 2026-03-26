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
  ) { }

  async AddFestival(createFestivalDto: CreateFestivalDto) {
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

  async GetAllFestivals() {
    const festivals = await this.festivalRepository.find();
    const result = festivals.map(festival =>{
      return {
        id: festival.id,
        festivalName: festival.festivalName,
        amountPerFamily: festival.amountPerFamily,
        collectionStartDate: festival.collectionStartDate,
        festivalEndDate: festival.festivalEndDate,  
        isActive: festival.isActive,
        organizerName: festival.organizerName,
        InchargeName: festival.InchargeName,
      }
    })
    return {
      success: true,
      message: 'Festival fetched successfully',
      listData:[{ data: result }],
      total: result.length,
      page: 1,
      limit: 10,
      totalPages: Math.ceil(result.length / 10),
    };
  }

  async GetFestivalById(id: number) {
    const festival = await this.festivalRepository.findOne({ where: { id } });
    if (!festival) {
      throw new NotFoundException(`Festival with ID ${id} not found`);
    }
    const result = {
      id: festival.id,
      festivalName: festival.festivalName,
      amountPerFamily: festival.amountPerFamily,
      collectionStartDate: festival.collectionStartDate,
      festivalEndDate: festival.festivalEndDate,  
      isActive: festival.isActive,
      organizerName: festival.organizerName,
      InchargeName: festival.InchargeName,
    }
    return {
      success: true,
      message: 'Festival fetched successfully',
      listData: [{ data: result }]
  }
}

 async UpdateFestival(id: number, updateFestivalDto: UpdateFestivalDto) {
  const festival = await this.festivalRepository.findOne({ where: { id } });
  if (!festival) {
    throw new NotFoundException(`Festival with ID ${id} not found`);
  }
  const updateData = { ...updateFestivalDto };
  if (updateFestivalDto.collectionStartDate) {
    updateData.collectionStartDate = new Date(updateFestivalDto.collectionStartDate).toISOString();
  }
  if (updateFestivalDto.festivalEndDate) {
    updateData.festivalEndDate = new Date(updateFestivalDto.festivalEndDate).toISOString();
  }
  await this.festivalRepository.update(id, updateData);
  return {
    success: true,
    message: 'Festival updated successfully',
  }
}
}