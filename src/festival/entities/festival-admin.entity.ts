import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Festival } from '../../festival/entities/festival.entity';
import { User } from '../../users/entities/user.entity';

@Entity('festival_admin')
@Unique(['festivalId', 'userId'])
export class FestivalAdmin {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'int' })
  festivalId: number;

  @ManyToOne(() => Festival, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'festivalId' })
  festival: Festival;

  @Index()
  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', nullable: true })
  assignedByUserId: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
