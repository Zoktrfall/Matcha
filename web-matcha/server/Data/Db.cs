using Microsoft.Data.SqlClient;

namespace server.Data;

public static class Db
{
    public static SqlConnection Open(IConfiguration cfg)
    {
        var cs = cfg.GetConnectionString("Matcha")
                 ?? throw new InvalidOperationException("Missing connection string: Matcha");

        var conn = new SqlConnection(cs);
        conn.Open();
        return conn;
    }
}