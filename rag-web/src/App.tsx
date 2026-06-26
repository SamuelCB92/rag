import ChatWindow from "./components/ChatWindow";
import IngestForm from "./components/IngestForm";
import ThemeSwitch from "./components/ThemeSwitch";
import "./App.css";

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__titles">
          <h1>RAG Document Q&A</h1>
          <p className="app-tagline">Ask questions grounded in your ingested sources</p>
        </div>
        <ThemeSwitch />
      </header>

      <div className="app-main">
        <section className="app-chat-column" aria-label="Assistant chat">
          <div className="app-chat-card">
            <h2 className="app-chat-heading">Chat</h2>
            <div className="app-chat-body">
              <ChatWindow />
            </div>
          </div>
        </section>

        <section className="app-ingest-column" aria-label="Ingest documents">
          <IngestForm />
        </section>
      </div>
    </div>
  );
}
