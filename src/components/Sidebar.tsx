import { ChatMetadata } from '@/types/chat';

interface SidebarProps {
  chatSessions: ChatMetadata[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  selectedChatId?: string;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
}

function formatTokenCount(count: number): string {
  return (count / 1000).toFixed(1) + 'k';
}

export default function Sidebar({ 
  chatSessions, 
  onNewChat, 
  onSelectChat, 
  selectedChatId,
  isVoiceEnabled,
  onToggleVoice
}: SidebarProps) {
  return (
    <div className="w-64 h-full bg-black border-r border-white flex flex-col">
      <button
        onClick={onNewChat}
        className="m-4 p-3 border border-white text-white hover:bg-purple-800 hover:text-white transition-colors"
      >
        + New conversation
      </button>
      
      <button
        onClick={onToggleVoice}
        className={`mx-4 mb-4 p-3 border border-white text-white transition-colors ${
          isVoiceEnabled ? 'bg-purple-800' : 'hover:bg-purple-800'
        }`}
      >
        Voice {isVoiceEnabled ? 'On' : 'Off'}
      </button>
      
      <div className="flex-1 overflow-y-auto">
        {chatSessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectChat(session.id)}
            className={`w-full p-3 text-left text-white transition-colors ${
              selectedChatId === session.id 
                ? 'bg-black border-t border-b border-white hover:bg-purple-800' 
                : 'hover:bg-white hover:text-black'
            }`}
          >
            <div className="font-medium">{session.title}</div>
            <div className="text-xs mt-1 opacity-70">
              Tokens: {formatTokenCount(session.tokenUsage.input)} in / {formatTokenCount(session.tokenUsage.output)} out / {formatTokenCount(session.tokenUsage.total)} total
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 