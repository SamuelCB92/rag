using System.Threading.RateLimiting;
using rag_api.Data;
using rag_api.Services;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.OnRejected = async (context, cancellationToken) =>
    {
        var path = context.HttpContext.Request.Path.Value ?? "";
        var isIngest = path.Contains("/api/ingest", StringComparison.OrdinalIgnoreCase);

        var limit = isIngest ? 5 : 10;
        var action = isIngest ? "uploads de documentos" : "perguntas";

        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers.RetryAfter =
                ((int)Math.Ceiling(retryAfter.TotalSeconds)).ToString();
        }

        context.HttpContext.Response.ContentType = "application/json";

        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            title = "Limite de requisições atingido",
            detail =
                $"Você atingiu o limite de {limit} {action} por hora neste endereço IP. " +
                "Aguarde um pouco e tente novamente — seus documentos e conversas anteriores continuam disponíveis.",
            retryAfterSeconds = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retry)
                ? (int)Math.Ceiling(retry.TotalSeconds)
                : (int?)null,
        }, cancellationToken);
    };

    options.AddPolicy("Query", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            GetClientIp(httpContext),
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromHours(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
            }));

    options.AddPolicy("Ingest", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            GetClientIp(httpContext),
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromHours(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
            }));
});

static string GetClientIp(HttpContext httpContext) =>
    httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

var allowedOrigins = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins.Split(','))
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, o => o.UseVector()));

builder.Services.AddScoped<IEmbeddingService, EmbeddingService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IVectorSearchService, VectorSearchService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseRateLimiter();
app.UseAuthorization();
app.MapControllers();

app.Run();