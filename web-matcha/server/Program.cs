var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("client", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
        // If you use cookie sessions later, also add: .AllowCredentials()
    });
});

var app = builder.Build();
app.UseCors("client");
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
app.Run();