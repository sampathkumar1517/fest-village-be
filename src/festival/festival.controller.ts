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
  Req,
} from '@nestjs/common';
import { FestivalService } from './festival.service';
import { FestivalAccessService } from './festival-access.service';
import { CreateFestivalDto } from './dto/create-festival.dto';
import { UpdateFestivalDto } from './dto/update-festival.dto';
import { OrganizerOnly, StaffOnly } from '../auth/decorators/admin-only.decorator';

@Controller('festival')
export class FestivalController {
  constructor(
    private readonly festivalService: FestivalService,
    private readonly festivalAccess: FestivalAccessService,
  ) {}

  @Post()
  @OrganizerOnly()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createFestivalDto: CreateFestivalDto, @Req() req: any) {
    return this.festivalService.AddFestival(createFestivalDto, req.user.id);
  }

  @Post('create-festival')
  @OrganizerOnly()
  @HttpCode(HttpStatus.CREATED)
  AddFestival(@Body() createFestivalDto: CreateFestivalDto, @Req() req: any) {
    return this.festivalService.AddFestival(createFestivalDto, req.user.id);
  }

  /** Festivals the current staff member can manage */
  @Get('manageable')
  @StaffOnly()
  async manageable(@Req() req: any) {
    const access = await this.festivalAccess.getAccessSummary(req.user);
    const festivals = await this.festivalAccess.festivalsByIds(
      access.festivalIds,
    );
    return {
      success: true,
      ...access,
      data: festivals.map((f) => ({
        id: f.id,
        festivalName: f.festivalName,
        name: f.festivalName,
        amountPerFamily: Number(f.amountPerFamily),
        organizerId: f.organizerId,
        ownerUserId: f.ownerUserId,
      })),
    };
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
  @StaffOnly()
  UpdateFestival(
    @Param('id') id: string,
    @Body() updateFestivalDto: UpdateFestivalDto,
    @Req() req: any,
  ) {
    return this.festivalService.UpdateFestival(
      +id,
      updateFestivalDto,
      req.user,
    );
  }

  @Patch(':id')
  @StaffOnly()
  update(
    @Param('id') id: string,
    @Body() updateFestivalDto: UpdateFestivalDto,
    @Req() req: any,
  ) {
    return this.festivalService.UpdateFestival(
      +id,
      updateFestivalDto,
      req.user,
    );
  }

  @Delete(':id')
  @OrganizerOnly()
  remove(@Param('id') id: string, @Req() req: any) {
    return this.festivalService.DeleteFestival(+id, req.user);
  }
}
