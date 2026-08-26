-- Dedicated organizers table + festival.organizerId mapping
CREATE TABLE IF NOT EXISTS organizers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  "organizationName" VARCHAR(255) NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ NULL
);

ALTER TABLE festival ADD COLUMN IF NOT EXISTS "organizerId" INT NULL;

DO $$ BEGIN
  ALTER TABLE festival
    ADD CONSTRAINT festival_organizer_fk
    FOREIGN KEY ("organizerId") REFERENCES organizers(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_festival_organizer ON festival ("organizerId");
CREATE INDEX IF NOT EXISTS idx_organizers_phone ON organizers ("phoneNumber");
