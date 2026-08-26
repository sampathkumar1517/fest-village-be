import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Festival } from '../../festival/entities/festival.entity';
import { ExpenseCategory } from './expense-category.entity';
import { User } from '../../users/entities/user.entity';

@Entity('expense')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Festival)
  @JoinColumn({ name: 'festivalId' })
  festival: Festival;

  @Column()
  festivalId: number;

  @ManyToOne(() => ExpenseCategory, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  categoryRelation: ExpenseCategory | null;

  @Column({ type: 'int', nullable: true })
  categoryId: number | null;

  /** Reference-style category string (Food, Flower, Festival Items, ...) */
  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date', nullable: true })
  expenseDate: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'recordedByUserId' })
  recordedByUser: User;

  @Column({ type: 'int', nullable: true })
  recordedByUserId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
