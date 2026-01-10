using Microsoft.AspNetCore.Antiforgery;
using server.Endpoints;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("client", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddAntiforgery(o =>
{
    o.HeaderName = "X-CSRF-TOKEN";
});

var app = builder.Build();
app.UseCors("client");
app.UseStaticFiles();

app.UseAntiforgery();
app.MapGet("/api/csrf", (HttpContext ctx, IAntiforgery af) =>
{
    var tokens = af.GetAndStoreTokens(ctx);
    return Results.Ok(new { token = tokens.RequestToken });
});

app.MapHomeEndpoints();
app.MapProfileEndpoints();
app.MapAuthEndpoints();

app.Run();