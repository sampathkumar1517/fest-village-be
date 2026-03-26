import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Festival } from '../festival/entities/festival.entity';
import { PaymentDetail } from '../payment-detail/entities/payment-detail.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Festival)
    private festivalRepository: Repository<Festival>,
    @InjectRepository(PaymentDetail)
    private paymentRepository: Repository<PaymentDetail>,
  ) {}

  // Generate summary message for a family
  async generateFestivalSummary(festivalId: number, userId: number) {
    const festival = await this.festivalRepository.findOne({
      where: { id: festivalId },
    });

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!festival || !user) {
      return null;
    }

    const payments = await this.paymentRepository.find({
      where: { festivalId, userId },
      relations: ['festival'],
    });

    const totalPaid = payments.reduce(
      (sum, p) => sum + Number(p.paidAmount),
      0,
    );
    const balance = festival.amountPerFamily - totalPaid;

    const summary = `
🎉 Festival Summary - ${festival.festivalName}

👤 Family: ${user.firstName} ${user.lastName}
📱 Phone: ${user.phoneNumber}
🏠 House: ${user.houseNumber}

💰 Payment Details:
   - Amount Per Family: ₹${festival.amountPerFamily}
   - Total Paid: ₹${totalPaid}
   - Balance: ₹${balance}

📅 Festival Dates:
   - Collection Start: ${new Date(festival.collectionStartDate).toLocaleDateString()}
   - Festival End: ${new Date(festival.festivalEndDate).toLocaleDateString()}

Thank you for your contribution!
    `.trim();

    return {
      phoneNumber: user.phoneNumber,
      message: summary,
      festivalId,
      userId,
    };
  }

  // Generate summary for all families in a festival
  async generateAllSummaries(festivalId: number) {
    const payments = await this.paymentRepository.find({
      where: { festivalId },
      relations: ['user', 'festival'],
    });

    const byUser = new Map<number, any[]>();
    for (const p of payments) {
      if (!byUser.has(p.userId)) {
        byUser.set(p.userId, []);
      }
      byUser.get(p.userId)!.push(p);
    }

    const summaries: Array<{
      phoneNumber: string;
      message: string;
      festivalId: number;
      userId: number;
    }> = [];
    for (const [userId, userPayments] of byUser.entries()) {
      const summary = await this.generateFestivalSummary(festivalId, userId);
      if (summary) {
        summaries.push(summary);
      }
    }

    return summaries;
  }

  // This method can be extended to integrate with SMS/WhatsApp APIs
  // For now, it returns the message content that can be sent via external service
  async sendSummary(festivalId: number, userId: number) {
    const summary = await this.generateFestivalSummary(festivalId, userId);
    if (!summary) {
      return { success: false, message: 'Summary not found' };
    }

    // TODO: Integrate with SMS/WhatsApp service (Twilio, AWS SNS, etc.)
    // For now, return the message content
    return {
      success: true,
      message: 'Summary generated',
      data: summary,
      // In production, you would call SMS/WhatsApp API here
      // await this.smsService.send(summary.phoneNumber, summary.message);
    };
  }
}
