using lolguide_api.Models;
using lolguide_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace lolguide_api.Controllers;

[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly IEmbeddingService _embeddingService;
    private readonly IVectorSearchService _vectorSearchService;
    private readonly IChatService _chatService;

    public ChatController(
        IEmbeddingService embeddingService,
        IVectorSearchService vectorSearchService,
        IChatService chatService)
    {
        _embeddingService = embeddingService;
        _vectorSearchService = vectorSearchService;
        _chatService = chatService;
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] ChatRequest body)
    {
        if (string.IsNullOrWhiteSpace(body.Question))
            return BadRequest("Question is required.");

        var queryEmbedding = await _embeddingService.GetEmbeddingAsync(body.Question);
        var relevantDocs = await _vectorSearchService.SearchAsync(queryEmbedding);
        var response = await _chatService.AskAsync(body.Question, relevantDocs);

        return Ok(response);
    }
}