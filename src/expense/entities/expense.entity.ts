import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Festival } from '../../festival/entities/festival.entity';
import { ExpenseCategory } from './expense-category.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Festival)
  @JoinColumn({ name: 'festivalId' })
  festival: Festival;

  @Column()
  festivalId: number;

  @ManyToOne(() => ExpenseCategory)
  @JoinColumn({ name: 'categoryId' })
  category: ExpenseCategory;

  @Column()
  categoryId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  expenseDate: Date;

  @Column({ nullable: true })
  description: string;

  // Who spent / recorded this expense (usually organizer)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'recordedByUserId' })
  recordedByUser: User;

  @Column({ nullable: true })
  recordedByUserId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

