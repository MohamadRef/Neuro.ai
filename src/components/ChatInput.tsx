// src/components/ChatInput.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { openai } from '../lib/openai';

export default function ChatInput({
  agent,
  onNewMessage,
}: {
  agent: { id: string; blocks: string[]; memory: any };
  onNewMessage?: () => void;
}) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    // 1) Insert user message
    const { data: userMsg, error: userErr } = await supabase
      .from('messages')
      .insert([
        { agent_id: agent.id, role: 'user', content: text.trim() },
      ])
      .select()
      .single();
    if (userErr) console.error(userErr);

    // 2) Build conversation history
    const { data: history } = await supabase
      .from('messages')
      .select('*')
      .eq('agent_id', agent.id)
      .order('created_at', { ascending: true });

    // 3) Call OpenAI
    const messages = history!.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: agent.blocks,      // if using the Assistants API
      memory: agent.memory,     // if supported
    });

    const assistantContent = response.choices[0].message.content;

    // 4) Insert assistant message
    const { error: botErr } = await supabase.from('messages').insert([
      { agent_id: agent.id, role: 'assistant', content: assistantContent },
    ]);
    if (botErr) console.error(botErr);

    setText('');
    setLoading(false);
    onNewMessage?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t p-4 flex bg-white"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
        placeholder="Type your message..."
        className="flex-1 p-2 border rounded mr-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? '...' : 'Send'}
      </button>
    </form>
  );
}
