-- Festival ownership + festival-scoped admins
ALTER TABLE festival ADD COLUMN IF NOT EXISTS "ownerUserId" INT NULL;
DO $$ BEGIN
  ALTER TABLE festival
    ADD CONSTRAINT festival_owner_user_fk
    FOREIGN KEY ("ownerUserId") REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS festival_admin (
  id SERIAL PRIMARY KEY,
  "festivalId" INT NOT NULL REFERENCES festival(id) ON DELETE CASCADE,
  "userId" INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "assignedByUserId" INT NULL REFERENCES users(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE ("festivalId", "userId")
);

CREATE INDEX IF NOT EXISTS idx_festival_admin_user ON festival_admin ("userId");
CREATE INDEX IF NOT EXISTS idx_festival_admin_festival ON festival_admin ("festivalId");
CREATE INDEX IF NOT EXISTS idx_festival_owner ON festival ("ownerUserId");
