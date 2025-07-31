// src/components/ChatWindow.tsx
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  agent_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export default function ChatWindow({ agentId }: { agentId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1) Load history
  useEffect(() => {
    supabase
      .from<Message>('messages')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setMessages(data);
      });

    // 2) Subscribe to realtime inserts
    const sub = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `agent_id=eq.${agentId}` },
        ({ new: msg }) => {
          setMessages((prev) => [...prev, msg as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [agentId]);

  // auto-scroll
  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
    >
      {messages.map((m) => (
        <div
          key={m.id}
          className={`max-w-md p-3 rounded ${
            m.role === 'user'
              ? 'self-end bg-blue-100 text-gray-800'
              : 'self-start bg-gray-100 text-gray-800'
          }`}
        >
          {m.content}
        </div>
      ))}
    </div>
  );
}
