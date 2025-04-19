export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

export interface ChatMetadata {
  id: string;
  title: string;
  timestamp: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
}

export interface ChatSession extends ChatMetadata {
  messages: ChatMessage[];
} 