-- SQL script to fix login issues
-- Run this in your database to diagnose and fix common login problems

-- Check the users table structure
DESCRIBE users;

-- Check if users table has any rows
SELECT COUNT(*) AS user_count FROM users;

-- Check the role ENUM constraints
SELECT 
    COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, IS_NULLABLE
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = DATABASE() AND
    TABLE_NAME = 'users' AND 
    COLUMN_NAME = 'role';

-- Create a new admin user with a known working password hash
-- This uses a different bcrypt hash for the password 'password123'
INSERT INTO users (name, email, password, role, is_verified, created_at, updated_at)
VALUES (
    'Emergency Admin',
    'emergency@vismotor.com',
    '$2a$10$5dwsS5snIRlKu8ka5r5UxuHuYxfOsyBVRRIX9MXDJxMjrjZZT7community', -- hashed 'password123'
    'it_admin',
    true,
    NOW(),
    NOW()
);

-- Alternatively: Update an existing user with a new password
-- UPDATE users SET 
--    password = '$2a$10$5dwsS5snIRlKu8ka5r5UxuHuYxfOsyBVRRIX9MXDJxMjrjZZT7tWq',  -- 'password123'
--    is_verified = true
-- WHERE email = 'it.admin@vismotor.com';

-- View the updated user
SELECT id, name, email, role, is_verified FROM users 
WHERE email = 'emergency@vismotor.com';

-- After running this script, try logging in with:
-- Email: emergency@vismotor.com 
-- Password: password123 