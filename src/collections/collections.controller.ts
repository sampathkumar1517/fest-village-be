import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { StaffOnly } from '../auth/decorators/admin-only.decorator';
import { FestivalAccessService } from '../festival/festival-access.service';

@Controller('collections')
export class CollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly festivalAccess: FestivalAccessService,
  ) {}

  @Post()
  @StaffOnly()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCollectionDto, @Req() req: any) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      dto.festivalId,
    );
    return this.collectionsService.create(dto);
  }

  @Get('festival/:festivalId')
  @StaffOnly()
  async findByFestival(
    @Param('festivalId') festivalId: string,
    @Req() req: any,
  ) {
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      +festivalId,
    );
    return this.collectionsService.findByFestival(+festivalId);
  }

  @Delete(':id')
  @StaffOnly()
  async remove(@Param('id') id: string, @Req() req: any) {
    const payment = await this.collectionsService.findOne(+id);
    await this.festivalAccess.assertCanManageFestival(
      req.user,
      payment.festivalId,
    );
    return this.collectionsService.remove(+id);
  }
}
