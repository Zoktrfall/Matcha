using server.Data;
using Microsoft.Data.SqlClient;
using System.Data;

namespace server.Endpoints;

public static class AuthSession
{
    public static async Task<Guid?> RequireUserId(HttpContext ctx, IConfiguration cfg)
    {
        
        var token = ctx.Request.Cookies["matcha_session"];
        if(string.IsNullOrWhiteSpace(token)) 
            return null;
        
        var tokenHash = server.Security.TokenUtil.Sha256(token);

        await using var conn = Db.Open(cfg);
        await using var cmd = new SqlCommand(@"
            SELECT TOP 1 UserId
            FROM dbo.Sessions
            WHERE TokenHash = @hash AND ExpiresAt > SYSUTCDATETIME();
        ", conn);

        cmd.Parameters.Add("@hash", SqlDbType.VarBinary, 32).Value = tokenHash;
        var val = await cmd.ExecuteScalarAsync();
        return val is null ? null : (Guid)val;
    }
}
