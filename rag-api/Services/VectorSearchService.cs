using rag_api.Data;
using rag_api.Models;
using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;

namespace rag_api.Services;

public interface IVectorSearchService
{
    /// <summary>
    /// Returns documents whose cosine distance to the query is within MaxCosineDistance.
    /// </summary>
    Task<List<Document>> SearchAsync(float[] queryEmbedding, int topK = 3);
}

public class VectorSearchService : IVectorSearchService
{
    /// <summary>
    /// Max cosine distance for a chunk to be considered relevant (0 = identical, 2 = opposite).
    /// ~0.40 corresponds to roughly 0.60+ cosine similarity for normalized embeddings.
    /// </summary>
    public const double MaxCosineDistance = 0.40;

    private readonly AppDbContext _db;

    public VectorSearchService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Document>> SearchAsync(float[] queryEmbedding, int topK = 3)
    {
        var vector = new Pgvector.Vector(queryEmbedding);

        var candidates = await _db.Documents
            .Select(d => new { Document = d, Distance = d.Embedding!.CosineDistance(vector) })
            .OrderBy(x => x.Distance)
            .Take(topK)
            .ToListAsync();

        return candidates
            .Where(x => x.Distance <= MaxCosineDistance)
            .Select(x => x.Document)
            .ToList();
    }
}
