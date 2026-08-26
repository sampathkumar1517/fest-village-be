import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Festival } from '../../festival/entities/festival.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  ONLINE = 'online',
  CHEQUE = 'cheque',
  UPI = 'upi',
  BANK_TRANSFER = 'bank_transfer',
}

@Entity('payment_detail')
export class PaymentDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.paymentDetails, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @Index()
  @ManyToOne(() => Festival)
  @JoinColumn({ name: 'festivalId' })
  festival: Festival;

  @Column()
  festivalId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  familyName: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobileNumber: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  paidAmount: number;

  /** Per-family expected amount copied from festival at insert time */
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  totalAmount: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  CollectedBy: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  collectorName: string | null;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.COMPLETED,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  /** Display label matching reference: Cash | Online | Cheque */
  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentType: string | null;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
