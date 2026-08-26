import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create-user')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.CreateUser(createUserDto);
  }

  @Get()
  GetAllUsers() {
    return this.usersService.GetAllUsers();
  }

  @Get('phone-number/:phoneNumber')
  GetUserByPhoneNumber(@Param('phoneNumber') phoneNumber: string) {
    return this.usersService.GetUserByPhoneNumber(phoneNumber);
  }

  @Get(':id')
  GetUserById(@Param('id') id: string) {
    return this.usersService.GetUserById(+id);
  }

  @Patch(':id')
  UpdateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.UpdateUser(+id, updateUserDto);
  }

  @Delete(':id')
  DeleteUser(@Param('id') id: string) {
    return this.usersService.DeleteUser(+id);
  }
}
