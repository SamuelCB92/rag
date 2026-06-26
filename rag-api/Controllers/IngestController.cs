using rag_api.Data;
using rag_api.Models;
using rag_api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Pgvector;

namespace rag_api.Controllers;

[ApiController]
[Route("api/ingest")]
[EnableRateLimiting("Ingest")]
public class IngestController : ControllerBase
{
    private readonly IEmbeddingService _embeddingService;
    private readonly AppDbContext _db;

    public IngestController(IEmbeddingService embeddingService, AppDbContext db)
    {
        _embeddingService = embeddingService;
        _db = db;
    }

    public class RequestBody
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? Source { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] RequestBody body)
    {
        if (string.IsNullOrWhiteSpace(body.Title))
            return BadRequest("Title is required.");

        if (string.IsNullOrWhiteSpace(body.Content))
            return BadRequest("Document content is required.");

        var chunks = ChunkText(body.Content, 500);

        foreach (var chunk in chunks)
        {
            var embedding = await _embeddingService.GetEmbeddingAsync(chunk);

            _db.Documents.Add(new Document
            {
                Id = Guid.NewGuid(),
                Title = body.Title,
                Source = body.Source,
                Chunk = chunk,
                Embedding = new Vector(embedding),
                CreatedAt = DateTime.UtcNow,
            });
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = $"Ingested {chunks.Count} chunks." });
    }

    private static List<string> ChunkText(string text, int chunkSize)
    {
        var chunks = new List<string>();
        var words = text.Split(' ');
        var current = new List<string>();

        foreach (var word in words)
        {
            current.Add(word);
            if (current.Count >= chunkSize)
            {
                chunks.Add(string.Join(' ', current));
                current.Clear();
            }
        }

        if (current.Count > 0)
            chunks.Add(string.Join(' ', current));

        return chunks;
    }
}