using lolguide_api.Models;
using Microsoft.AspNetCore.Mvc;

namespace lolguide_api.Controllers;

[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    [HttpPost]
    public IActionResult Post([FromBody] ChatRequest? _)
    {
        return Ok();
    }
}
