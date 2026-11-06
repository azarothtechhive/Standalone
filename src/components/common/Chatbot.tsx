import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Minimize2, Maximize2, Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import faviconImg from '../../assets/Favicon.png';
import { useCMS } from '../../context/CMSContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  buttons?: Array<{ label: string; action: string }>;
}

interface BotResponse {
  text: string;
  buttons?: Array<{ label: string; action: string }>;
}

export const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useCMS();
  const chatbotConfig = settings?.chatbotConfig;
  const isEnabled = chatbotConfig?.isEnabled ?? true;

  const botDisplayName = chatbotConfig?.botName || 'Azaroth AI Guide';
  const botDisplayRole = chatbotConfig?.botRole || 'Automated engineering assistant';
  const defaultWelcome = chatbotConfig?.welcomeMessage || "Hello! I'm the automated Azaroth site guide. Ask me about our platforms, engineering services or how to reach the team.";
  const quickPromptsList = chatbotConfig?.quickPrompts && chatbotConfig.quickPrompts.length > 0
    ? chatbotConfig.quickPrompts.filter(p => !p.toLowerCase().includes('rfq') && !p.toLowerCase().includes('quote'))
    : ['Explore Products', 'Explore Services', 'Our Portfolio', 'Connect With Us'];
  const supportEmail = chatbotConfig?.supportEmail || settings?.supportEmail || 'hello@azaroth-techhive.com';
  const supportPhone = chatbotConfig?.supportPhone || settings?.phone || '+91 6379480931';

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: defaultWelcome,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<number | undefined>(undefined);
  const launchButtonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Sync welcome message if changed in settings
  useEffect(() => {
    if (chatbotConfig?.welcomeMessage) {
      setMessages((prev) => {
        if (prev.length === 1 && prev[0].id === '1') {
          return [{ ...prev[0], text: chatbotConfig.welcomeMessage }];
        }
        return prev;
      });
    }
  }, [chatbotConfig?.welcomeMessage]);

  const scrollToBottom = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    messagesEndRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isMinimized]);

  useEffect(() => () => window.clearTimeout(replyTimerRef.current), []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        launchButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const generateBotResponse = (userMessage: string): BotResponse => {
    const lowerMessage = userMessage.toLowerCase();

    // Check CMS custom Q&A knowledge base first
    if (chatbotConfig?.knowledgeBase && chatbotConfig.knowledgeBase.length > 0) {
      for (const item of chatbotConfig.knowledgeBase) {
        if (!item.response) continue;
        const triggers = Array.isArray(item.triggerKeywords)
          ? item.triggerKeywords
          : typeof (item as any).triggerKeywords === "string"
            ? ((item as any).triggerKeywords as string).split(",").map((s: string) => s.trim())
            : [];
        const matches = triggers.some((trigger) =>
          trigger && lowerMessage.includes(trigger.trim().toLowerCase())
        );
        if (matches) {
          return {
            text: item.response,
            buttons: item.buttons && item.buttons.length > 0 ? item.buttons : undefined,
          };
        }
      }
    }

    if (lowerMessage.includes('product') || lowerMessage.includes('platform')) {
      return {
        text: 'We offer enterprise software platforms including Fitness Management System (FMS), Omnichannel Commerce Platform, and Learning Management Platform (LMP). You can explore them on our Products page.',
        buttons: [{ label: 'Explore Products', action: '/products' }],
      };
    }
    if (lowerMessage.includes('service') || lowerMessage.includes('consulting') || lowerMessage.includes('engineering')) {
      return {
        text: 'We provide comprehensive software engineering services including Full-Stack Web Development, Native & Cross-Platform Mobile Apps, Cloud & DevOps Solutions, and Strategic Consulting.',
        buttons: [{ label: 'Explore Services', action: '/services' }],
      };
    }
    if (lowerMessage.includes('quote') || lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('rfq')) {
      return {
        text: 'For project inquiries, tailored architectures, and enterprise estimates, please connect with our solutions team directly.',
        buttons: [{ label: 'Connect With Us', action: '/connect-with-us' }],
      };
    }
    if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone') || lowerMessage.includes('reach')) {
      return {
        text: `You can reach us directly at ${supportEmail} or call ${supportPhone}. You can also connect via our consultation portal.`,
        buttons: [{ label: 'Connect With Us', action: '/connect-with-us' }],
      };
    }
    if (lowerMessage.includes('about') || lowerMessage.includes('company') || lowerMessage.includes('who')) {
      return {
        text: 'Azaroth Tech-Hive engineers, evolves, and sustains intelligent software solutions, delivering end-to-end engineering excellence across global enterprises.',
        buttons: [{ label: 'About Us', action: '/about' }],
      };
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return {
        text: `Hello! Welcome to Azaroth Tech-Hive. I'm ${botDisplayName}. How can I assist you with your software engineering requirements today?`,
      };
    }
    if (lowerMessage.includes('thank')) {
      return {
        text: 'You\'re very welcome! Let us know if you need any technical guidance or wish to schedule a consultation.',
      };
    }

    return {
      text: 'Thank you for your question. You can explore our software solutions, review our delivery framework, or connect with our engineering team directly.',
      buttons: [
        { label: 'Our Portfolio', action: '/portfolio' },
        { label: 'Connect With Us', action: '/connect-with-us' },
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const messageContent = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageContent,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (textToSend === undefined) {
      setInputText('');
    }
    setIsTyping(true);

    window.clearTimeout(replyTimerRef.current);
    replyTimerRef.current = window.setTimeout(() => {
      const botResponse = generateBotResponse(userMessage.text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        buttons: botResponse.buttons,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 600);
  };

  const handleButtonClick = (action: string) => {
    navigate(action);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button (Theme Driven - Crimson Red) */}
      {!isOpen && (
        <button
          ref={launchButtonRef}
          onClick={() => setIsOpen(true)}
          aria-label={`Open the ${botDisplayName}`}
          style={{
            position: 'fixed',
            bottom: 'clamp(1rem, 4vw, 2rem)',
            right: 'clamp(1rem, 4vw, 2rem)',
            width: 'clamp(3rem, 6vw, 3.5rem)',
            height: 'clamp(3rem, 6vw, 3.5rem)',
            borderRadius: '50%',
            background: 'var(--gradient-button)',
            color: '#FFFFFF',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(73, 36, 63, 0.45)',
            transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 1000,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.background = 'var(--gradient-button-hover)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(73, 36, 63, 0.65)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'var(--gradient-button)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(73, 36, 63, 0.45)';
          }}
        >
          <MessageSquare size={20} style={{ color: '#FFFFFF' }} aria-hidden="true" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="chat-assistant-title"
          aria-describedby="chat-assistant-note"
          style={{
            position: 'fixed',
            bottom: 'clamp(1rem, 4vw, 2rem)',
            right: 'clamp(1rem, 4vw, 2rem)',
            width: isMinimized ? 'min(280px, calc(100vw - 2rem))' : 'min(380px, calc(100vw - 2rem))',
            maxWidth: 'calc(100vw - 2rem)',
            maxHeight: isMinimized ? 'auto' : 'min(580px, calc(100vh - 6rem))',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25), 0 0 1px rgba(73, 36, 63, 0.4)',
            border: '1px solid #FFE4E6',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 180ms ease-out',
          }}
        >
          {/* Header in Brand Theme Gradient */}
          <div
            style={{
              background: '#49243F',
              padding: 'clamp(0.75rem, 2vw, 1rem)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 1.5vw, 0.75rem)' }}>
              <img
                src={faviconImg}
                alt={botDisplayName}
                style={{
                  width: 'clamp(2rem, 4vw, 2.5rem)',
                  height: 'clamp(2rem, 4vw, 2.5rem)',
                  borderRadius: '8px',
                  objectFit: 'contain',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                }}
              />
              <div>
                <div id="chat-assistant-title" style={{ color: '#FFFFFF', fontWeight: 600, fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)' }}>
                  {botDisplayName}
                </div>
                <div style={{ color: '#FFE4E6', fontSize: 'clamp(0.6875rem, 1.5vw, 0.75rem)', fontWeight: 500 }}>
                  {botDisplayRole}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'clamp(0.375rem, 1vw, 0.5rem)' }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label={isMinimized ? 'Expand site guide' : 'Minimize site guide'}
                style={{
                  width: 'clamp(1.75rem, 4vw, 2rem)',
                  height: 'clamp(1.75rem, 4vw, 2rem)',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 180ms ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                {isMinimized ? <Maximize2 size={16} aria-hidden="true" /> : <Minimize2 size={16} aria-hidden="true" />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  launchButtonRef.current?.focus();
                }}
                aria-label="Close site guide"
                style={{
                  width: 'clamp(1.75rem, 4vw, 2rem)',
                  height: 'clamp(1.75rem, 4vw, 2rem)',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 180ms ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div
                style={{
                  flex: 1,
                  padding: '1rem',
                  overflowY: 'auto',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  maxHeight: '400px',
                }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      gap: '0.5rem',
                    }}
                  >
                    {message.sender === 'bot' && (
                      <div
                        style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '8px',
                          backgroundColor: '#FFF1F2',
                          color: '#49243F',
                          border: '1px solid #FFE4E6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        <Bot size={14} />
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: '78%',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        backgroundColor: message.sender === 'user' ? '#49243F' : '#FFFFFF',
                        color: message.sender === 'user' ? '#FFFFFF' : '#1E293B',
                        border: message.sender === 'user' ? '1px solid #49243F' : '1px solid #E2E8F0',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      {message.text}
                      <div
                        style={{
                          fontSize: '0.6875rem',
                          marginTop: '0.25rem',
                          opacity: 0.65,
                          textAlign: message.sender === 'user' ? 'right' : 'left',
                        }}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                      {message.buttons && message.buttons.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            marginTop: '0.75rem',
                          }}
                        >
                          {message.buttons.map((button, index) => (
                            <button
                              key={index}
                              onClick={() => handleButtonClick(button.action)}
                              style={{
                                padding: '0.45rem 0.85rem',
                                borderRadius: '9999px',
                                border: 'none',
                                background: 'var(--gradient-button)',
                                color: '#FFFFFF',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 180ms ease-out',
                                boxShadow: '0 2px 6px rgba(73, 36, 63, 0.3)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.filter = 'brightness(1.15)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.filter = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              {button.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {message.sender === 'user' && (
                      <div
                        style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '50%',
                          backgroundColor: '#49243F',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <User size={14} style={{ color: '#FFFFFF' }} />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '8px',
                        backgroundColor: '#FFF1F2',
                        color: '#49243F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Bot size={14} />
                    </div>
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        gap: '0.25rem',
                      }}
                    >
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#49243F',
                          animation: 'bounce 1s infinite',
                        }}
                      />
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#49243F',
                          animation: 'bounce 1s infinite 0.2s',
                        }}
                      />
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#49243F',
                          animation: 'bounce 1s infinite 0.4s',
                        }}
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderTop: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {/* Quick Prompt Chips */}
                {quickPromptsList && quickPromptsList.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.625rem' }}>
                    {quickPromptsList.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        style={{
                          padding: '0.25rem 0.625rem',
                          borderRadius: '9999px',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          backgroundColor: '#FFF1F2',
                          color: '#49243F',
                          border: '1px solid #FECDD3',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#49243F';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFF1F2';
                          e.currentTarget.style.color = '#49243F';
                        }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    style={{
                      flex: 1,
                      padding: '0.625rem 0.875rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 180ms ease-out',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#49243F';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                    aria-label="Send message"
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: inputText.trim() ? 'var(--gradient-button)' : '#E2E8F0',
                      color: inputText.trim() ? '#FFFFFF' : '#94A3B8',
                      cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: inputText.trim() ? '0 2px 8px rgba(73, 36, 63, 0.4)' : 'none',
                      transition: 'all 180ms ease-out',
                    }}
                    onMouseEnter={(e) => {
                      if (inputText.trim()) e.currentTarget.style.filter = 'brightness(1.15)';
                    }}
                    onMouseLeave={(e) => {
                      if (inputText.trim()) e.currentTarget.style.filter = 'none';
                    }}
                  >
                    <Send size={15} />
                  </button>
                </div>
                <div
                  id="chat-assistant-note"
                  style={{
                    fontSize: '0.6875rem',
                    color: '#64748B',
                    textAlign: 'center',
                    marginTop: '0.5rem',
                  }}
                >
                  Replies are automated guidance. For custom solutions, connect with our engineering team.
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;
