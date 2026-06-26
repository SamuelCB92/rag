using rag_api.Models;
using OpenAI.Chat;

namespace rag_api.Services;

public interface IChatService
{
    Task<ChatResponse> AskAsync(string question, List<Document> context);
}

public class ChatService : IChatService
{
    private readonly ChatClient _client;

    public ChatService(IConfiguration configuration)
    {
        var apiKey = configuration["OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI API key not configured.");
        _client = new ChatClient("gpt-4o-mini", apiKey);
    }

    public async Task<ChatResponse> AskAsync(string question, List<Document> context)
    {
        var contextText = string.Join("\n\n", context.Select(d =>
            $"Source: {d.Title ?? d.Source}\n{d.Chunk}"));

        var systemPrompt =
    "You are an expert assistant for the provided documents. " +
    "Answer questions using only the supplied context. " +
    "If the answer is not in the context, clearly say you could not find the information. " +
    "Always mention which document or source your answer comes from.";

        var userMessage = $"Context:\n{contextText}\n\nQuestion: {question}";

        var completion = await _client.CompleteChatAsync(
            new SystemChatMessage(systemPrompt),
            new UserChatMessage(userMessage)
        );

        var answer = completion.Value.Content[0].Text;
        var sources = context
            .Select(d => d.Title ?? d.Source ?? "Unknown")
            .Distinct()
            .ToList();

        return new ChatResponse { Answer = answer, Sources = sources };
    }
}