import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Organizer } from './entities/organizer.entity';
import { RegisterOrganizerDto } from './dto/register-organizer.dto';
import { LoginOrganizerDto } from './dto/login-organizer.dto';
import { FestivalAccessService } from '../festival/festival-access.service';

@Injectable()
export class OrganizersService {
  constructor(
    @InjectRepository(Organizer)
    private readonly organizerRepo: Repository<Organizer>,
    private readonly jwtService: JwtService,
    private readonly festivalAccess: FestivalAccessService,
  ) {}

  async findById(id: number) {
    return this.organizerRepo.findOne({ where: { id } });
  }

  async findByPhone(phoneNumber: string) {
    return this.organizerRepo.findOne({ where: { phoneNumber } });
  }

  async register(dto: RegisterOrganizerDto) {
    const byPhone = await this.organizerRepo.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (byPhone) {
      throw new ConflictException(
        'Organizer with this phone number already exists',
      );
    }
    const byEmail = await this.organizerRepo.findOne({
      where: { email: dto.email },
    });
    if (byEmail) {
      throw new ConflictException('Organizer with this email already exists');
    }

    const organizer = this.organizerRepo.create({
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      phoneNumber: dto.phoneNumber.trim(),
      password: await bcrypt.hash(dto.password, 10),
      organizationName: dto.organizationName?.trim() || null,
      isActive: true,
    });
    await this.organizerRepo.save(organizer);

    return {
      success: true,
      message: 'Organizer registered successfully. Please log in.',
      data: {
        id: organizer.id,
        name: organizer.name,
        email: organizer.email,
        phoneNumber: organizer.phoneNumber,
        organizationName: organizer.organizationName,
      },
    };
  }

  async login(dto: LoginOrganizerDto) {
    const organizer = await this.findByPhone(dto.phoneNumber);
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }
    const ok = await bcrypt.compare(dto.password, organizer.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!organizer.isActive) {
      throw new UnauthorizedException('Organizer account is inactive');
    }

    const authUser = {
      id: organizer.id,
      role: 'organizer' as const,
      type: 'organizer' as const,
    };
    const access = await this.festivalAccess.getAccessSummary(authUser);

    const payload = {
      sub: organizer.id,
      phoneNumber: organizer.phoneNumber,
      role: 'organizer',
      type: 'organizer',
    };

    return {
      success: true,
      access_token: this.jwtService.sign(payload),
      user: {
        id: organizer.id,
        name: organizer.name,
        firstName: organizer.name,
        email: organizer.email,
        phoneNumber: organizer.phoneNumber,
        organizationName: organizer.organizationName,
        role: 'organizer',
        type: 'organizer',
        festivalIds: access.festivalIds,
      },
    };
  }

  toAuthPrincipal(organizer: Organizer) {
    return {
      id: organizer.id,
      name: organizer.name,
      firstName: organizer.name,
      email: organizer.email,
      phoneNumber: organizer.phoneNumber,
      organizationName: organizer.organizationName,
      role: 'organizer' as const,
      type: 'organizer' as const,
      isActive: organizer.isActive,
    };
  }
}
