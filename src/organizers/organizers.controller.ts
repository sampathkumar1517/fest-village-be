import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { OrganizersService } from './organizers.service';
import { RegisterOrganizerDto } from './dto/register-organizer.dto';
import { LoginOrganizerDto } from './dto/login-organizer.dto';

@Controller('organizers')
export class OrganizersController {
  constructor(private readonly organizersService: OrganizersService) {}

  /** POST /organizers/register — public organizer signup */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterOrganizerDto) {
    return this.organizersService.register(dto);
  }

  /** POST /organizers/login — organizer JWT */
  @Post('login')
  login(@Body() dto: LoginOrganizerDto) {
    return this.organizersService.login(dto);
  }
}
