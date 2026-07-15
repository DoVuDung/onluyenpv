'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedFollowUp?: string[];
}

export function AiCoachDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Coach powered by strict Zod validation. Ask me for architecture advice, concept explanations (e.g. React 19 Server Components, Virtual DOM), or coding challenge hints!',
      suggestedFollowUp: [
        'How should I optimize large list rendering in React?',
        'Explain React 19 useActionState and Server Actions.',
        'What is the best way to handle CQRS in large frontend monorepos?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend ?? input;
    if (!query.trim() || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: query.trim() },
    ];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await apiClient.aiCoach({
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          ...(res.suggestedFollowUpQuestions ? { suggestedFollowUp: res.suggestedFollowUpQuestions } : {}),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error answering your inquiry. Please make sure you are signed in or try again shortly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
          color: '#fff',
          padding: '14px 22px',
          borderRadius: '50px',
          fontWeight: 700,
          fontSize: '0.95rem',
          boxShadow: '0 8px 30px rgba(168, 85, 247, 0.4)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s ease',
        }}
        className="animate-glow"
      >
        AI Coach Assistant
      </button>

      {/* Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '440px',
          maxWidth: '90vw',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid var(--border-glow)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6)',
          zIndex: 90,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Drawer Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#fff',
              }}>
                AI
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>AI Interview Coach</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'block' }}>
                  ● Active • Strict Zod Validation
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', padding: '4px' }}
            >
              ×
            </button>
          </div>

          {/* Messages list */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '16px',
                    background: m.role === 'user' ? 'var(--primary)' : 'var(--bg-surface)',
                    color: m.role === 'user' ? '#000' : 'var(--text-primary)',
                    fontWeight: m.role === 'user' ? 600 : 400,
                    fontSize: '0.92rem',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border-color)',
                    borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '16px',
                    lineHeight: 1.5,
                  }}
                >
                  {m.content}
                </div>

                {m.suggestedFollowUp && m.suggestedFollowUp.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Suggested Follow-ups:
                    </span>
                    {m.suggestedFollowUp.map((q, qIndex) => (
                      <button
                        key={qIndex}
                        onClick={() => handleSend(q)}
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          color: 'var(--primary)',
                          fontSize: '0.82rem',
                          transition: 'all 0.2s',
                        }}
                      >
                        💡 {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '12px 18px', background: 'var(--bg-surface)', borderRadius: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                AI Coach is thinking...
              </div>
            )}
          </div>

          {/* Input box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            style={{
              padding: '16px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '10px',
            }}
          >
            <input
              type="text"
              placeholder="Ask anything about frontend architecture..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-accent"
              style={{ padding: '12px 18px', opacity: loading || !input.trim() ? 0.6 : 1 }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
