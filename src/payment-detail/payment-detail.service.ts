import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDetailDto } from './dto/create-payment-detail.dto';
import { UpdatePaymentDetailDto } from './dto/update-payment-detail.dto';
import {
  PaymentDetail,
  PaymentStatus,
  PaymentMethod,
} from './entities/payment-detail.entity';
import { User } from '../users/entities/user.entity';
import { Festival } from '../festival/entities/festival.entity';

@Injectable()
export class PaymentDetailService {
  constructor(
    @InjectRepository(PaymentDetail)
    private paymentDetailRepository: Repository<PaymentDetail>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Festival)
    private festivalRepository: Repository<Festival>,
  ) {}

  async AddPayment(createPaymentDetailDto: CreatePaymentDetailDto) {
    // Validate user exists
    const user = await this.userRepository.findOne({
      where: { id: createPaymentDetailDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createPaymentDetailDto.userId} not found`,
      );
    }

    // Validate festival exists
    const festival = await this.festivalRepository.findOne({
      where: { id: createPaymentDetailDto.festivalId },
    });

    if (!festival) {
      throw new NotFoundException(
        `Festival with ID ${createPaymentDetailDto.festivalId} not found`,
      );
    }



    // If collectedByUserId is provided, validate collector exist

    const paymentDetail = this.paymentDetailRepository.create({
      userId: createPaymentDetailDto.userId,
      festivalId: createPaymentDetailDto.festivalId,
      paidAmount: createPaymentDetailDto.paidAmount,
      paymentDate: new Date(createPaymentDetailDto.paymentDate),
      paymentStatus:
        createPaymentDetailDto.paymentStatus || PaymentStatus.PENDING,
      paymentMethod: createPaymentDetailDto.paymentMethod || PaymentMethod.CASH,
    });

    await this.paymentDetailRepository.save(paymentDetail);

    return {
      success: true,
      message: 'Payment detail created successfully',
      data: paymentDetail,
    };
  }

  async findAll(festivalId : number) {
    return this.paymentDetailRepository.find({
      where: { festivalId },
      relations: ['user', 'festival'],
    });
  }

  async findOne(id: number) {
    const paymentDetail = await this.paymentDetailRepository.findOne({
      where: { id },
      relations: ['user', 'festival'],
    });

    if (!paymentDetail) {
      throw new NotFoundException(`Payment detail with ID ${id} not found`);
    }

    return paymentDetail;
  }

  async findByUserId(userId: number) {
    return this.paymentDetailRepository.find({
      where: { userId },
      relations: ['festival'],
    });
  }

  async findByFestivalId(festivalId: number) {
    return this.paymentDetailRepository.find({
      where: { festivalId },
      relations: ['user'],
    });
  }

  async update(id: number, updatePaymentDetailDto: UpdatePaymentDetailDto) {
    const paymentDetail = await this.findOne(id);

    // If user is being updated, validate it exists
    if (updatePaymentDetailDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updatePaymentDetailDto.userId },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${updatePaymentDetailDto.userId} not found`,
        );
      }
    }

    // If festival is being updated, validate it exists
    if (updatePaymentDetailDto.festivalId) {
      const festival = await this.festivalRepository.findOne({
        where: { id: updatePaymentDetailDto.festivalId },
      });

      if (!festival) {
        throw new NotFoundException(
          `Festival with ID ${updatePaymentDetailDto.festivalId} not found`,
        );
      }

      // Validate amount if festival is changed
      if (
        updatePaymentDetailDto.paidAmount &&
        updatePaymentDetailDto.paidAmount !== paymentDetail.paidAmount
      ) {
        throw new BadRequestException(
          `Payment amount must match festival amount per family: ${paymentDetail.paidAmount}`,
        );
      }
    }

    await this.paymentDetailRepository.update(id, {
      ...updatePaymentDetailDto,
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: 'Payment detail updated successfully',
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.paymentDetailRepository.softDelete(id);
    return {
      success: true,
      message: 'Payment detail deleted successfully',
    };
  }

  async getPaymentStatistics(festivalId?: number) {
    const queryBuilder =
      this.paymentDetailRepository.createQueryBuilder('paymentDetail');

    if (festivalId) {
      queryBuilder.where('paymentDetail.festivalId = :festivalId', {
        festivalId,
      });
    }

    const totalPayments = await queryBuilder.getCount();
    const completedPayments = await queryBuilder
      .andWhere('paymentDetail.paymentStatus = :status', {
        status: 'completed',
      })
      .getCount();

    const totalAmount = await queryBuilder
      .select('SUM(paymentDetail.amount)', 'total')
      .getRawOne();

    return {
      totalPayments,
      completedPayments,
      pendingPayments: totalPayments - completedPayments,
      totalAmount: parseFloat(totalAmount?.total || '0'),
    };
  }
}
