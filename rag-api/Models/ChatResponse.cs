namespace lolguide_api.Models;

public class ChatResponse
{
    public string Answer { get; set; } = string.Empty;

    public IReadOnlyList<string> Sources { get; set; } = Array.Empty<string>();
}
