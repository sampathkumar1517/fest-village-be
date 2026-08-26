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
    // Validate and normalize amount to avoid DB overflow on numeric(10,2)
    const rawAmount = Number(createPaymentDetailDto.paidAmount);
    if (Number.isNaN(rawAmount) || rawAmount < 0) {
      throw new BadRequestException('paidAmount must be a non-negative number');
    }
    if (rawAmount >= 100_000_000) {
      throw new BadRequestException(
        'paidAmount exceeds maximum allowed 99,999,999.99',
      );
    }
    const normalizedAmount = Math.round(rawAmount * 100) / 100;

    if (createPaymentDetailDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: createPaymentDetailDto.userId },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${createPaymentDetailDto.userId} not found`,
        );
      }
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

    const paymentDetail = this.paymentDetailRepository.create({
      userId: createPaymentDetailDto.userId ?? null,
      festivalId: createPaymentDetailDto.festivalId,
      paidAmount: normalizedAmount,
      totalAmount: Number(festival.amountPerFamily) || null,
      paymentDate: new Date(createPaymentDetailDto.paymentDate),
      paymentStatus:
        createPaymentDetailDto.paymentStatus || PaymentStatus.COMPLETED,
      paymentMethod:
        createPaymentDetailDto.paymentMethod || PaymentMethod.CASH,
      CollectedBy: createPaymentDetailDto.collectedBy ?? null,
      collectorName: createPaymentDetailDto.collectedBy ?? null,
    });

    await this.paymentDetailRepository.save(paymentDetail);

    return {
      success: true,
      message: 'Payment detail created successfully',
      data: paymentDetail,
    };
  }

  async findAll(festivalId: number) {
    return this.paymentDetailRepository.find({
      where: { festivalId },
      relations: ['user', 'festival'],
      order: { paymentDate: 'DESC' },
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
      order: { paymentDate: 'DESC' },
    });
  }

  async findByFestivalId(festivalId: number) {
    return this.paymentDetailRepository.find({
      where: { festivalId },
      relations: ['user'],
      order: { paymentDate: 'DESC' },
    });
  }

  async update(id: number, updatePaymentDetailDto: UpdatePaymentDetailDto) {
    const paymentDetail = await this.findOne(id);

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

    if (updatePaymentDetailDto.festivalId) {
      const festival = await this.festivalRepository.findOne({
        where: { id: updatePaymentDetailDto.festivalId },
      });
      if (!festival) {
        throw new NotFoundException(
          `Festival with ID ${updatePaymentDetailDto.festivalId} not found`,
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

  /**
   * Get payment statistics for a festival.
   * Each query uses its own QueryBuilder to avoid mutation bugs.
   */
  async getPaymentStatistics(festivalId?: number) {
    const base = () => {
      const qb =
        this.paymentDetailRepository.createQueryBuilder('payment');
      if (festivalId) {
        qb.where('payment.festivalId = :festivalId', { festivalId });
      }
      return qb;
    };

    const totalPayments = await base().getCount();

    const completedPayments = await base()
      .andWhere('payment.paymentStatus = :status', { status: 'completed' })
      .getCount();

    const totalAmountRaw = await base()
      .select('SUM(payment.paidAmount)', 'total')
      .getRawOne();

    const completedAmountRaw = await base()
      .select('SUM(payment.paidAmount)', 'total')
      .andWhere('payment.paymentStatus = :status', { status: 'completed' })
      .getRawOne();

    return {
      totalPayments,
      completedPayments,
      pendingPayments: totalPayments - completedPayments,
      totalAmount: parseFloat(totalAmountRaw?.total || '0'),
      completedAmount: parseFloat(completedAmountRaw?.total || '0'),
    };
  }

  /**
   * GET /payment-detail/festival/:festivalId/total
   * Returns the total collected amount (all payment statuses) for a festival.
   */
  async getTotalCollectionByFestival(festivalId: number) {
    const festival = await this.festivalRepository.findOne({
      where: { id: festivalId },
    });
    if (!festival) {
      throw new NotFoundException(
        `Festival with ID ${festivalId} not found`,
      );
    }

    const totalRaw = await this.paymentDetailRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.paidAmount)', 'total')
      .where('payment.festivalId = :festivalId', { festivalId })
      .getRawOne();

    const completedRaw = await this.paymentDetailRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.paidAmount)', 'total')
      .where('payment.festivalId = :festivalId', { festivalId })
      .andWhere('payment.paymentStatus = :status', { status: 'completed' })
      .getRawOne();

    const totalFamiliesRaw = await this.paymentDetailRepository
      .createQueryBuilder('payment')
      .select('COUNT(DISTINCT payment.userId)', 'count')
      .where('payment.festivalId = :festivalId', { festivalId })
      .getRawOne();

    return {
      festivalId,
      festivalName: festival.festivalName,
      amountPerFamily: festival.amountPerFamily,
      totalCollected: parseFloat(totalRaw?.total || '0'),
      completedCollection: parseFloat(completedRaw?.total || '0'),
      totalFamiliesPaid: parseInt(totalFamiliesRaw?.count || '0'),
    };
  }



}
