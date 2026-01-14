// feedback.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { MailService } from '../auth/mail/mail.service';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepo: Repository<Feedback>,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateFeedbackDto): Promise<Feedback> {
    const feedback = this.feedbackRepo.create(dto);
    const savedFeedback = await this.feedbackRepo.save(feedback);

    // Send email async (non-blocking)
    this.mailService
      .sendFeedbackEmailToAdmin(savedFeedback)
      .catch((err) => console.error('Email failed:', err));

    return savedFeedback;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Feedback[]; total: number }> {
    const [data, total] = await this.feedbackRepo.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Feedback> {
    const feedback = await this.feedbackRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback ${id} not found`);
    }

    return feedback;
  }

  async update(id: string, dto: UpdateFeedbackDto): Promise<Feedback> {
    const feedback = await this.findOne(id);
    Object.assign(feedback, dto);
    return await this.feedbackRepo.save(feedback);
  }

  async remove(id: string): Promise<void> {
    const result = await this.feedbackRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Feedback ${id} not found`);
    }
  }

  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Feedback[]; total: number }> {
    const [data, total] = await this.feedbackRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async getStats(): Promise<any> {
    const allFeedback = await this.feedbackRepo.find();
    const total = allFeedback.length;

    const ratings = allFeedback
      .map((f) => f.rating)
      .filter((r) => r !== null) as number[];

    const averageRating =
      ratings.length > 0
        ? Number(
            (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2),
          )
        : null;

    return {
      total,
      withRating: ratings.length,
      averageRating,
    };
  }
}
