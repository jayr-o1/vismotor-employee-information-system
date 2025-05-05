-- Use the vismotordb database
USE vismotordb;

-- Disable foreign key checks to avoid dependency issues
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables with foreign key references first
DROP TABLE IF EXISTS employee_documents;
DROP TABLE IF EXISTS employee_equipment;
DROP TABLE IF EXISTS employee_training;

-- Then drop reference tables
DROP TABLE IF EXISTS document_types;
DROP TABLE IF EXISTS equipment_types;
DROP TABLE IF EXISTS training_types;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Show remaining tables
SHOW TABLES; 