using rag_api.Data;
using rag_api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace rag_api.Controllers;

[ApiController]
[Route("api/sources")]
public class SourcesController : ControllerBase
{
    private readonly AppDbContext _db;

    public SourcesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        if (!await _db.Documents.AnyAsync())
            return BadRequest(
                "No documents have been ingested. Ingest a document before listing sources.");

        var sources = await _db.Documents
            .Select(d => new { d.Title, d.Source })
            .Distinct()
            .ToListAsync();

        return Ok(sources);
    }
    [HttpDelete("{title}")]
public async Task<IActionResult> Delete(string title)
{
    var documents = await _db.Documents
        .Where(d => d.Title == title)
        .ToListAsync();

    if (!documents.Any())
        return NotFound($"No document found with title '{title}'.");

    _db.Documents.RemoveRange(documents);
    await _db.SaveChangesAsync();

    return Ok(new { message = $"Documents titled '{title}' removed successfully." });
}
}