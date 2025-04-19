import { KeyboardEvent, useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message);
        setMessage('');
      }
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="border-t border-white bg-black p-4">
      <div className="flex gap-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="flex-1 p-3 bg-black text-white border border-white resize-none focus:outline-none"
          rows={3}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className={`px-6 self-stretch border border-white text-white
            ${message.trim() 
              ? 'hover:bg-orange-200 hover:text-black cursor-pointer' 
              : 'opacity-50 cursor-not-allowed'
            }`}
        >
          Send
        </button>
      </div>
    </div>
  );
} 