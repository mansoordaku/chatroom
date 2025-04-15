'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ChatInput from '@/components/ChatInput';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

export default function ChatPage() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>();

  const handleNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date(),
      messages: []
    };
    setChatSessions([newChat, ...chatSessions]);
    setSelectedChatId(newChat.id);
  };

  const handleSendMessage = (message: string) => {
    if (!selectedChatId) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date()
    };

    setChatSessions(sessions => 
      sessions.map(session => 
        session.id === selectedChatId
          ? { ...session, messages: [...session.messages, newMessage] }
          : session
      )
    );
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          chatSessions={chatSessions}
          onNewChat={handleNewChat}
          onSelectChat={setSelectedChatId}
          selectedChatId={selectedChatId}
        />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {selectedChatId && chatSessions.find(s => s.id === selectedChatId)?.messages.map(message => (
              <div
                key={message.id}
                className={`mb-4 p-3 border border-white text-white ${
                  message.isUser ? 'ml-auto' : 'mr-auto'
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>
          <ChatInput onSendMessage={handleSendMessage} />
        </main>
      </div>
    </div>
  );
} 