using System.Security.Cryptography;
using System.Text;

namespace server.Security;

public static class TokenUtil
{
    public static string GenerateToken()
    {
        Span<byte> bytes = stackalloc byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Base64UrlEncode(bytes);
    }

    public static byte[] Sha256(string token)
        => SHA256.HashData(Encoding.UTF8.GetBytes(token));

    private static string Base64UrlEncode(ReadOnlySpan<byte> data)
    {
        var s = Convert.ToBase64String(data);
        return s.Replace("+", "-").Replace("/", "_").TrimEnd('=');
    }
}