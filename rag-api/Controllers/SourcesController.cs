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
                "Não há documentos ingeridos. Ingira um documento antes de listar as fontes.");

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
        return NotFound($"Nenhum documento encontrado com o título '{title}'.");

    _db.Documents.RemoveRange(documents);
    await _db.SaveChangesAsync();

    return Ok(new { message = $"Documentos com título '{title}' removidos com sucesso." });
}
}