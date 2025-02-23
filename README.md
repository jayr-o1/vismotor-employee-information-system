CREATE DATABASE VismotorDB;
USE VismotorDB;

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing primary key
    username NVARCHAR(50) NOT NULL UNIQUE, -- Unique username
    password NVARCHAR(255) NOT NULL, -- Hashed password
    createdAt DATETIME DEFAULT GETDATE(), -- Timestamp for account creation
	  isVerified BIT DEFAULT 0, -- 0 = not verified, 1 = verified
    verificationCode NVARCHAR(6), -- 6-digit verification code
    verificationCodeExpires DATETIME, -- Expiration time for verification code
    passwordResetCode NVARCHAR(6), -- 6-digit password reset code
    passwordResetExpires DATETIME -- Expiration time for password reset code
);
