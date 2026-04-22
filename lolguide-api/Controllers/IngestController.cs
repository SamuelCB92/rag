using Microsoft.AspNetCore.Mvc;

namespace lolguide_api.Controllers;

[ApiController]
[Route("api/ingest")]
public class IngestController : ControllerBase
{
    public class RequestBody
    {
        public string? Title { get; set; }

        public string? Content { get; set; }

        public string? Source { get; set; }
    }

    [HttpPost]
    public IActionResult Post([FromBody] RequestBody? _)
    {
        return Ok();
    }
}
