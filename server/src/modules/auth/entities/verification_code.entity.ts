import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BeforeInsert,
} from 'typeorm';

@Entity('verification_code')
export class VerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  email: string;

  @Column()
  hashedCode: string; // store hashed code for security

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  setExpiryDate() {
    const EXPIRATION_MINUTES = 10;
    this.expiresAt = new Date(Date.now() + EXPIRATION_MINUTES * 60 * 1000);
  }
}
