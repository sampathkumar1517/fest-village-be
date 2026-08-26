import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check phone uniqueness
    const existingByPhone = await this.usersService.GetUserByPhoneNumber(
      registerDto.phoneNumber,
    );
    if (existingByPhone) {
      throw new ConflictException('User with this phone number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const nameParts = registerDto.firstName.trim().split(/\s+/);
    const derivedLastName =
      nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'NA';

    const user = await this.usersService.CreateUserForAuth({
      firstName: registerDto.firstName,
      lastName: derivedLastName,
      email: registerDto.email,
      phoneNumber: registerDto.phoneNumber,
      password: hashedPassword,
      address: registerDto.address ?? 'NA',
      houseNumber: registerDto.houseNumber ?? 'NA',
      role: registerDto.role,
    });

    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    };
  }

  async validateUser(phoneNumber: string, password: string): Promise<any> {
    const user = await this.usersService.GetUserByPhoneNumber(phoneNumber);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(
      loginDto.phoneNumber,
      loginDto.password,
    );

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const payload = {
      phoneNumber: user.phoneNumber,
      sub: user.id,
      role: user.role,
    };

    return {
      success: true,
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
