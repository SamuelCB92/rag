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
    private readonly IPdfTextExtractor _pdfTextExtractor;
    private readonly AppDbContext _db;

    public IngestController(
        IEmbeddingService embeddingService,
        IPdfTextExtractor pdfTextExtractor,
        AppDbContext db)
    {
        _embeddingService = embeddingService;
        _pdfTextExtractor = pdfTextExtractor;
        _db = db;
    }

    public class RequestBody
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? Source { get; set; }
    }

    [HttpPost]
    [Consumes("application/json")]
    public async Task<IActionResult> PostJson([FromBody] RequestBody body)
    {
        if (string.IsNullOrWhiteSpace(body.Title))
            return BadRequestJson("Title is required.");

        if (string.IsNullOrWhiteSpace(body.Content))
            return BadRequestJson("Document content is required.");

        return await IngestDocumentAsync(body.Title.Trim(), body.Content, body.Source);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(PdfTextExtractor.MaxFileSizeBytes)]
    public async Task<IActionResult> PostPdf(
        [FromForm] string? title,
        [FromForm] string? source,
        [FromForm] IFormFile? file)
    {
        if (file is null || file.Length == 0)
            return BadRequestJson("PDF file is required.");

        var resolvedTitle = string.IsNullOrWhiteSpace(title)
            ? TitleFromFileName(file.FileName)
            : title.Trim();

        await using var stream = file.OpenReadStream();
        var extraction = _pdfTextExtractor.Extract(stream, file.FileName, file.Length);

        if (!extraction.Success)
            return BadRequestJson(extraction.ErrorMessage!);

        var pdfSource = string.IsNullOrWhiteSpace(source) ? file.FileName : source.Trim();
        return await IngestDocumentAsync(resolvedTitle, extraction.Text!, pdfSource);
    }

    private async Task<IActionResult> IngestDocumentAsync(
        string title,
        string content,
        string? source)
    {
        var chunks = ChunkText(content, 500);

        foreach (var chunk in chunks)
        {
            var embedding = await _embeddingService.GetEmbeddingAsync(chunk);

            _db.Documents.Add(new Document
            {
                Id = Guid.NewGuid(),
                Title = title,
                Source = source,
                Chunk = chunk,
                Embedding = new Vector(embedding),
                CreatedAt = DateTime.UtcNow,
            });
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = $"Ingested {chunks.Count} chunks." });
    }

    private static IActionResult BadRequestJson(string message) =>
        new BadRequestObjectResult(new { message });

    private static string TitleFromFileName(string fileName)
    {
        var name = Path.GetFileNameWithoutExtension(fileName);
        return string.IsNullOrWhiteSpace(name) ? "Untitled" : name;
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
