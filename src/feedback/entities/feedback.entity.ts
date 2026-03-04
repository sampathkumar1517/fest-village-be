import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  festivalId: number;

  @Column()
  fromName: string; // who is giving feedback

  @Column({ nullable: true })
  fromPhone: string;

  @Column({ nullable: true })
  fromRole: string; // e.g. organizer, incharge, family

  @Column({ type: 'int', nullable: true })
  rating: number; // 1-5 rating for the system / app

  @Column({ type: 'text', nullable: true })
  comments: string;

  @CreateDateColumn()
  createdAt: Date;
}

