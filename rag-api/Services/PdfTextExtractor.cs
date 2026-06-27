using UglyToad.PdfPig;

namespace rag_api.Services;

public interface IPdfTextExtractor
{
    PdfExtractionResult Extract(Stream stream, string fileName, long fileLength);
}

public record PdfExtractionResult(bool Success, string? Text, string? ErrorMessage);

public class PdfTextExtractor : IPdfTextExtractor
{
    public const int MaxFileSizeBytes = 5 * 1024 * 1024;
    public const int MaxPages = 20;
    public const int MinTextLength = 100;

    private const string InvalidFormatMessage =
        "Invalid file format. Only PDF files are accepted.";

    private const string UnreadableTextMessage =
        "Could not extract readable text from this PDF. The file may be scanned or image-based.";

    public PdfExtractionResult Extract(Stream stream, string fileName, long fileLength)
    {
        if (fileLength > MaxFileSizeBytes)
        {
            return new PdfExtractionResult(
                false,
                null,
                "PDF file exceeds the 5MB size limit.");
        }

        if (!fileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
        {
            return new PdfExtractionResult(false, null, InvalidFormatMessage);
        }

        try
        {
            using var document = PdfDocument.Open(stream);

            if (document.NumberOfPages > MaxPages)
            {
                return new PdfExtractionResult(
                    false,
                    null,
                    "PDF exceeds the 20-page limit.");
            }

            var text = string.Join(
                "\n\n",
                document.GetPages().Select(p => p.Text.Trim()));

            if (text.Length < MinTextLength)
            {
                return new PdfExtractionResult(false, null, UnreadableTextMessage);
            }

            return new PdfExtractionResult(true, text, null);
        }
        catch (Exception)
        {
            return new PdfExtractionResult(false, null, InvalidFormatMessage);
        }
    }
}
