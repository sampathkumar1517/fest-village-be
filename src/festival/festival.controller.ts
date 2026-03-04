import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FestivalService } from './festival.service';
import { CreateFestivalDto } from './dto/create-festival.dto';
import { UpdateFestivalDto } from './dto/update-festival.dto';

@Controller('festival')
export class FestivalController {
  constructor(private readonly festivalService: FestivalService) {}

  @Post( 'create-festival')
  create(@Body() createFestivalDto: CreateFestivalDto) {
    return this.festivalService.create(createFestivalDto);
  }

  @Get( 'get-all-festivals')
  findAll() {
    return this.festivalService.findAll();
  }

  @Get('get-festival-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.festivalService.findOne(+id);
  }

  @Patch('update-festival/:id')
  update(@Param('id') id: string, @Body() updateFestivalDto: UpdateFestivalDto) {
    return this.festivalService.update(+id, updateFestivalDto);
  }

  @Delete('delete-festival/:id')
  remove(@Param('id') id: string) {
    return this.festivalService.remove(+id);
  }
}
