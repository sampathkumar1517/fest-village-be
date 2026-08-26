-- Align schema with Village Festival Manager reference model
-- Run manually if DB_SYNC=false, or rely on TypeORM synchronize when DB_SYNC=true

-- payment_detail: family-name collections
ALTER TABLE payment_detail ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE payment_detail ADD COLUMN IF NOT EXISTS "familyName" varchar(255);
ALTER TABLE payment_detail ADD COLUMN IF NOT EXISTS "mobileNumber" varchar(20);
ALTER TABLE payment_detail ADD COLUMN IF NOT EXISTS "totalAmount" numeric(10,2);
ALTER TABLE payment_detail ADD COLUMN IF NOT EXISTS "collectorName" varchar(255);
ALTER TABLE payment_detail ADD COLUMN IF NOT EXISTS "paymentType" varchar(50);

-- Expand payment_method enum with 'online' if using Postgres enum
DO $$ BEGIN
  ALTER TYPE payment_detail_paymentmethod_enum ADD VALUE IF NOT EXISTS 'online';
EXCEPTION WHEN others THEN NULL;
END $$;

-- expense: category string + nullable categoryId
ALTER TABLE expense ALTER COLUMN "categoryId" DROP NOT NULL;
ALTER TABLE expense ADD COLUMN IF NOT EXISTS "category" varchar(100);
ALTER TABLE expense ALTER COLUMN "expenseDate" DROP NOT NULL;

-- feedback: comment column + required rating
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS "comment" text;
ALTER TABLE feedback ALTER COLUMN "fromName" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_detail_festival ON payment_detail ("festivalId");
CREATE INDEX IF NOT EXISTS idx_expense_festival ON expense ("festivalId");
