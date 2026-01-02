using System.Data;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using server.Data;
using server.Models;
using server.Security;

namespace server.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/register", Register);
        app.MapPost("/api/auth/verify-email", VerifyEmail);
        return app;
    }

    private static async Task<IResult> Register([FromBody] RegisterRequest req, IConfiguration cfg)
    {
        if(string.IsNullOrWhiteSpace(req.FirstName)) 
            return Results.BadRequest(new { message = "First name is required." });
        
        if(string.IsNullOrWhiteSpace(req.LastName))
            return Results.BadRequest(new { message = "Last name is required." });

        if(string.IsNullOrWhiteSpace(req.Email))
            return Results.BadRequest(new { message = "Email is required." });
        
        if(!Validators.IsValidEmail(req.Email))
            return Results.BadRequest(new { message = "Invalid email address." });

        var pwErr = Validators.ValidatePassword(req.Password);
        if(pwErr is not null) 
            return Results.BadRequest(new { message = pwErr });

        var email = req.Email.Trim().ToLowerInvariant();
        var first = req.FirstName.Trim();
        var last = req.LastName.Trim();

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);

        await using var conn = Db.Open(cfg);
        
        await using (var check = new SqlCommand("SELECT 1 FROM dbo.Users WHERE Email = @email", conn))
        {
            check.Parameters.Add("@email", SqlDbType.NVarChar, 255).Value = email;
            var exists = await check.ExecuteScalarAsync();
            if(exists is not null)
                return Results.Conflict(new { message = "Email is already registered." });
        }
        
        Guid userId;
        await using (var insertUser = new SqlCommand(@"
            INSERT INTO dbo.Users (Email, PasswordHash)
            OUTPUT INSERTED.Id
            VALUES (@email, @hash);
        ", conn))
        {
            insertUser.Parameters.Add("@email", SqlDbType.NVarChar, 255).Value = email;
            insertUser.Parameters.Add("@hash", SqlDbType.NVarChar, 255).Value = passwordHash;

            userId = (Guid)(await insertUser.ExecuteScalarAsync()
                ?? throw new Exception("Failed to insert user."));
        }
        
        await using (var insertProfile = new SqlCommand(@"
            INSERT INTO dbo.Profiles (UserId, FirstName, LastName, Bio, Gender, Preference)
            VALUES (@uid, @first, @last, NULL, NULL, NULL);
        ", conn))
        {
            insertProfile.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId;
            insertProfile.Parameters.Add("@first", SqlDbType.NVarChar, 50).Value = first;
            insertProfile.Parameters.Add("@last", SqlDbType.NVarChar, 50).Value = last;
            await insertProfile.ExecuteNonQueryAsync();
        }
        
        var token = TokenUtil.GenerateToken();
        var tokenHash = TokenUtil.Sha256(token);
        var expires = DateTime.UtcNow.AddHours(24);

        await using (var insertTok = new SqlCommand(@"
            INSERT INTO dbo.EmailVerificationTokens (UserId, TokenHash, ExpiresAt)
            VALUES (@uid, @hash, @exp);
        ", conn))
        {
            insertTok.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId;
            insertTok.Parameters.Add("@hash", SqlDbType.VarBinary, 32).Value = tokenHash;
            insertTok.Parameters.Add("@exp", SqlDbType.DateTime2).Value = expires;
            await insertTok.ExecuteNonQueryAsync();
        }
        
        var publicBase = cfg["App:PublicBaseUrl"] ?? "http://localhost:5173";
        var link = $"{publicBase}/verify-email?token={Uri.EscapeDataString(token)}";

        await Emailer.SendVerificationAsync(cfg, email, link);

        return Results.Ok(new { ok = true });
    }

    private static async Task<IResult> VerifyEmail([FromBody] VerifyEmailRequest req, IConfiguration cfg)
    {
        if(string.IsNullOrWhiteSpace(req.Token))
            return Results.BadRequest(new { message = "Invalid token." });

        var tokenHash = TokenUtil.Sha256(req.Token);

        await using var conn = Db.Open(cfg);
        
        Guid userId;
        await using (var find = new SqlCommand(@"
            SELECT TOP 1 UserId
            FROM dbo.EmailVerificationTokens
            WHERE TokenHash = @hash
              AND UsedAt IS NULL
              AND ExpiresAt > SYSUTCDATETIME();
        ", conn))
        {
            find.Parameters.Add("@hash", SqlDbType.VarBinary, 32).Value = tokenHash;
            var result = await find.ExecuteScalarAsync();
            if(result is null)
                return Results.BadRequest(new { message = "Invalid or expired token." });
            userId = (Guid)result;
        }
        
        await using var tx = conn.BeginTransaction();

        try
        {
            await using (var updUser = new SqlCommand(@"
                UPDATE dbo.Users
                SET EmailVerified = 1,
                    EmailVerifiedAt = SYSUTCDATETIME()
                WHERE Id = @uid;
            ", conn, tx))
            {
                updUser.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId;
                await updUser.ExecuteNonQueryAsync();
            }

            await using (var updTok = new SqlCommand(@"
                UPDATE dbo.EmailVerificationTokens
                SET UsedAt = SYSUTCDATETIME()
                WHERE TokenHash = @hash;
            ", conn, tx))
            {
                updTok.Parameters.Add("@hash", SqlDbType.VarBinary, 32).Value = tokenHash;
                await updTok.ExecuteNonQueryAsync();
            }

            tx.Commit();
            return Results.Ok(new { ok = true });
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }
}
