import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaymentDetail,
  PaymentMethod,
  PaymentStatus,
} from '../payment-detail/entities/payment-detail.entity';
import { Festival } from '../festival/entities/festival.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';

function mapPaymentTypeToMethod(paymentType: string): PaymentMethod {
  const normalized = paymentType.toLowerCase();
  if (normalized === 'online') return PaymentMethod.ONLINE;
  if (normalized === 'cheque') return PaymentMethod.CHEQUE;
  return PaymentMethod.CASH;
}

function toCollectionResponse(p: PaymentDetail) {
  const paid = Number(p.paidAmount) || 0;
  const total =
    p.totalAmount != null
      ? Number(p.totalAmount)
      : paid;
  return {
    id: p.id,
    festivalId: p.festivalId,
    familyName:
      p.familyName ||
      (p.user
        ? `${p.user.firstName} ${p.user.lastName || ''}`.trim()
        : p.userId
          ? `User ${p.userId}`
          : 'Unknown'),
    mobileNumber: p.mobileNumber || p.user?.phoneNumber || '',
    paidAmount: paid,
    totalAmount: total,
    paymentType:
      p.paymentType ||
      (p.paymentMethod === PaymentMethod.ONLINE
        ? 'Online'
        : p.paymentMethod === PaymentMethod.CHEQUE
          ? 'Cheque'
          : 'Cash'),
    collectorName: p.collectorName || p.CollectedBy || '',
    createdAt: p.createdAt,
  };
}

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(PaymentDetail)
    private readonly paymentRepository: Repository<PaymentDetail>,
    @InjectRepository(Festival)
    private readonly festivalRepository: Repository<Festival>,
  ) {}

  async create(dto: CreateCollectionDto) {
    const festival = await this.festivalRepository.findOne({
      where: { id: dto.festivalId },
    });
    if (!festival) {
      throw new NotFoundException(
        `Festival with ID ${dto.festivalId} not found`,
      );
    }

    const paidAmount = Math.round(Number(dto.paidAmount) * 100) / 100;
    if (Number.isNaN(paidAmount) || paidAmount <= 0) {
      throw new BadRequestException('paidAmount must be greater than 0');
    }

    const totalAmount = Number(festival.amountPerFamily) || 0;
    const paymentType = dto.paymentType;
    const collectorName = dto.collectorName?.trim() || '';

    const payment = this.paymentRepository.create({
      festivalId: dto.festivalId,
      userId: null,
      familyName: dto.familyName.trim(),
      mobileNumber: dto.mobileNumber.trim(),
      paidAmount,
      totalAmount,
      paymentType,
      paymentMethod: mapPaymentTypeToMethod(paymentType),
      paymentStatus: PaymentStatus.COMPLETED,
      collectorName,
      CollectedBy: collectorName || null,
      paymentDate: new Date(),
    });

    await this.paymentRepository.save(payment);

    return {
      success: true,
      message: 'Payment recorded successfully',
      data: toCollectionResponse(payment),
    };
  }

  async findByFestival(festivalId: number) {
    const festival = await this.festivalRepository.findOne({
      where: { id: festivalId },
    });
    if (!festival) {
      throw new NotFoundException(`Festival with ID ${festivalId} not found`);
    }

    const payments = await this.paymentRepository.find({
      where: { festivalId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'Collections fetched successfully',
      data: payments.map(toCollectionResponse),
    };
  }

  async findOne(id: number) {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }
    return payment;
  }

  async remove(id: number) {
    const payment = await this.findOne(id);
    await this.paymentRepository.softDelete(id);
    return {
      success: true,
      message: 'Collection deleted successfully',
    };
  }
}
