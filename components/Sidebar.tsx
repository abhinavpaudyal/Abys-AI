
import React from 'react';
import { ChatSession, User } from '../types';
import { Icons } from '../constants';

interface SidebarProps {
  user: User;
  sessions: ChatSession[];
  activeId: string;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  sessions,
  activeId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onLogout,
  isOpen,
  onClose
}) => {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-900 flex flex-col transition-transform duration-300 ease-in-out h-full
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header Section */}
        <div className="p-4 flex-shrink-0">
          <button
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl py-3 text-sm font-semibold hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
          >
            <Icons.Plus />
            New Thread
          </button>
        </div>

        {/* Scrollable History Section */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 custom-scrollbar">
          <div className="px-3 py-2 mb-1">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">History</h3>
          </div>
          
          <div className="space-y-1">
            {sessions.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="text-zinc-600 text-xs italic">No previous threads</p>
              </div>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    activeId === s.id ? 'bg-zinc-900 text-zinc-100 ring-1 ring-zinc-800' : 'text-zinc-500 hover:bg-zinc-900/40 hover:text-zinc-300'
                  }`}
                  onClick={() => { onSelectSession(s.id); onClose(); }}
                >
                  <div className={`shrink-0 ${activeId === s.id ? 'text-blue-500' : 'text-zinc-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  <span className="flex-1 text-xs truncate font-medium">{s.title || 'Untitled Thread'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(s.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded text-zinc-600 hover:text-red-500 transition-all"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fixed Footer Profile Section */}
        <div className="mt-auto p-4 border-t border-zinc-900 bg-zinc-950 flex-shrink-0">
          <div className="flex items-center gap-3 p-2.5 bg-zinc-900/30 rounded-xl border border-zinc-900/50 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-inner flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-200 truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-zinc-500 hover:bg-red-500/5 hover:text-red-400 rounded-xl transition-all"
          >
            <Icons.Logout />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
