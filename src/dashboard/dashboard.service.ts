import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentDetail } from '../payment-detail/entities/payment-detail.entity';
import { Expense } from '../expense/entities/expense.entity';
import { Festival } from '../festival/entities/festival.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PaymentDetail)
    private readonly paymentRepo: Repository<PaymentDetail>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(Festival)
    private readonly festivalRepo: Repository<Festival>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * GET /dashboard/summary?festivalId=<id>
   *
   * Returns:
   *  - totalCollection  (sum of ALL paidAmounts for the festival)
   *  - completedCollection (sum of COMPLETED payments)
   *  - totalExpenses
   *  - balance (completedCollection - totalExpenses)
   *  - totalMembers (registered users / families)
   *  - totalFamiliesPaid
   *  - pendingFamilies (those who have NOT paid yet)
   *  - festival info
   */
  async getSummary(festivalId: number) {
    const festival = await this.festivalRepo.findOne({
      where: { id: festivalId },
    });

    if (!festival) {
      throw new NotFoundException(`Festival with ID ${festivalId} not found`);
    }

    // --- Collection totals ---
    const totalCollectionRaw = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('SUM(payment.paidAmount)', 'total')
      .where('payment.festivalId = :festivalId', { festivalId })
      .getRawOne();

    const completedCollectionRaw = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('SUM(payment.paidAmount)', 'total')
      .where('payment.festivalId = :festivalId', { festivalId })
      .andWhere('payment.paymentStatus = :status', { status: 'completed' })
      .getRawOne();

    // --- Expense total ---
    const totalExpensesRaw = await this.expenseRepo
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.festivalId = :festivalId', { festivalId })
      .getRawOne();

    // --- Family counts ---
    const totalMembersRaw = await this.userRepo
      .createQueryBuilder('user')
      .select('COUNT(user.id)', 'count')
      .where('user.isActive = true')
      .getRawOne();

    const familiesPaidRaw = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('COUNT(DISTINCT payment.userId)', 'count')
      .where('payment.festivalId = :festivalId', { festivalId })
      .getRawOne();

    const totalCollection = parseFloat(totalCollectionRaw?.total || '0');
    const completedCollection = parseFloat(
      completedCollectionRaw?.total || '0',
    );
    const totalExpenses = parseFloat(totalExpensesRaw?.total || '0');
    const balance = completedCollection - totalExpenses;
    const totalMembers = parseInt(totalMembersRaw?.count || '0');
    const familiesPaid = parseInt(familiesPaidRaw?.count || '0');

    return {
      success: true,
      data: {
        festival: {
          id: festival.id,
          name: festival.festivalName,
          amountPerFamily: festival.amountPerFamily,
          collectionStartDate: festival.collectionStartDate,
          festivalEndDate: festival.festivalEndDate,
          isActive: festival.isActive,
          organizerName: festival.organizerName,
          inchargeName: festival.InchargeName,
        },
        collection: {
          totalCollection,
          completedCollection,
          pendingCollection: totalCollection - completedCollection,
        },
        expenses: {
          totalExpenses,
        },
        balance,
        families: {
          totalMembers,
          familiesPaid,
          pendingFamilies: Math.max(totalMembers - familiesPaid, 0),
        },
      },
    };
  }

  /**
   * GET /dashboard/overview
   * Cross-festival overview: active festival summary + member count.
   */
  async getOverview() {
    const activeFestival = await this.festivalRepo.findOne({
      where: { isActive: true },
      order: { festivalCreatedAt: 'DESC' },
    });

    const totalFestivals = await this.festivalRepo.count();
    const totalMembers = await this.userRepo.count({ where: { isActive: true } });

    if (!activeFestival) {
      return {
        success: true,
        data: {
          totalFestivals,
          totalMembers,
          activeFestival: null,
          collection: null,
          expenses: null,
          balance: 0,
        },
      };
    }

    const summary = await this.getSummary(activeFestival.id);

    return {
      success: true,
      data: {
        totalFestivals,
        totalMembers,
        activeFestival: summary.data.festival,
        collection: summary.data.collection,
        expenses: summary.data.expenses,
        balance: summary.data.balance,
        families: summary.data.families,
      },
    };
  }
}
