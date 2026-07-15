'use client';

import React, { useState } from 'react';
import { Difficulty, QuestionOption } from '@onluyenphongvan/types';
import { apiClient } from '@/lib/api';

export default function AiStudioPage() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('middle');
  const [count, setCount] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<{
    title: string;
    markdown: string;
    explanation: string;
    options: QuestionOption[];
  }[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);

    try {
      const res = await apiClient.aiGenerateQuiz({
        categoryId: 'general',
        topicId: topic.trim(),
        difficulty,
        count,
      });
      setGeneratedQuestions(res);
    } catch (err) {
      if (err instanceof Error) alert(`AI Generation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: '50px',
          background: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          color: 'var(--accent)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '16px',
        }}>
          ⚡ Powered by Central AI Gateway & Strict Zod Validation
        </div>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '12px' }} className="gradient-text">
          AI Quiz Studio
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto' }}>
          Input any specialized frontend topic (e.g. Next.js 16 Partial Prerendering, Web Workers, CSS Grid Subgrid) and let our AI generate tailored multiple-choice quizzes with detailed explanations.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '36px', marginBottom: '40px', border: '1px solid var(--border-glow)' }}>
        <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 1fr)', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Target Frontend Topic:
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. React 19 Server Actions"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Seniority Level:
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
              }}
            >
              <option value="junior">Junior</option>
              <option value="middle">Middle</option>
              <option value="senior">Senior</option>
              <option value="staff">Staff / Principal</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Questions:
            </label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
              }}
            >
              <option value={2}>2 Questions</option>
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="btn-accent"
            style={{ padding: '14px', justifyContent: 'center', fontSize: '1rem' }}
          >
            {loading ? 'Generating...' : '✨ Generate'}
          </button>
        </form>
      </div>

      {generatedQuestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '1.8rem' }}>Generated Quizzes ({generatedQuestions.length})</h2>
          {generatedQuestions.map((q, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <span className="badge badge-middle">AI GENERATED</span>
                <span className={`badge badge-${difficulty}`}>{difficulty.toUpperCase()}</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>{q.title}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                {q.markdown}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {q.options.map((opt) => (
                  <div key={opt.id} style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: opt.correct ? 'rgba(52, 211, 153, 0.15)' : 'var(--bg-secondary)',
                    border: opt.correct ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid var(--border-color)',
                    color: opt.correct ? '#34d399' : 'var(--text-primary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span>{opt.content}</span>
                    {opt.correct && <span style={{ fontWeight: 700 }}>✓ Correct Option</span>}
                  </div>
                ))}
              </div>

              <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.04)', borderLeft: '4px solid var(--accent)' }}>
                <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '4px' }}>AI Explanation:</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{q.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
