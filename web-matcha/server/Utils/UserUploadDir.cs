using Microsoft.AspNetCore.Hosting;

namespace server.Utils;

public class UserUploadDir
{
    public static string GetUserUploadDir(IWebHostEnvironment env, Guid userId)
    {
        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var dir = Path.Combine(webRoot, "uploads", userId.ToString());
        Directory.CreateDirectory(dir);
        return dir;
    }
}