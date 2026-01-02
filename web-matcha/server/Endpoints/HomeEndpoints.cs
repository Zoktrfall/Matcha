namespace server.Endpoints;

public static class HomeEndpoints
{
    private const string Html = @"
        <!doctype html>
        <html lang=""en"">
        <head>
          <meta charset=""utf-8"" />
          <meta name=""viewport"" content=""width=device-width, initial-scale=1"" />
          <title>Matcha Backend</title>
          <style>
            :root { --bg: #0e0f14; }
            html, body { height: 100%; margin: 0; }
            body {
              display: grid;
              place-items: center;
              background:
                radial-gradient(1200px 700px at 30% 10%, rgba(108,92,231,0.22), transparent 60%),
                radial-gradient(900px 600px at 70% 90%, rgba(125,108,255,0.16), transparent 60%),
                var(--bg);
              color: rgba(255,255,255,0.92);
              font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            }
            .card {
              padding: 28px 34px;
              border-radius: 18px;
              background: rgba(255,255,255,0.06);
              border: 1px solid rgba(255,255,255,0.12);
              box-shadow: 0 20px 70px rgba(0,0,0,0.45);
              text-align: center;
            }
            .logo {
              font-weight: 800;
              letter-spacing: 0.14em;
              font-size: 14px;
              margin-bottom: 14px;
            }
            h1 {
              margin: 0;
              font-size: 42px;
              line-height: 1.05;
            }
            p {
              margin: 14px 0 0;
              color: rgba(255,255,255,0.65);
              font-size: 14px;
            }
            code {
              color: rgba(255,255,255,0.85);
            }
          </style>
        </head>
        <body>
          <div class=""card"">
            <div class=""logo"">MATCHA/CODER</div>
            <h1>Backend is working ✅</h1>
          </div>
        </body>
        </html>";

    public static IEndpointRouteBuilder MapHomeEndpoints(this IEndpointRouteBuilder app)
    {
      app.MapGet("/", () => Results.Content(Html, "text/html"));
      return app;
    }
}