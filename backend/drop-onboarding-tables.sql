-- This script drops the onboarding-related tables
-- Run this script directly in MySQL if the Node.js script doesn't work

-- Use the appropriate database
USE vismotordb;

-- Disable foreign key checks first to avoid dependency issues
SET FOREIGN_KEY_CHECKS = 0;

-- Drop onboarding checklist table
DROP TABLE IF EXISTS onboarding_checklists;

-- Drop onboarding templates table
DROP TABLE IF EXISTS onboarding_templates;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify remaining tables
SHOW TABLES; 