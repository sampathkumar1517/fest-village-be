import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateFestivalAdminDto } from './dto/create-festival-admin.dto';
import { OrganizerOnly, StaffOnly } from '../auth/decorators/admin-only.decorator';
import { FestivalAccessService } from '../festival/festival-access.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly festivalAccess: FestivalAccessService,
  ) {}

  /** Organizer creates / assigns a festival-scoped admin */
  @Post('festival-admins')
  @OrganizerOnly()
  createFestivalAdmin(
    @Body() dto: CreateFestivalAdminDto,
    @Req() req: any,
  ) {
    return this.festivalAccess.createFestivalAdmin(req.user, dto);
  }

  @Get('festival-admins')
  @OrganizerOnly()
  listFestivalAdmins(
    @Query('festivalId') festivalId: string,
    @Req() req: any,
  ) {
    return this.festivalAccess.listFestivalAdmins(req.user, +festivalId);
  }

  @Delete('festival-admins/:id')
  @OrganizerOnly()
  removeFestivalAdmin(@Param('id') id: string, @Req() req: any) {
    return this.festivalAccess.removeFestivalAdmin(req.user, +id);
  }

  @Post('create-user')
  @OrganizerOnly()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.CreateUser(createUserDto);
  }

  @Get()
  @OrganizerOnly()
  GetAllUsers() {
    return this.usersService.GetAllUsers();
  }

  @Get('phone-number/:phoneNumber')
  @OrganizerOnly()
  GetUserByPhoneNumber(@Param('phoneNumber') phoneNumber: string) {
    return this.usersService.GetUserByPhoneNumber(phoneNumber);
  }

  @Get(':id')
  @StaffOnly()
  GetUserById(@Param('id') id: string) {
    return this.usersService.GetUserById(+id);
  }

  @Patch(':id')
  @OrganizerOnly()
  UpdateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.UpdateUser(+id, updateUserDto);
  }

  @Delete(':id')
  @OrganizerOnly()
  DeleteUser(@Param('id') id: string) {
    return this.usersService.DeleteUser(+id);
  }
}
