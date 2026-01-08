using System.Data;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using server.Data;
using server.Models;

namespace server.Endpoints;

public static class ProfileEndpoints
{
    public static void MapProfileEndpoints(this WebApplication app)
    {
        var g = app.MapGroup("/api").WithTags("Profile");

        g.MapGet("/me", GetMe);
        g.MapPut("/profile", UpdateProfile);

        g.MapGet("/tags", SearchTags);
        g.MapPost("/tags/attach", AttachTags);
        g.MapDelete("/tags/detach", DetachTag);

        g.MapGet("/photos", GetPhotos);
        g.MapPost("/photos", UploadPhoto);
        g.MapPut("/photos/{photoId:guid}/primary", SetPrimaryPhoto);
        g.MapDelete("/photos/{photoId:guid}", DeletePhoto);
    }
    
    private static async Task<IResult> GetMe(HttpContext ctx, IConfiguration cfg)
    {
        var userId = await AuthSession.RequireUserId(ctx, cfg);
        if(userId is null) 
            return Results.Unauthorized();

        await using var conn = Db.Open(cfg);
        
        string? gender = null, preference = null, bio = null, firstName = null, lastName = null, username = null;
        await using (var cmd = new SqlCommand(@"
            SELECT p.FirstName, p.LastName, p.Username, p.Gender, p.Preference, p.Bio
            FROM dbo.Profiles p
            WHERE p.UserId = @uid;
        ", conn))
        {
            cmd.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;

            await using var r = await cmd.ExecuteReaderAsync();
            if(await r.ReadAsync())
            {
                firstName = r["FirstName"] as string;
                lastName = r["LastName"] as string;
                username = r["Username"] as string;
                gender = r["Gender"] as string;
                preference = r["Preference"] as string;
                bio = r["Bio"] as string;
            }
        }
        
        var tags = new List<string>();
        await using (var cmd = new SqlCommand(@"
            SELECT t.Name
            FROM dbo.UserTags ut
            JOIN dbo.Tags t ON t.Id = ut.TagId
            WHERE ut.UserId = @uid
            ORDER BY t.Name;
        ", conn))
        {
            cmd.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;
            await using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync())
                tags.Add((string)r["Name"]);
        }
        
        var photos = new List<object>();
        int photoCount = 0;
        bool hasPrimary = false;

        await using (var cmd = new SqlCommand(@"
            SELECT Id, Url, IsPrimary, SortOrder
            FROM dbo.UserPhotos
            WHERE UserId = @uid
            ORDER BY IsPrimary DESC, SortOrder ASC, CreatedAt ASC;
        ", conn))
        {
            cmd.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;
            await using var r = await cmd.ExecuteReaderAsync();
            while (await r.ReadAsync())
            {
                photoCount++;
                var isPrimary = (bool)r["IsPrimary"];
                if (isPrimary) hasPrimary = true;

                photos.Add(new
                {
                    id = (Guid)r["Id"],
                    url = (string)r["Url"],
                    isPrimary,
                    sortOrder = (int)r["SortOrder"]
                });
            }
        }
        
        bool basicsOk =
            !string.IsNullOrWhiteSpace(gender) &&
            !string.IsNullOrWhiteSpace(preference) &&
            !string.IsNullOrWhiteSpace(bio) &&
            bio!.Trim().Length >= 10;

        bool tagsOk = tags.Count >= 1;
        bool photosOk = photoCount >= 1 && hasPrimary;

        bool isProfileComplete = basicsOk && tagsOk && photosOk;

        return Results.Ok(new
        {
            userId,
            profile = new { firstName, lastName, username, gender, preference, bio },
            tags,
            photos,
            isProfileComplete
        });
    }

    private static async Task<IResult> UpdateProfile(
        HttpContext ctx,
        [FromBody] UpdateProfileRequest req,
        IConfiguration cfg)
    {
        var userId = await AuthSession.RequireUserId(ctx, cfg);
        if(userId is null) 
            return Results.Unauthorized();

        var gender = (req.Gender ?? "").Trim();
        var pref = (req.Preference ?? "").Trim();
        var bio = (req.Bio ?? "").Trim();

        if(string.IsNullOrWhiteSpace(gender)) 
            return Results.BadRequest(new { message = "Gender is required." });
        
        if(string.IsNullOrWhiteSpace(pref)) 
            return Results.BadRequest(new { message = "Sexual preference is required." });
        
        if(string.IsNullOrWhiteSpace(bio) || bio.Length < 10)
            return Results.BadRequest(new { message = "Bio must be at least 10 characters." });
        if(bio.Length > 500) 
            return Results.BadRequest(new { message = "Bio is too long (max 500)." });

        await using var conn = Db.Open(cfg);
        await using var cmd = new SqlCommand(@"
            UPDATE dbo.Profiles
            SET Gender = @g, Preference = @p, Bio = @b
            WHERE UserId = @uid;
        ", conn);

        cmd.Parameters.Add("@g", SqlDbType.NVarChar, 50).Value = gender;
        cmd.Parameters.Add("@p", SqlDbType.NVarChar, 50).Value = pref;
        cmd.Parameters.Add("@b", SqlDbType.NVarChar, 500).Value = bio;
        cmd.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;

        var rows = await cmd.ExecuteNonQueryAsync();
        if(rows == 0) 
            return Results.NotFound(new { message = "Profile not found." });

        return Results.Ok(new { ok = true });
    }
    
    private static readonly Regex TagRx = new(@"^[a-z0-9][a-z0-9_-]{1,29}$", RegexOptions.IgnoreCase);

    private static string NormalizeTag(string s)
    {
        s = (s ?? "").Trim();
        if (s.StartsWith("#")) s = s[1..];
        return s.Trim().ToLowerInvariant();
    }

    private static async Task<IResult> SearchTags(HttpContext ctx, IConfiguration cfg, [FromQuery] string? q)
    {
        var userId = await AuthSession.RequireUserId(ctx, cfg);
        if (userId is null) return Results.Unauthorized();

        var term = (q ?? "").Trim().ToLowerInvariant();
        if (term.Length == 0) return Results.Ok(new { tags = Array.Empty<object>() });

        await using var conn = Db.Open(cfg);
        await using var cmd = new SqlCommand(@"
            SELECT TOP 10 Name
            FROM dbo.Tags
            WHERE Normalized LIKE @q + '%'
            ORDER BY Name;
        ", conn);

        cmd.Parameters.Add("@q", SqlDbType.NVarChar, 50).Value = term;
        var tags = new List<string>();
        await using var r = await cmd.ExecuteReaderAsync();
        while(await r.ReadAsync())
            tags.Add((string)r["Name"]);

        return Results.Ok(new { tags });
    }
    
    private static async Task<IResult> AttachTags(HttpContext ctx, [FromBody] AttachTagsRequest req, IConfiguration cfg)
    {
        var userId = await AuthSession.RequireUserId(ctx, cfg);
        if(userId is null) 
            return Results.Unauthorized();

        var raw = req.Tags ?? Array.Empty<string>();
        var normalized = raw
            .Select(NormalizeTag)
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Distinct()
            .ToList();

        if(normalized.Count == 0)
            return Results.BadRequest(new { message = "No tags provided." });

        foreach(var t in normalized)
            if(!TagRx.IsMatch(t))
                return Results.BadRequest(new { message = $"Invalid tag: {t}" });

        await using var conn = Db.Open(cfg);

        foreach (var norm in normalized)
        {
            int tagId;
            await using (var cmd = new SqlCommand(@"
                SELECT Id FROM dbo.Tags WHERE Normalized = @n;
            ", conn))
            {
                cmd.Parameters.Add("@n", SqlDbType.NVarChar, 50).Value = norm;
                var existing = await cmd.ExecuteScalarAsync();
                if (existing is null)
                {
                    await using var ins = new SqlCommand(@"
                        INSERT INTO dbo.Tags (Name, Normalized)
                        OUTPUT INSERTED.Id
                        VALUES (@name, @n);
                    ", conn);
                    ins.Parameters.Add("@name", SqlDbType.NVarChar, 50).Value = "#" + norm;
                    ins.Parameters.Add("@n", SqlDbType.NVarChar, 50).Value = norm;
                    tagId = (int)(await ins.ExecuteScalarAsync() ?? throw new Exception("Insert tag failed"));
                }
                else tagId = (int)existing;
            }
            
            await using (var cmd = new SqlCommand(@"
                IF NOT EXISTS (SELECT 1 FROM dbo.UserTags WHERE UserId=@uid AND TagId=@tid)
                    INSERT INTO dbo.UserTags (UserId, TagId) VALUES (@uid, @tid);
            ", conn))
            {
                cmd.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;
                cmd.Parameters.Add("@tid", SqlDbType.Int).Value = tagId;
                await cmd.ExecuteNonQueryAsync();
            }
        }

        return Results.Ok(new { ok = true });
    }

    private static async Task<IResult> DetachTag(HttpContext ctx, [FromBody] DetachTagRequest req, IConfiguration cfg)
    {
        var userId = await AuthSession.RequireUserId(ctx, cfg);
        if(userId is null)
            return Results.Unauthorized();

        var norm = NormalizeTag(req.Tag);
        if(!TagRx.IsMatch(norm))
            return Results.BadRequest(new { message = "Invalid tag." });

        await using var conn = Db.Open(cfg);

        await using var cmd = new SqlCommand(@"
            DELETE ut
            FROM dbo.UserTags ut
            JOIN dbo.Tags t ON t.Id = ut.TagId
            WHERE ut.UserId = @uid AND t.Normalized = @n;
        ", conn);

        cmd.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;
        cmd.Parameters.Add("@n", SqlDbType.NVarChar, 50).Value = norm;

        await cmd.ExecuteNonQueryAsync();
        return Results.Ok(new { ok = true });
    }
    
    private static async Task<IResult> GetPhotos(HttpContext ctx, IConfiguration cfg)
    {
        var userId = await AuthSession.RequireUserId(ctx, cfg);
        if(userId is null) 
            return Results.Unauthorized();

        await using var conn = Db.Open(cfg);
        var photos = new List<object>();

        await using var cmd = new SqlCommand(@"
            SELECT Id, Url, IsPrimary, SortOrder
            FROM dbo.UserPhotos
            WHERE UserId=@uid
            ORDER BY IsPrimary DESC, SortOrder ASC, CreatedAt ASC;
        ", conn);

        cmd.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;

        await using var r = await cmd.ExecuteReaderAsync();
        while(await r.ReadAsync())
        {
            photos.Add(new
            {
                id = (Guid)r["Id"],
                url = (string)r["Url"],
                isPrimary = (bool)r["IsPrimary"],
                sortOrder = (int)r["SortOrder"]
            });
        }

        return Results.Ok(new { photos });
    }

    private static async Task<IResult> UploadPhoto(HttpContext ctx, IConfiguration cfg, IFormFile file)
    {
        var userId = await AuthSession.RequireUserId(ctx, cfg);
        if(userId is null) 
            return Results.Unauthorized();

        if(file.Length == 0) 
            return Results.BadRequest(new { message = "Empty file." });
        
        if(file.Length > 5 * 1024 * 1024)
            return Results.BadRequest(new { message = "Max file size is 5MB." });

        var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
        if(!allowed.Contains(file.ContentType))
            return Results.BadRequest(new { message = "Only JPG/PNG/WEBP allowed." });

        await using var conn = Db.Open(cfg);
        
        int count;
        await using (var cmd = new SqlCommand("SELECT COUNT(*) FROM dbo.UserPhotos WHERE UserId=@uid", conn))
        {
            cmd.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;
            count = (int)(await cmd.ExecuteScalarAsync() ?? 0);
        }
        if (count >= 5) return Results.BadRequest(new { message = "You can upload up to 5 photos." });
        
        var ext = Path.GetExtension(file.FileName);
        if(string.IsNullOrWhiteSpace(ext))
            ext = ".jpg";

        var uploadRoot = Path.Combine(AppContext.BaseDirectory, "wwwroot", "uploads", userId.Value.ToString());
        Directory.CreateDirectory(uploadRoot);

        var photoId = Guid.NewGuid();
        var filename = $"{photoId}{ext}";
        var fullPath = Path.Combine(uploadRoot, filename);

        await using (var fs = File.Create(fullPath))
            await file.CopyToAsync(fs);

        var publicUrl = $"/uploads/{userId.Value}/{filename}";
        
        bool hasPrimary;
        await using (var cmd = new SqlCommand("SELECT 1 FROM dbo.UserPhotos WHERE UserId=@uid AND IsPrimary=1", conn))
        {
            cmd.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;
            hasPrimary = (await cmd.ExecuteScalarAsync()) is not null;
        }

        await using (var cmd = new SqlCommand(@"
            INSERT INTO dbo.UserPhotos (Id, UserId, Url, IsPrimary, SortOrder)
            VALUES (@id, @uid, @url, @prim, @sort);
        ", conn))
        {
            cmd.Parameters.Add("@id", SqlDbType.UniqueIdentifier).Value = photoId;
            cmd.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;
            cmd.Parameters.Add("@url", SqlDbType.NVarChar, 500).Value = publicUrl;
            cmd.Parameters.Add("@prim", SqlDbType.Bit).Value = hasPrimary ? 0 : 1;
            cmd.Parameters.Add("@sort", SqlDbType.Int).Value = count;
            await cmd.ExecuteNonQueryAsync();
        }

        return Results.Ok(new { ok = true, id = photoId, url = publicUrl, isPrimary = !hasPrimary });
    }

    private static async Task<IResult> SetPrimaryPhoto(HttpContext ctx, IConfiguration cfg, Guid photoId)
    {
        var userId = await AuthSession.RequireUserId(ctx, cfg);
        if(userId is null)
            return Results.Unauthorized();

        await using var conn = Db.Open(cfg);
        
        await using (var chk = new SqlCommand("SELECT 1 FROM dbo.UserPhotos WHERE Id=@id AND UserId=@uid", conn))
        {
            chk.Parameters.Add("@id", SqlDbType.UniqueIdentifier).Value = photoId;
            chk.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;
            if((await chk.ExecuteScalarAsync()) is null)
                return Results.NotFound(new { message = "Photo not found." });
        }
        
        await using (var clear = new SqlCommand("UPDATE dbo.UserPhotos SET IsPrimary=0 WHERE UserId=@uid", conn))
        {
            clear.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;
            await clear.ExecuteNonQueryAsync();
        }

        await using (var set = new SqlCommand("UPDATE dbo.UserPhotos SET IsPrimary=1 WHERE Id=@id AND UserId=@uid", conn))
        {
            set.Parameters.Add("@id", SqlDbType.UniqueIdentifier).Value = photoId;
            set.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;
            await set.ExecuteNonQueryAsync();
        }

        return Results.Ok(new { ok = true });
    }

    private static async Task<IResult> DeletePhoto(HttpContext ctx, IConfiguration cfg, Guid photoId)
    {
        var userId = await AuthSession.RequireUserId(ctx, cfg);
        if(userId is null) 
            return Results.Unauthorized();

        await using var conn = Db.Open(cfg);

        string? url = null;
        bool wasPrimary = false;

        await using (var cmd = new SqlCommand(@"
            SELECT Url, IsPrimary FROM dbo.UserPhotos WHERE Id=@id AND UserId=@uid;
        ", conn))
        {
            cmd.Parameters.Add("@id", SqlDbType.UniqueIdentifier).Value = photoId;
            cmd.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;

            await using var r = await cmd.ExecuteReaderAsync();
            if (!await r.ReadAsync()) return Results.NotFound(new { message = "Photo not found." });
            url = (string)r["Url"];
            wasPrimary = (bool)r["IsPrimary"];
        }

        await using (var del = new SqlCommand("DELETE FROM dbo.UserPhotos WHERE Id=@id AND UserId=@uid", conn))
        {
            del.Parameters.Add("@id", SqlDbType.UniqueIdentifier).Value = photoId;
            del.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;
            await del.ExecuteNonQueryAsync();
        }
        
        if (!string.IsNullOrWhiteSpace(url) && url.StartsWith("/uploads/"))
        {
            var full = Path.Combine(AppContext.BaseDirectory, "wwwroot", url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            if (File.Exists(full)) File.Delete(full);
        }
        
        if (wasPrimary)
        {
            await using var pick = new SqlCommand(@"
                ;WITH cte AS (
                    SELECT TOP 1 Id FROM dbo.UserPhotos
                    WHERE UserId=@uid
                    ORDER BY CreatedAt ASC
                )
                UPDATE dbo.UserPhotos
                SET IsPrimary = CASE WHEN Id = (SELECT Id FROM cte) THEN 1 ELSE 0 END
                WHERE UserId=@uid;
            ", conn);

            pick.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = userId.Value;
            await pick.ExecuteNonQueryAsync();
        }

        return Results.Ok(new { ok = true });
    }
}