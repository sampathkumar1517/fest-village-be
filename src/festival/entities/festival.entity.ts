import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

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

  @CreateDateColumn()
  festivalCreatedAt: Date;

  @UpdateDateColumn()
  festivalUpdatedAt: Date;

  @DeleteDateColumn()
  festivalDeletedAt: Date;
}