import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bot, User as UserIcon, Send, Trash2, Sparkles, MessageSquare } from 'lucide-react';

const AIStudyAssistant = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock API delay to simulate AI typing
    setTimeout(() => {
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `I'm a mock AI assistant! I received your message: "${userMsg.content}". When the real API is connected, I'll provide detailed academic help based on your subjects and goals.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all conversation history?')) {
      setMessages([]);
    }
  };

  const examplePrompts = [
    "Explain quantum physics like I'm 5",
    "Create a study schedule for finals",
    "How do I balance assignments and projects?",
    "Summarize the French Revolution"
  ];

  return (
    <div className="animate-fade-in flex flex-col" style={{height: 'calc(100vh - 120px)', maxWidth: '900px', margin: '0 auto', paddingBottom: '1rem'}}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1 className="mb-1 flex items-center gap-2 m-0 text-gradient">
            AI Tutor <Sparkles size={24} style={{color: 'var(--accent-primary)'}} />
          </h1>
          <p className="text-muted m-0">Your 24/7 personal study companion.</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn-icon flex items-center gap-2 text-sm hover:text-danger" style={{padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text-muted)'}}>
            <Trash2 size={16} /> Clear Chat
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="glass flex-1 flex flex-col rounded-2xl overflow-hidden" style={{display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', border: '1px solid rgba(255,255,255,0.1)'}}>
        
        {/* Messages List */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto'}}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6" style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <div className="p-5 rounded-full mb-6" style={{background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)'}}>
                <Bot size={48} />
              </div>
              <h2 className="mb-2 m-0" style={{fontSize: '1.8rem'}}>Hello, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋</h2>
              <p className="text-muted max-w-md mb-8" style={{lineHeight: '1.6'}}>
                I'm your AI Study Assistant. I can help you summarize notes, explain complex concepts, or create study plans.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', width: '100%'}}>
                {examplePrompts.map((prompt, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setInput(prompt)}
                    className="p-4 rounded-xl text-left hover-card flex items-start gap-3"
                    style={{background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer'}}
                  >
                    <MessageSquare size={18} style={{color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px'}} />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`} style={{display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'}}>
                  <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`} style={{display: 'flex', gap: '1rem', maxWidth: '85%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'}}>
                    
                    {/* Avatar */}
                    <div className="flex-shrink-0 mt-1" style={{flexShrink: 0}}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                        background: msg.role === 'user' ? 'var(--accent-secondary)' : 'var(--accent-primary)',
                        color: 'white'
                      }}>
                        {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                      </div>
                    </div>
                    
                    {/* Bubble */}
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'}}>
                      <div className="p-4 rounded-2xl" style={{
                        background: msg.role === 'user' ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.05)',
                        color: 'white',
                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                        borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                        lineHeight: '1.5',
                        fontSize: '0.95rem'
                      }}>
                        {msg.content}
                      </div>
                      <span className="text-xs text-muted mt-1" style={{fontSize: '0.7rem', marginTop: '0.3rem', opacity: 0.7}}>{msg.timestamp}</span>
                    </div>
                    
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex w-full justify-start" style={{display: 'flex'}}>
                  <div className="flex gap-3 max-w-[80%] flex-row" style={{display: 'flex', gap: '1rem'}}>
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'var(--accent-primary)', color: 'white'}}>
                        <Bot size={16} />
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl flex items-center gap-2" style={{background: 'rgba(255,255,255,0.05)', borderBottomLeftRadius: '4px', height: '46px'}}>
                      <div className="w-2 h-2 rounded-full" style={{background: 'var(--text-muted)', borderRadius: '50%', width: '6px', height: '6px', animation: 'pulse 1s infinite'}} />
                      <div className="w-2 h-2 rounded-full" style={{background: 'var(--text-muted)', borderRadius: '50%', width: '6px', height: '6px', animation: 'pulse 1s infinite 0.2s'}} />
                      <div className="w-2 h-2 rounded-full" style={{background: 'var(--text-muted)', borderRadius: '50%', width: '6px', height: '6px', animation: 'pulse 1s infinite 0.4s'}} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4" style={{borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)'}}>
          <form onSubmit={handleSend} className="relative flex items-center" style={{display: 'flex', position: 'relative'}}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your studies..."
              className="w-full p-4 pr-14 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: 'white',
                outline: 'none',
                paddingRight: '3.5rem',
                fontSize: '1rem'
              }}
              disabled={isTyping}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: input.trim() && !isTyping ? 'var(--accent-primary)' : 'transparent',
                color: input.trim() && !isTyping ? 'white' : 'var(--text-muted)',
                right: '0.5rem',
                border: 'none',
                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed'
              }}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default AIStudyAssistant;
