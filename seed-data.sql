-- ============================================================
--  IronPulse Gym Management System - MySQL Seed Data
-- ============================================================
--  Run this script against the 'ironpulse_gym' database to
--  populate all tables with initial sample data.
--
--  Usage:
--    mysql -u root -p ironpulse_gym < seed-data.sql
--
--  NOTE: The Spring Boot app must be started at least once first
--  so that Hibernate creates all tables (ddl-auto=update).
--  This script uses INSERT IGNORE to avoid duplicates if run
--  multiple times.
-- ============================================================

-- -------------------------------------------------------
--  1. MEMBERSHIP PLANS
-- -------------------------------------------------------
INSERT IGNORE INTO membership_plans (id, name, price, duration) VALUES
  ('plan1', 'Basic Monthly',  50.0,  'Monthly'),
  ('plan2', 'Pro Quarterly',  135.0, 'Quarterly'),
  ('plan3', 'Elite Yearly',   480.0, 'Yearly');

-- Plan benefits (separate table due to @ElementCollection)
INSERT IGNORE INTO plan_benefits (plan_id, benefit) VALUES
  ('plan1', 'Gym Access'),
  ('plan1', 'Locker Room'),
  ('plan2', 'Gym Access'),
  ('plan2', 'Classes'),
  ('plan2', 'Locker Room'),
  ('plan3', 'All Access'),
  ('plan3', 'Personal Trainer'),
  ('plan3', 'Sauna');

-- -------------------------------------------------------
--  2. USERS (base table - JOINED inheritance)
-- -------------------------------------------------------
--  user_type is the discriminator column for JPA inheritance.
--  ADMIN users only have a row here (no subclass table).
--  MEMBER/INSTRUCTOR users have rows here + in their subclass table.
-- -------------------------------------------------------
INSERT IGNORE INTO users (id, name, email, role, avatar, user_type) VALUES
  ('admin1', 'Admin One',      'admin@gym.com', 'ADMIN',      NULL, 'ADMIN'),
  ('inst1',  'John Doe',       'john@gym.com',  'INSTRUCTOR', 'https://picsum.photos/seed/john/100/100', 'INSTRUCTOR'),
  ('inst2',  'Jane Smith',     'jane@gym.com',  'INSTRUCTOR', 'https://picsum.photos/seed/jane/100/100', 'INSTRUCTOR'),
  ('mem1',   'Alice Johnson',  'alice@gym.com', 'MEMBER',     'https://picsum.photos/seed/alice/100/100', 'MEMBER'),
  ('mem2',   'Bob Brown',      'bob@gym.com',   'MEMBER',     'https://picsum.photos/seed/bob/100/100', 'MEMBER');

-- -------------------------------------------------------
--  3. INSTRUCTORS (subclass table)
-- -------------------------------------------------------
INSERT IGNORE INTO instructors (id, specialization, experience, members_count, working_hours) VALUES
  ('inst1', 'Bodybuilding',    '8 years', 15, '08:00 AM - 04:00 PM'),
  ('inst2', 'Yoga & Pilates',  '5 years', 12, '10:00 AM - 06:00 PM');

-- -------------------------------------------------------
--  4. MEMBERS (subclass table)
-- -------------------------------------------------------
INSERT IGNORE INTO members (id, joined_date, plan_id, membership_type, status, instructor_id, qr_code, phone, address) VALUES
  ('mem1', '2024-01-15', 'plan3', 'PREMIUM', 'ACTIVE', 'inst1', 'ALICE-MEM-001', '555-0101', '123 Fitness St'),
  ('mem2', '2024-02-10', 'plan2', 'REGULAR', 'ACTIVE', 'inst2', 'BOB-MEM-002',   '555-0102', '456 Muscle Ave');

-- -------------------------------------------------------
--  5. WORKOUT CLASSES
-- -------------------------------------------------------
INSERT IGNORE INTO workout_classes (id, name, type, trainer_id, schedule, capacity, enrolled_count) VALUES
  ('class1', 'Morning Yoga',    'YOGA',     'inst2', 'Mon, Wed 08:00 AM', 20, 12),
  ('class2', 'Power Strength',  'STRENGTH', 'inst1', 'Tue, Thu 06:00 PM', 15, 15),
  ('class3', 'Zumba Party',     'ZUMBA',    'inst2', 'Fri 05:00 PM',      30, 22);

-- -------------------------------------------------------
--  6. PAYMENTS
-- -------------------------------------------------------
INSERT IGNORE INTO payments (id, member_id, amount, date, status, method, plan_name) VALUES
  ('pay1', 'mem1', 150.0, '2024-03-01', 'PAID',    'ONLINE', 'Elite Yearly'),
  ('pay2', 'mem2', 100.0, '2024-03-05', 'PENDING', 'CARD',   'Pro Quarterly');

-- -------------------------------------------------------
--  7. ATTENDANCE
-- -------------------------------------------------------
INSERT IGNORE INTO attendance (id, user_id, date, check_in, check_out, weight) VALUES
  ('att1', 'mem1', '2024-03-24', '08:00', '10:00', NULL),
  ('att2', 'mem2', '2024-03-24', '09:30', NULL,    NULL);

-- -------------------------------------------------------
--  8. HEALTH RECORDS
-- -------------------------------------------------------
INSERT IGNORE INTO health_records (id, member_id, date, height, weight, working_time, calories_burned) VALUES
  ('h1', 'mem1', '2024-03-20', 165.0, 62.0,  60, 450),
  ('h2', 'mem1', '2024-03-21', 165.0, 61.5,  45, 380),
  ('h3', 'mem1', '2024-03-22', 165.0, 61.8,  75, 520),
  ('h4', 'mem1', '2024-03-23', 165.0, 61.2,  60, 480),
  ('h5', 'mem1', '2024-03-24', 165.0, 61.0,  90, 600);

-- ============================================================
--  Verification: Count rows in each table
-- ============================================================
SELECT 'membership_plans' AS table_name, COUNT(*) AS row_count FROM membership_plans
UNION ALL SELECT 'plan_benefits', COUNT(*) FROM plan_benefits
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'instructors', COUNT(*) FROM instructors
UNION ALL SELECT 'members', COUNT(*) FROM members
UNION ALL SELECT 'workout_classes', COUNT(*) FROM workout_classes
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'attendance', COUNT(*) FROM attendance
UNION ALL SELECT 'health_records', COUNT(*) FROM health_records;
