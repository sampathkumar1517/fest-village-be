import { DataSource } from 'typeorm';
import { ExpenseCategory } from '../expense/entities/expense-category.entity';

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Food', description: 'Food and prasadam expenses' },
  { name: 'Flower', description: 'Flower decorations and garlands' },
  { name: 'Festival Items', description: 'Pooja and festival supplies' },
  { name: 'Petrol', description: 'Fuel and transport' },
  { name: 'Dress', description: 'Costume and dress expenses' },
  { name: 'Decoration', description: 'Stage and venue decoration' },
  { name: 'Retail Shop', description: 'Retail purchases' },
  { name: 'Others', description: 'Miscellaneous expenses' },
];

export async function seedExpenseCategories(dataSource: DataSource) {
  const repo = dataSource.getRepository(ExpenseCategory);
  for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
    const existing = await repo.findOne({ where: { name: cat.name } });
    if (!existing) {
      await repo.save(repo.create(cat));
    }
  }
}
