import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { PaymentDetail } from '../../payment-detail/entities/payment-detail.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  address: string;

  @Column()
  houseNumber: string;

  @Column()
  password: string;


  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => PaymentDetail, (paymentDetail) => paymentDetail.user)
  paymentDetails: PaymentDetail[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
