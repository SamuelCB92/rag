using lolguide_api.Data;
using lolguide_api.Models;
using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;

namespace lolguide_api.Services;

public interface IVectorSearchService
{
    Task<List<Document>> SearchAsync(float[] queryEmbedding, int topK = 3);
}

public class VectorSearchService : IVectorSearchService
{
    private readonly AppDbContext _db;

    public VectorSearchService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Document>> SearchAsync(float[] queryEmbedding, int topK = 3)
    {
        var vector = new Pgvector.Vector(queryEmbedding);

        return await _db.Documents
            .OrderBy(d => d.Embedding!.CosineDistance(vector))
            .Take(topK)
            .ToListAsync();
    }
}