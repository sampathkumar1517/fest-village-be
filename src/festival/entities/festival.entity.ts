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
import { Organizer } from '../../organizers/entities/organizer.entity';

@Entity()
export class Festival {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  festivalName: string;

  @Column()
  amountPerFamily: number;

  @Column()
  collectionStartDate: Date;

  @Column()
  festivalEndDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  organizerName: string;

  @Column()
  InchargeName: string;

  /** FK to organizers table — who owns this festival */
  @Column({ type: 'int', nullable: true })
  organizerId: number | null;

  @ManyToOne(() => Organizer, (organizer) => organizer.festivals, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'organizerId' })
  organizer: Organizer | null;

  /** Legacy user-owner column (kept nullable for migration compatibility) */
  @Column({ type: 'int', nullable: true })
  ownerUserId: number | null;

  @CreateDateColumn()
  festivalCreatedAt: Date;

  @UpdateDateColumn()
  festivalUpdatedAt: Date;

  @DeleteDateColumn()
  festivalDeletedAt: Date;
}
