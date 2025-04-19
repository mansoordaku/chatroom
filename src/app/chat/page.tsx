'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ChatInput from '@/components/ChatInput';
import { ChatMessage, ChatMetadata } from '@/types/chat';

interface Props {
  initialChatId?: string;
}

export default function ChatPage({ initialChatId }: Props) {
  const router = useRouter();
  const [chatSessions, setChatSessions] = useState<ChatMetadata[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(initialChatId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load chat list
  useEffect(() => {
    fetch('/api/chats')
      .then(res => res.json())
      .then(setChatSessions)
      .catch(console.error);
  }, []);

  // Load selected chat
  useEffect(() => {
    if (selectedChatId) {
      setIsLoading(true);
      fetch(`/api/chats/${selectedChatId}`)
        .then(res => res.json())
        .then(chat => {
          console.log('Loaded chat:', chat);
          if (Array.isArray(chat.messages)) {
            setMessages(chat.messages);
          } else {
            console.warn('No messages array in response:', chat);
            setMessages([]);
          }
        })
        .catch(error => {
          console.error('Error loading chat:', error);
          setMessages([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setMessages([]);
    }
  }, [selectedChatId]);

  const playTTS = async (text: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await response.json();
      
      if (data.audioUrl) {
        if (audioRef.current) {
          audioRef.current.src = data.audioUrl;
          await audioRef.current.play();
        } else {
          const audio = new Audio(data.audioUrl);
          audioRef.current = audio;
          await audio.play();
        }
      }
    } catch (error) {
      console.error('Error playing TTS:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    let currentChatId = selectedChatId;
    let newChatCreated = false;

    // If no chat is selected, create a new one with the first message as title
    if (!currentChatId) {
      try {
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: content.slice(0, 30) + (content.length > 30 ? '...' : '')
          })
        });
        
        const newChat = await response.json();
        currentChatId = newChat.id;
        newChatCreated = true;
        
        // Update UI state for new chat
        setChatSessions(prev => [newChat, ...prev]);
        setSelectedChatId(newChat.id);
        router.push(`/chat/${newChat.id}`);
      } catch (error) {
        console.error('Error creating new chat:', error);
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    // Add user message immediately to UI
    setMessages(prev => [...prev, userMessage]);

    try {
      // Call OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          chatId: currentChatId
        })
      });

      const data = await response.json();
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      };

      // Update messages with both user message and AI response
      setMessages(prev => [...prev, aiMessage]);

      // Play TTS if enabled
      if (isVoiceEnabled) {
        await playTTS(data.response);
      }

      // Format messages for storage
      const messagesToStore = [userMessage, aiMessage];

      console.log('Storing messages:', messagesToStore);

      // Update chat with new messages and token usage
      const updateResponse = await fetch(`/api/chats/${currentChatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesToStore,
          newTokens: data.tokens,
          ...(newChatCreated && { title: content.slice(0, 30) + (content.length > 30 ? '...' : '') })
        })
      });

      const updatedChat = await updateResponse.json();
      console.log('Updated chat:', updatedChat);

      if (Array.isArray(updatedChat.messages)) {
        setMessages(updatedChat.messages);
      }

      // Refresh chat list to update token counts
      const chatsResponse = await fetch('/api/chats');
      const updatedChats = await chatsResponse.json();
      setChatSessions(updatedChats);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the user message if the API call failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          chatSessions={chatSessions}
          onNewChat={() => {}}
          onSelectChat={(id) => {
            setSelectedChatId(id);
            router.push(`/chat/${id}`);
          }}
          selectedChatId={selectedChatId}
          isVoiceEnabled={isVoiceEnabled}
          onToggleVoice={() => setIsVoiceEnabled(!isVoiceEnabled)}
        />
        <main className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {isLoading ? (
              <div key="loading" className="text-white text-center p-4">Loading messages...</div>
            ) : messages && messages.length > 0 ? (
              <div key="messages" className="flex flex-col space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`mb-4 p-3 text-white max-w-[80%] ${
                      message.role === 'user'
                        ? 'ml-0 mr-auto' // User messages aligned to left
                        : 'ml-auto mr-0 italic'  // AI messages aligned to right and italic
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
            ) : (
              <div key="empty" className="text-white text-center p-4">
                Start a new conversation by typing a message below.
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <ChatInput onSendMessage={handleSendMessage} />
          </div>
        </main>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
} 