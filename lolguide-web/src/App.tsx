import ChatWindow from "./components/ChatWindow";
import IngestForm from "./components/IngestForm";

export default function App() {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "24px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <h1 style={{ margin: 0 }}>Consulta RAG</h1>
      <ChatWindow />
      <IngestForm />
    </div>
  );
}
