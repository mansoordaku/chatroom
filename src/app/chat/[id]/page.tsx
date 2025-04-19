'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import ChatPage from '@/app/chat/page';

export default function DynamicChatPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  useEffect(() => {
    // Check if chat exists using the API
    fetch(`/api/chats/${resolvedParams.id}`)
      .catch(() => {
        // If chat doesn't exist, redirect to main chat page
        router.push('/chat');
      });
  }, [resolvedParams.id, router]);

  return <ChatPage initialChatId={resolvedParams.id} />;
} 