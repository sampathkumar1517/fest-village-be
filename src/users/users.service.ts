import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

export interface CreateUserForAuthPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  address: string;
  houseNumber: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create a family member (no password – used by admin via /users/create-user).
   */
  async CreateUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { phoneNumber: createUserDto.phoneNumber },
    });

    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }

    // Check email uniqueness as email has a unique constraint on the table
    const existingByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const nameParts = createUserDto.firstName.trim().split(/\s+/);
    const derivedLastName =
      nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'NA';

    const user = this.userRepository.create({
      ...createUserDto,
      lastName: derivedLastName,
      address: createUserDto.address ?? 'NA',
      houseNumber: createUserDto.houseNumber ?? 'NA',
      password: 'NA',
      role: UserRole.MEMBER,
    });

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'User created successfully',
    };
  }

  /**
   * Create a user with a pre-hashed password (used by /auth/register).
   * Returns the saved User entity so the caller can build the JWT payload.
   */
  async CreateUserForAuth(payload: CreateUserForAuthPayload): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: payload.email },
    });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.userRepository.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      password: payload.password,
      address: payload.address,
      houseNumber: payload.houseNumber,
      role: payload.role ?? UserRole.MEMBER,
      isActive: true,
    });

    return this.userRepository.save(user);
  }

  async GetAllUsers() {
    const users = await this.userRepository.find({
      relations: ['paymentDetails'],
    });
    return users.map(({ password, ...user }) => user);
  }

  async GetUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['paymentDetails'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...result } = user;
    return result;
  }

  async GetUserByPhoneNumber(phoneNumber: string) {
    return this.userRepository.findOne({
      where: { phoneNumber },
    });
  }

  async UpdateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.GetUserById(id);

    if (
      updateUserDto.phoneNumber &&
      updateUserDto.phoneNumber !== user.phoneNumber
    ) {
      const existingUser = await this.userRepository.findOne({
        where: { phoneNumber: updateUserDto.phoneNumber },
      });

      if (existingUser) {
        throw new ConflictException('User with this phone number already exists');
      }
    }

    await this.userRepository.update(id, {
      ...updateUserDto,
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: 'User updated successfully',
    };
  }

  async DeleteUser(id: number) {
    await this.userRepository.softDelete(id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
