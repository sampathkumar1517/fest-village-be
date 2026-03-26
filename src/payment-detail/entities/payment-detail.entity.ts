import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
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
  UPI = 'upi',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
}

@Entity()
export class PaymentDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.paymentDetails)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Festival)
  @JoinColumn({ name: 'festivalId' })
  festival: Festival;

  @Column()
  festivalId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  paidAmount: number;

  // Who collected the amount (collector / incharge)

  @Column({ nullable: true })
  CollectedBy: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;



  @Column()
  paymentDate: Date;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
