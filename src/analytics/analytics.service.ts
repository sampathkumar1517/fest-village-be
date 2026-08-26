import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentDetail } from '../payment-detail/entities/payment-detail.entity';
import { Expense } from '../expense/entities/expense.entity';
import { ExpenseCategory } from '../expense/entities/expense-category.entity';
import { Festival } from '../festival/entities/festival.entity';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(PaymentDetail)
    private readonly paymentRepo: Repository<PaymentDetail>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(ExpenseCategory)
    private readonly categoryRepo: Repository<ExpenseCategory>,
    @InjectRepository(Festival)
    private readonly festivalRepo: Repository<Festival>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  // Summary for a single festival: total collected, total expenses, balance
  async getFestivalSummary(festivalId: number) {
    const festival = await this.festivalRepo.findOne({
      where: { id: festivalId },
    });

    if (!festival) {
      return null;
    }

    const collectedRaw = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('SUM(payment.paidAmount)', 'total')
      .where('payment.festivalId = :festivalId', { festivalId })
      .andWhere('payment.paymentStatus = :status', { status: 'completed' })
      .getRawOne();

    const expensesRaw = await this.expenseRepo
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.festivalId = :festivalId', { festivalId })
      .getRawOne();

    const totalCollected = parseFloat(collectedRaw?.total || '0');
    const totalExpenses = parseFloat(expensesRaw?.total || '0');
    const balance = totalCollected - totalExpenses;

    return {
      festival,
      totalCollected,
      totalExpenses,
      balance,
    };
  }

  // Comparison between two festivals (for analytics comparison charts)
  async compareFestivals(festivalIdA: number, festivalIdB: number) {
    const summaryA = await this.getFestivalSummary(festivalIdA);
    const summaryB = await this.getFestivalSummary(festivalIdB);

    return {
      festivalA: summaryA,
      festivalB: summaryB,
    };
  }

  // Per-family view for a festival: paid, balance
  async getFamilyCollectionView(festivalId: number) {
    const payments = await this.paymentRepo.find({
      where: { festivalId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    const festival = await this.festivalRepo.findOne({
      where: { id: festivalId },
    });
    const perFamilyAmount = festival?.amountPerFamily || 0;

    const byFamily = new Map<
      string,
      { familyName: string; phoneNumber: string; totalPaid: number; userId: number | null }
    >();

    for (const p of payments) {
      const key = p.userId != null ? `u-${p.userId}` : `f-${p.familyName || p.id}`;
      const existing = byFamily.get(key) || {
        familyName:
          p.familyName ||
          (p.user
            ? `${p.user.firstName} ${p.user.lastName || ''}`.trim()
            : p.userId
              ? `User ${p.userId}`
              : 'Unknown'),
        phoneNumber: p.mobileNumber || p.user?.phoneNumber || '',
        totalPaid: 0,
        userId: p.userId,
      };
      existing.totalPaid += Number(p.paidAmount);
      byFamily.set(key, existing);
    }

    return Array.from(byFamily.values()).map((info) => ({
      userId: info.userId,
      familyName: info.familyName,
      phoneNumber: info.phoneNumber,
      paidAmount: info.totalPaid,
      balanceAmount: perFamilyAmount - info.totalPaid,
    }));
  }

  // Enhanced analytics with expenses by category, payment methods, etc.
  async getDetailedAnalytics(festivalId: number) {
    const festival = await this.festivalRepo.findOne({
      where: { id: festivalId },
    });

    if (!festival) {
      return null;
    }

    // Total collected (completed payments only)
    const collectedRaw = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('SUM(payment.paidAmount)', 'total')
      .where('payment.festivalId = :festivalId', { festivalId })
      .andWhere('payment.paymentStatus = :status', { status: 'completed' })
      .getRawOne();

    const totalCollected = parseFloat(collectedRaw?.total || '0');

    // Total expenses
    const expensesRaw = await this.expenseRepo
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.festivalId = :festivalId', { festivalId })
      .getRawOne();

    const totalExpenses = parseFloat(expensesRaw?.total || '0');
    const balance = totalCollected - totalExpenses;

    // Expenses by category
    const expensesByCategory = await this.expenseRepo
      .createQueryBuilder('expense')
      .leftJoin('expense.categoryRelation', 'category')
      .select(
        'COALESCE(expense.category, category.name, \'Others\')',
        'categoryName',
      )
      .addSelect('SUM(expense.amount)', 'total')
      .where('expense.festivalId = :festivalId', { festivalId })
      .groupBy('COALESCE(expense.category, category.name, \'Others\')')
      .getRawMany();

    // Payments by method
    const paymentsByMethod = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('payment.paymentMethod', 'method')
      .addSelect('COUNT(payment.id)', 'count')
      .addSelect('SUM(payment.paidAmount)', 'total')
      .where('payment.festivalId = :festivalId', { festivalId })
      .andWhere('payment.paymentStatus = :status', { status: 'completed' })
      .groupBy('payment.paymentMethod')
      .getRawMany();

    // Payment status breakdown
    const paymentStatusBreakdown = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('payment.paymentStatus', 'status')
      .addSelect('COUNT(payment.id)', 'count')
      .addSelect('SUM(payment.paidAmount)', 'total')
      .where('payment.festivalId = :festivalId', { festivalId })
      .groupBy('payment.paymentStatus')
      .getRawMany();

    // Events count
    const eventsCount = await this.eventRepo.count({
      where: { festivalId },
    });

    // Total families (users who made payments)
    const totalFamilies = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('COUNT(DISTINCT payment.userId)', 'count')
      .where('payment.festivalId = :festivalId', { festivalId })
      .getRawOne();

    return {
      festival: {
        id: festival.id,
        name: festival.festivalName,
        amountPerFamily: festival.amountPerFamily,
        collectionStartDate: festival.collectionStartDate,
        festivalEndDate: festival.festivalEndDate,
      },
      summary: {
        totalCollected,
        totalExpenses,
        balance,
        totalFamilies: parseInt(totalFamilies?.count || '0'),
        eventsCount,
      },
      expensesByCategory: expensesByCategory.map((item) => ({
        category: item.categoryName,
        amount: parseFloat(item.total || '0'),
      })),
      paymentsByMethod: paymentsByMethod.map((item) => ({
        method: item.method,
        count: parseInt(item.count || '0'),
        total: parseFloat(item.total || '0'),
      })),
      paymentStatusBreakdown: paymentStatusBreakdown.map((item) => ({
        status: item.status,
        count: parseInt(item.count || '0'),
        total: parseFloat(item.total || '0'),
      })),
    };
  }
}
