import { ChatWindow } from '../components/ChatWindow';
import { ChatInput } from '../components/ChatInput';
import { useParams } from 'react-router-dom';

export default function ChatPage() {
  const { agentId } = useParams<{ agentId: string }>();

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 border-b">
        <h2 className="text-xl font-semibold">Chat with Agent: {agentId}</h2>
      </header>
      <ChatWindow />
      <ChatInput />
    </div>
  );
}
