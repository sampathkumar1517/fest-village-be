import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FestivalService } from './festival.service';
import { CreateFestivalDto } from './dto/create-festival.dto';
import { UpdateFestivalDto } from './dto/update-festival.dto';

@Controller('festival')
export class FestivalController {
  constructor(private readonly festivalService: FestivalService) {}

  @Post( 'create-festival')
  AddFestival(@Body() createFestivalDto: CreateFestivalDto) {
    return this.festivalService.AddFestival(createFestivalDto);
  }

  @Post('get-all-festivals')
  GetAllFestivals() {
    return this.festivalService.GetAllFestivals();
  }

  @Post('get-festival-by-id/:id')
  GetFestivalById(@Param('id') id: string) {
      return this.festivalService.GetFestivalById(+id);
  }

    @Patch('update-festival/:id')
  UpdateFestival(@Param('id') id: string, @Body() updateFestivalDto: UpdateFestivalDto) {
    return this.festivalService.UpdateFestival(+id, updateFestivalDto);
  }

}
