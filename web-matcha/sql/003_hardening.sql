IF NOT EXISTS (
    SELECT 1
    FROM sys.key_constraints
    WHERE [type] = 'UQ'
      AND [name] = 'UQ_Profiles_UserName'
)
BEGIN
    ALTER TABLE dbo.Profiles
    ADD CONSTRAINT UQ_Profiles_UserName UNIQUE (UserName);
END;
