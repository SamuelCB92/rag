using lolguide_api.Data;
using lolguide_api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace lolguide_api.Controllers;

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
}