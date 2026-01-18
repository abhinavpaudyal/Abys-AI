
import React, { useState, useEffect, useCallback } from 'react';
import { User, ChatSession } from './types';
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { Icons } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    const savedSessions = localStorage.getItem('nexus_sessions');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) setActiveSessionId(parsed[0].id);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('nexus_user', JSON.stringify(user));
      localStorage.setItem('nexus_sessions', JSON.stringify(sessions));
    } else {
      localStorage.removeItem('nexus_user');
      localStorage.removeItem('nexus_sessions');
    }
  }, [user, sessions]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    setSessions([]);
    setActiveSessionId(null);
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Discussion',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
  };

  const updateSession = useCallback((updated: ChatSession) => {
    setSessions(prev => prev.map(s => s.id === updated.id ? {
      ...updated,
      title: (updated.messages.length > 0 && updated.messages[0].role === 'user') 
        ? (updated.messages[0].content.slice(0, 30) + (updated.messages[0].content.length > 30 ? '...' : ''))
        : updated.title
    } : s));
  }, []);

  const deleteSession = (id: string) => {
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  if (!user) {
    return <AuthForm onAuthSuccess={handleLogin} />;
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="flex h-full w-full bg-black text-zinc-100 overflow-hidden">
      <Sidebar
        user={user}
        sessions={sessions}
        activeId={activeSessionId || ''}
        onNewChat={createNewChat}
        onSelectSession={setActiveSessionId}
        onDeleteSession={deleteSession}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
        {/* Mobile Header */}
        <header className="h-14 lg:hidden flex items-center px-4 border-b border-zinc-900 bg-black flex-shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <Icons.Menu />
          </button>
          <span className="ml-3 font-semibold text-sm">Abys AI</span>
        </header>

        <main className="flex-1 flex flex-col min-h-0 relative">
          {activeSession ? (
            <ChatWindow
              session={activeSession}
              onUpdateSession={updateSession}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
               <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-8 border border-zinc-800 shadow-xl">
                  <Icons.Bot />
               </div>
               <h1 className="text-4xl font-bold mb-4 tracking-tight">How can I help you?</h1>
               <p className="text-zinc-500 mb-8 text-lg">
                 Start a new session to experience our advanced AI-powered reasoning.
               </p>
               <button
                 onClick={createNewChat}
                 className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all shadow-lg active:scale-95"
               >
                 <Icons.Plus />
                 Start Conversation
               </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
