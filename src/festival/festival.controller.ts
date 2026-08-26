import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FestivalService } from './festival.service';
import { CreateFestivalDto } from './dto/create-festival.dto';
import { UpdateFestivalDto } from './dto/update-festival.dto';

@Controller('festival')
export class FestivalController {
  constructor(private readonly festivalService: FestivalService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createFestivalDto: CreateFestivalDto) {
    return this.festivalService.AddFestival(createFestivalDto);
  }

  @Post('create-festival')
  @HttpCode(HttpStatus.CREATED)
  AddFestival(@Body() createFestivalDto: CreateFestivalDto) {
    return this.festivalService.AddFestival(createFestivalDto);
  }

  @Get()
  list() {
    return this.festivalService.GetAllFestivals();
  }

  @Post('get-all-festivals')
  GetAllFestivals() {
    return this.festivalService.GetAllFestivals();
  }

  @Get(':id/summary')
  getSummary(@Param('id') id: string) {
    return this.festivalService.GetFestivalSummary(+id);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.festivalService.GetFestivalById(+id);
  }

  @Post('get-festival-by-id/:id')
  GetFestivalById(@Param('id') id: string) {
    return this.festivalService.GetFestivalById(+id);
  }

  @Patch('update-festival/:id')
  UpdateFestival(
    @Param('id') id: string,
    @Body() updateFestivalDto: UpdateFestivalDto,
  ) {
    return this.festivalService.UpdateFestival(+id, updateFestivalDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFestivalDto: UpdateFestivalDto,
  ) {
    return this.festivalService.UpdateFestival(+id, updateFestivalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.festivalService.DeleteFestival(+id);
  }
}
