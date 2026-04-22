import ChatWindow from './components/ChatWindow'
import IngestForm from './components/IngestForm'
import MessageBubble from './components/MessageBubble'
import SourceBadge from './components/SourceBadge'

export default function App() {
  return (
    <>
      <ChatWindow />
      <MessageBubble />
      <SourceBadge />
      <IngestForm />
    </>
  )
}
