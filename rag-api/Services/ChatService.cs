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
    "Você é um assistente especialista nos documentos fornecidos. " +
    "Responda as perguntas usando apenas o contexto fornecido. " +
    "Se a resposta não estiver no contexto, diga claramente que não encontrou a informação. " +
    "Sempre mencione de qual documento ou fonte vem sua resposta.";

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