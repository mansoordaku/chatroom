interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
}

interface SidebarProps {
  chatSessions: ChatSession[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  selectedChatId?: string;
}

export default function Sidebar({ 
  chatSessions, 
  onNewChat, 
  onSelectChat, 
  selectedChatId 
}: SidebarProps) {
  return (
    <div className="w-64 h-full bg-black border-r border-white flex flex-col">
      <button
        onClick={onNewChat}
        className="m-4 p-3 border border-white text-white hover:bg-white hover:text-black transition-colors"
      >
        + New conversation
      </button>
      
      <div className="flex-1 overflow-y-auto">
        {chatSessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectChat(session.id)}
            className={`w-full p-3 text-left text-white hover:bg-white hover:text-black transition-colors ${
              selectedChatId === session.id ? 'bg-white text-black' : ''
            }`}
          >
            {session.title}
          </button>
        ))}
      </div>
    </div>
  );
} 