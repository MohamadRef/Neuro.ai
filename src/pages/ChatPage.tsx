// src/pages/ChatPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { openai } from '../lib/openai';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';

interface Agent {
  id: string;
  persona: string;
  memory: any;
  blocks: string[];
}

export default function ChatPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);

  // 1) Fetch agent config on mount
  useEffect(() => {
    supabase
      .from<Agent>('agents')
      .select('*')
      .eq('id', agentId)
      .single()
      .then(({ data, error }) => {
        if (error) return console.error(error);
        setAgent(data);
      });
  }, [agentId]);

  if (!agent) {
    return <div className="p-4">Loading agent…</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 border-b bg-white">
        <h2 className="text-xl font-semibold">
          {agent.persona} Agent Chat
        </h2>
      </header>

      <ChatWindow agentId={agent.id} />

      <ChatInput
        agent={agent}
        onNewMessage={() => {
          /* optional: scroll ChatWindow to bottom */
        }}
      />
    </div>
  );
}
