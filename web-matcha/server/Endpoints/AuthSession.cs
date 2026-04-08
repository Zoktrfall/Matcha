using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace server.Endpoints;

public static class AuthSession
{
    public static Task<Guid?> RequireUserId(HttpContext ctx)
    {
        if (ctx.User?.Identity?.IsAuthenticated != true)
            return Task.FromResult<Guid?>(null);

        var subject =
            ctx.User.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
            ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(subject, out var userId))
            return Task.FromResult<Guid?>(null);

        return Task.FromResult<Guid?>(userId);
    }
}
