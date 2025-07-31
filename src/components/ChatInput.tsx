// src/components/ChatInput.tsx
export function ChatInput() {
    return (
      <form className="flex p-2 border-t">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded mr-2"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Send
        </button>
      </form>
    );
  }
  