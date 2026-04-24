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
        var sources = await _db.Documents
            .Select(d => new { d.Title, d.Source })
            .Distinct()
            .ToListAsync();

        return Ok(sources);
    }
}