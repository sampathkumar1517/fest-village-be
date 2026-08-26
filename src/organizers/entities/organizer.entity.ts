import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Festival } from '../../festival/entities/festival.entity';

@Entity('organizers')
export class Organizer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  organizationName: string | null;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Festival, (festival) => festival.organizer)
  festivals: Festival[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
