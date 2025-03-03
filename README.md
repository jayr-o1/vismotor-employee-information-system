CREATE DATABASE VismotorDB;
USE VismotorDB;

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing primary key
    firstName NVARCHAR(50) NOT NULL, -- First name
    lastName NVARCHAR(50) NOT NULL, -- Last name
    username NVARCHAR(50) NOT NULL UNIQUE, -- Unique username
    email NVARCHAR(100) NOT NULL UNIQUE, -- Unique email
    password NVARCHAR(255) NOT NULL, -- Hashed password
    createdAt DATETIME DEFAULT GETDATE(), -- Timestamp for account creation
    isVerified BIT DEFAULT 0, -- 0 = not verified, 1 = verified
    verificationToken NVARCHAR(255), -- Token for email verification
    verificationTokenExpires DATETIME, -- Expiration time for verification token
    resetToken NVARCHAR(255), -- Token for password reset
    resetTokenExpires DATETIME -- Expiration time for password reset
);
