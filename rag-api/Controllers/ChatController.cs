using rag_api.Data;
using rag_api.Models;
using rag_api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace rag_api.Controllers;

[ApiController]
[Route("api/chat")]
[EnableRateLimiting("Query")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IEmbeddingService _embeddingService;
    private readonly IVectorSearchService _vectorSearchService;
    private readonly IChatService _chatService;

    public ChatController(
        AppDbContext db,
        IEmbeddingService embeddingService,
        IVectorSearchService vectorSearchService,
        IChatService chatService)
    {
        _db = db;
        _embeddingService = embeddingService;
        _vectorSearchService = vectorSearchService;
        _chatService = chatService;
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] ChatRequest body)
    {
        if (string.IsNullOrWhiteSpace(body.Question))
            return BadRequest("Question is required.");

        if (!await _db.Documents.AnyAsync())
            return BadRequest(
                "Não há documentos ingeridos. Ingira pelo menos um documento antes de perguntar.");

        var queryEmbedding = await _embeddingService.GetEmbeddingAsync(body.Question);
        var relevantDocs = await _vectorSearchService.SearchAsync(queryEmbedding);
        var response = await _chatService.AskAsync(body.Question, relevantDocs);

        return Ok(response);
    }
}