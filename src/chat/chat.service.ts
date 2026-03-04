import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { Festival } from '../festival/entities/festival.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(Festival)
    private festivalRepository: Repository<Festival>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createChatMessageDto: CreateChatMessageDto) {
    // Validate festival exists
    const festival = await this.festivalRepository.findOne({
      where: { id: createChatMessageDto.festivalId },
    });

    if (!festival) {
      throw new NotFoundException(
        `Festival with ID ${createChatMessageDto.festivalId} not found`,
      );
    }

    // Validate user exists
    const user = await this.userRepository.findOne({
      where: { id: createChatMessageDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createChatMessageDto.userId} not found`,
      );
    }

    const chatMessage = this.chatMessageRepository.create({
      ...createChatMessageDto,
      isBroadcast: createChatMessageDto.isBroadcast || false,
    });

    const saved = await this.chatMessageRepository.save(chatMessage);

    // Load relations for response
    return this.chatMessageRepository.findOne({
      where: { id: saved.id },
      relations: ['user', 'festival'],
    });
  }

  async findAllByFestival(festivalId: number, limit: number = 100) {
    return this.chatMessageRepository.find({
      where: { festivalId },
      relations: ['user', 'festival'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: number) {
    const message = await this.chatMessageRepository.findOne({
      where: { id },
      relations: ['user', 'festival'],
    });

    if (!message) {
      throw new NotFoundException(`Chat message with ID ${id} not found`);
    }

    return message;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.chatMessageRepository.softDelete(id);
    return {
      success: true,
      message: 'Chat message deleted successfully',
    };
  }
}
