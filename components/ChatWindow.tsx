
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, ChatSession } from '../types';
import { Icons } from '../constants';
import { getGeminiResponse } from '../services/geminiService';

interface ChatWindowProps {
  session: ChatSession;
  onUpdateSession: (updated: ChatSession) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ session, onUpdateSession }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    scrollToBottom(session.messages.length <= 1 ? 'auto' : 'smooth');
  }, [session.messages.length, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    const updatedMessages = [...session.messages, userMessage];
    onUpdateSession({ ...session, messages: updatedMessages });
    setInput('');
    setIsTyping(true);

    const history = session.messages.slice(-10).map(m => ({
      role: m.role,
      parts: m.content
    }));

    const response = await getGeminiResponse(input, history);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    };

    onUpdateSession({ ...session, messages: [...updatedMessages, botMessage] });
    setIsTyping(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black overflow-hidden">
      {/* Message List Area */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-4 py-6 md:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {session.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-20 opacity-80">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800 shadow-xl">
                <Icons.Bot />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Abys Assistant</h2>
              <p className="text-zinc-500 text-sm">Send a message to start our conversation.</p>
            </div>
          ) : (
            session.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
              >
                <div className={`flex gap-3 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm ${
                    msg.role === 'user' ? 'bg-zinc-800 border-zinc-700' : 'bg-blue-600/10 border-blue-600/20 text-blue-500'
                  }`}>
                    {msg.role === 'user' ? <Icons.User /> : <Icons.Bot />}
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-[14.5px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' 
                      : 'bg-transparent text-zinc-300'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex justify-start animate-in fade-in">
              <div className="flex gap-3 items-center">
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border bg-blue-600/10 border-blue-600/20 text-blue-500 animate-pulse">
                  <Icons.Bot />
                </div>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Docked Area */}
      <div className="border-t border-zinc-900 bg-black p-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2 focus-within:border-zinc-700 transition-all shadow-inner">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message here..."
              className="flex-1 bg-transparent border-none px-3 py-2 text-sm focus:outline-none resize-none max-h-48 overflow-y-auto text-zinc-200 placeholder:text-zinc-600"
              style={{ minHeight: '40px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`p-2 rounded-lg transition-all flex-shrink-0 mb-1 mr-1 ${
                input.trim() && !isTyping 
                ? 'bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-md' 
                : 'bg-zinc-800 text-zinc-700 opacity-50 cursor-not-allowed'
              }`}
            >
              <Icons.Send />
            </button>
          </div>
          <div className="mt-2 text-center">
            <span className="text-[10px] text-zinc-700 font-semibold tracking-tighter uppercase">
              Abys AI can make mistakes. Verify important info.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
