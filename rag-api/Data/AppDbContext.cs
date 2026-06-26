using rag_api.Models;
using Microsoft.EntityFrameworkCore;

namespace rag_api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Document> Documents => Set<Document>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Document>()
        .Property(d => d.Embedding)
        .HasColumnType("vector(1536)");
}
}
