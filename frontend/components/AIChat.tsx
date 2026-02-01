import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Minimize2, User } from 'lucide-react';
import { Product } from '../types';
import { aiApi } from '../services/api';
import { useProducts } from '../hooks/useQueries';

interface AIChatProps { }

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

const AIChat: React.FC<AIChatProps> = () => {
  const { data: productsData } = useProducts({ limit: 100 });
  const products = productsData?.products || [];
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I\'m your Visionary AI assistant powered by Llama 3.3. Ask me anything about your inventory or business strategy.', timestamp: Date.now() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const getDemoResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('expir')) {
      const expiring = products.filter(p => {
        const days = Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days <= 7;
      });
      return `You have ${expiring.length} products expiring within 7 days: ${expiring.map(p => p.name).join(', ') || 'None detected'}. Consider promotional discounts to accelerate sales.`;
    }

    if (lowerMessage.includes('stock') || lowerMessage.includes('inventory')) {
      const lowStock = products.filter(p => p.quantity < 10);
      return `Current inventory: ${products.length} active products. ${lowStock.length} items are running low. Consider reordering: ${lowStock.map(p => p.name).join(', ') || 'All items well stocked'}.`;
    }

    if (lowerMessage.includes('profit') || lowerMessage.includes('margin')) {
      const avgMargin = products.length > 0
        ? products.reduce((sum, p) => sum + ((p.sellingPrice - p.costPrice) / p.sellingPrice * 100), 0) / products.length
        : 0;
      return `Your average profit margin is ${avgMargin.toFixed(1)}%. To improve: 1) Reduce slow-moving inventory, 2) Negotiate better supplier rates, 3) Optimize product mix based on velocity.`;
    }

    return `I can see you have ${products.length} products in inventory. Ask me about expiring items, stock levels, profit margins, or business strategy!`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: Date.now() }]);
    setIsTyping(true);

    try {
      // Call backend AI API (Groq Llama 3.3 70B)
      const chatHistory = messages.map((m: Message) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        text: m.text,
        timestamp: m.timestamp
      }));

      const result = await aiApi.chat(userMsg, chatHistory);

      if (result.success && result.data) {
        setMessages((prev: Message[]) => [...prev, {
          role: 'model',
          text: result.data!.response,
          timestamp: result.data!.timestamp
        }]);
      } else {
        // Fallback to demo response if API fails
        const demoResponse = getDemoResponse(userMsg);
        setMessages((prev: Message[]) => [...prev, {
          role: 'model',
          text: demoResponse,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev: Message[]) => [...prev, { role: 'model', text: "Sorry, I encountered an error connecting to the AI service. Please try again.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all transform hover:scale-105 ${isOpen
          ? 'bg-slate-800 text-white rotate-90'
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30'
          }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 h-[500px]">
          {/* Header */}
          <div className="bg-slate-900 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Visionary AI</h3>
                <p className="text-xs text-indigo-200 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} title="Close chat" className="text-slate-400 hover:text-white">
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
            {messages.map((msg: Message, idx: number) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-sm'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700 max-w-[80%] flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about inventory..."
                className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-xl text-sm focus:outline-none dark:text-white transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                title="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;