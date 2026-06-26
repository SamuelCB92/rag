using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pgvector;

namespace rag_api.Models;

[Table("documents")]
public class Document
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("title")]
    public string? Title { get; set; }

    [Column("source")]
    public string? Source { get; set; }

    [Column("chunk")]
    public string? Chunk { get; set; }

    [Column("embedding")]
    public Vector? Embedding { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}