CREATE DATABASE VismotorDB;
USE VismotorDB;

CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  isVerified BOOLEAN DEFAULT 0, -- Ensure this column exists
  verificationToken VARCHAR(255),
  verificationTokenExpires DATETIME,
  resetToken VARCHAR(255),
  resetTokenExpires DATETIME
);
