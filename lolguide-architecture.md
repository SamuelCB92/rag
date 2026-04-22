# lolguide — Architecture Document

## Purpose
A RAG-powered League of Legends assistant that answers questions about current meta, champion builds, and patch changes using ingested patch notes and champion data. Demonstrates RAG's advantage over static LLMs by having access to current patch information.

## Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** ASP.NET Core 9 Web API (C#)
- **ORM:** Entity Framework Core 9
- **Database:** PostgreSQL + pgvector extension
- **Embeddings:** OpenAI `text-embedding-3-small`
- **Completions:** OpenAI `gpt-4o-mini`

## Backend Structure
```
lolguide-api/
  Controllers/
    IngestController.cs
    ChatController.cs
    SourcesController.cs
  Services/
    EmbeddingService.cs
    ChatService.cs
    VectorSearchService.cs
  Models/
    Document.cs
    ChatRequest.cs
    ChatResponse.cs
  Data/
    AppDbContext.cs
    Migrations/
  Program.cs
```

## Frontend Structure
```
lolguide-web/
  src/
    components/
      ChatWindow.tsx
      MessageBubble.tsx
      SourceBadge.tsx
      IngestForm.tsx
    services/
      api.ts
    App.tsx
```

## Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ingest` | Accepts `{ title, content, source }`, chunks text, generates embeddings, stores in pgvector |
| POST | `/api/chat` | Accepts `{ question }`, retrieves relevant chunks, calls GPT, returns `{ answer, sources }` |
| GET | `/api/sources` | Returns list of ingested documents |

## Database Schema
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  title TEXT,
  source TEXT,
  chunk TEXT,
  embedding vector(1536),
  created_at TIMESTAMP
);
```

## EF Core Notes
- Use `Npgsql.EntityFrameworkCore.PostgreSQL` for PostgreSQL support
- Use `pgvector` NuGet package for vector type support in EF Core models
- Migrations managed via `dotnet ef migrations add` / `dotnet ef database update`

## RAG Flow
```
User question
  → embed question (text-embedding-3-small)
  → similarity search in pgvector (top 5 chunks)
  → build prompt: system + retrieved chunks + question
  → GPT generates answer (gpt-4o-mini)
  → return answer + source titles
```

## Out of Scope for MVP
- Authentication
- User accounts
- Automatic patch note scraping
- Mobile
