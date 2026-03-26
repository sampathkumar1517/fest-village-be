import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async CreateUser(createUserDto: CreateUserDto) {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findOne({
      where: { phoneNumber: createUserDto.phoneNumber },
    });

    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }

    const nameParts = createUserDto.firstName.trim().split(/\s+/);
    const derivedLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'NA';

    const user = this.userRepository.create({
      ...createUserDto,
      // Keep required entity fields non-null even when DTO keeps them optional.
      lastName: derivedLastName,
      address: createUserDto.address ?? 'NA',
      houseNumber: createUserDto.houseNumber ?? 'NA',
      password: 'NA',
    });

    await this.userRepository.save(user);

    // Remove password from response
    const { password, ...result } = user;
    return {
      success: true,
      message: 'User created successfully',
      
    };
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

    // If password is being updated, hash it
    // if (updateUserDto.password) {
    //   updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    // }

    // Check if email is being updated and if it already exists
    if (updateUserDto.phoneNumber && updateUserDto.phoneNumber !== user.phoneNumber) {
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
