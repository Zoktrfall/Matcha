CREATE TABLE dbo.Users (
    Id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_Users PRIMARY KEY
        CONSTRAINT DF_Users_Id DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL
        CONSTRAINT UQ_Users_Email UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME2 NOT NULL
        CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    EmailVerified BIT NOT NULL
        CONSTRAINT DF_Users_EmailVerified DEFAULT (0),
    EmailVerifiedAt DATETIME2 NULL
);

CREATE TABLE dbo.Profiles (
    UserId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    UserName NVARCHAR(50) NOT NULL,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,w
    Bio NVARCHAR(500) NULL,
    Gender NVARCHAR(50) NULL,
    Preference NVARCHAR(50) NULL,
    CONSTRAINT FK_Profiles_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
);

CREATE TABLE dbo.Sessions (
    Id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    TokenHash NVARCHAR(255) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Sessions_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
);

CREATE INDEX IX_Sessions_UserId ON dbo.Sessions(UserId);
CREATE INDEX IX_Sessions_ExpiresAt ON dbo.Sessions(ExpiresAt);

CREATE TABLE dbo.EmailVerificationTokens (
    Id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_EmailVerificationTokens PRIMARY KEY
        CONSTRAINT DF_EmailVerificationTokens_Id DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    TokenHash VARBINARY(32) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    UsedAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL
    CONSTRAINT DF_EmailVerificationTokens_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_EVT_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id),
    CONSTRAINT UQ_EVT_TokenHash UNIQUE (TokenHash)
);

CREATE INDEX IX_EVT_UserId ON dbo.EmailVerificationTokens(UserId);
CREATE INDEX IX_EVT_ExpiresAt ON dbo.EmailVerificationTokens(ExpiresAt);

CREATE TABLE dbo.PasswordResetTokens (
    Id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    TokenHash VARBINARY(32) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    UsedAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_PasswordResetTokens_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
);

CREATE INDEX IX_PasswordResetTokens_UserId ON dbo.PasswordResetTokens(UserId);
CREATE INDEX IX_PasswordResetTokens_ExpiresAt ON dbo.PasswordResetTokens(ExpiresAt);
CREATE INDEX IX_PasswordResetTokens_TokenHash ON dbo.PasswordResetTokens(TokenHash);