SET NOCOUNT ON;

BEGIN TRY
BEGIN TRAN;
    ;WITH SeedTags(Name, Normalized) AS (
    SELECT N'#geek',        N'geek' UNION ALL
    SELECT N'#coder',       N'coder' UNION ALL
    SELECT N'#gaming',      N'gaming' UNION ALL
    SELECT N'#anime',       N'anime' UNION ALL
    SELECT N'#movies',      N'movies' UNION ALL
    SELECT N'#music',       N'music' UNION ALL
    SELECT N'#travel',      N'travel' UNION ALL
    SELECT N'#hiking',      N'hiking' UNION ALL
    SELECT N'#fitness',     N'fitness' UNION ALL
    SELECT N'#yoga',        N'yoga' UNION ALL
    SELECT N'#football',    N'football' UNION ALL
    SELECT N'#basketball',  N'basketball' UNION ALL
    SELECT N'#coffee',      N'coffee' UNION ALL
    SELECT N'#tea',         N'tea' UNION ALL
    SELECT N'#foodie',      N'foodie' UNION ALL
    SELECT N'#vegan',       N'vegan' UNION ALL
    SELECT N'#books',       N'books' UNION ALL
    SELECT N'#art',         N'art' UNION ALL
    SELECT N'#photography', N'photography' UNION ALL
    SELECT N'#pets',        N'pets' UNION ALL
    SELECT N'#cats',        N'cats' UNION ALL
    SELECT N'#dogs',        N'dogs' UNION ALL
    SELECT N'#piercing',    N'piercing' UNION ALL
    SELECT N'#tattoos',     N'tattoos' UNION ALL
    SELECT N'#nightowl',    N'nightowl'
)
INSERT INTO dbo.Tags (Name, Normalized)
SELECT s.Name, s.Normalized
FROM SeedTags s
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Tags t WHERE t.Normalized = s.Normalized
);

COMMIT TRAN;
END TRY
BEGIN CATCH
IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH;