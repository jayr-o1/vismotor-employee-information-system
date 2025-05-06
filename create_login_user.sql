-- SQL script to update or create a root user with password 1234
-- Run this in your database 

-- First, see if root user exists
SELECT id, name, email, role, is_verified FROM users
WHERE email = 'root';

-- If the user exists, update the password
UPDATE users 
SET password = '$2a$10$3QTEkdlhHnlDLAYlJLpUHujBqdNm8GqxwLxdLnIHU9ir9z9mVlPgm',  -- bcrypt hash for '1234' with bcryptjs
    is_verified = 1
WHERE email = 'root';

-- If the user doesn't exist, create it
INSERT INTO users (name, email, password, role, is_verified, created_at, updated_at)
SELECT 'Root Admin', 'root', '$2a$10$3QTEkdlhHnlDLAYlJLpUHujBqdNm8GqxwLxdLnIHU9ir9z9mVlPgm', 'it_admin', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'root');

-- Create an alternative admin user for testing
INSERT INTO users (name, email, password, role, is_verified, created_at, updated_at)
VALUES (
    'Admin User',
    'admin@vismotor.com',
    '$2a$10$3QTEkdlhHnlDLAYlJLpUHujBqdNm8GqxwLxdLnIHU9ir9z9mVlPgm', -- bcrypt hash for '1234'
    'it_admin',
    1,  -- is_verified = true
    NOW(),
    NOW()
);

-- View users after update
SELECT id, name, email, role, is_verified FROM users 
WHERE email IN ('root', 'admin@vismotor.com');

-- After running this script, try logging in with:
-- Email: root
-- Password: 1234
-- OR
-- Email: admin@vismotor.com
-- Password: 1234 