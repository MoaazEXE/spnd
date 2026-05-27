-- Run this ONCE in the Supabase SQL editor AFTER running `npx prisma db push`.
-- It backfills username + onboardingCompletedAt for all existing users so they
-- skip onboarding and go straight to the dashboard.

DO $$
DECLARE
  r         RECORD;
  base      TEXT;
  candidate TEXT;
  suffix    INT;
BEGIN
  FOR r IN SELECT id, email FROM "User" WHERE username IS NULL LOOP
    -- Derive base from email local-part: lowercase, strip non-alphanumeric, max 20 chars
    base := lower(regexp_replace(split_part(r.email, '@', 1), '[^a-z0-9_]', '', 'g'));
    base := substring(base, 1, 20);
    -- Strip leading underscores / digits
    base := regexp_replace(base, '^[_0-9]+', '');
    -- Ensure minimum length
    IF length(base) < 3 THEN
      base := 'user' || substring(replace(r.id::text, '-', ''), 1, 6);
    END IF;

    -- Find a unique candidate (add numeric suffix on collision)
    candidate := base;
    suffix    := 1;
    WHILE EXISTS (
      SELECT 1 FROM "User" WHERE "usernameLower" = candidate
    ) LOOP
      candidate := substring(base, 1, 17) || '_' || suffix;
      suffix    := suffix + 1;
    END LOOP;

    UPDATE "User"
    SET
      username              = candidate,
      "usernameLower"       = candidate,
      "onboardingCompletedAt" = now()
    WHERE id = r.id;
  END LOOP;
END $$;
