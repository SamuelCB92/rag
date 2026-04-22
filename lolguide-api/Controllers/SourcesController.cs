using Microsoft.AspNetCore.Mvc;

namespace lolguide_api.Controllers;

[ApiController]
[Route("api/sources")]
public class SourcesController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok();
    }
}
