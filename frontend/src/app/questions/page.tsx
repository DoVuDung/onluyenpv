'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { QuestionFilter, Difficulty } from '@onluyenphongvan/types';
import { apiClient } from '@/lib/api';

export default function QuestionsIndexPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [cursor, setCursor] = useState<string | null>(null);

  const filter: QuestionFilter = {
    ...(difficulty ? { difficulty } : {}),
    ...(typeFilter ? { type: typeFilter as 'multiple-choice' | 'fill-blank' | 'code-output' | 'coding-challenge' } : {}),
    ...(cursor ? { cursor } : {}),
    limit: 20,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['questions-page', filter],
    queryFn: () => apiClient.getQuestions(filter),
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }} className="gradient-text">
            All Practice Questions
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Filter by difficulty, question format, and track your SM-2 retention.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value as Difficulty | ''); setCursor(null); }}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
            }}
          >
            <option value="">All Difficulties</option>
            <option value="junior">Junior</option>
            <option value="middle">Middle</option>
            <option value="senior">Senior</option>
            <option value="staff">Staff</option>
            <option value="principal">Principal</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCursor(null); }}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
            }}
          >
            <option value="">All Question Types</option>
            <option value="multiple-choice">Multiple Choice</option>
            <option value="fill-blank">Fill in the Blank</option>
            <option value="code-output">Predict Code Output</option>
            <option value="coding-challenge">Coding Challenge</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading practice questions...
        </div>
      ) : !data || data.questions.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <h3>No questions match your current filters</h3>
          <button onClick={() => { setDifficulty(''); setTypeFilter(''); setCursor(null); }} className="btn-primary" style={{ marginTop: '16px' }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.questions.map((q) => (
            <Link key={q._id} href={`/questions/${q.slug}`}>
              <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <span className={`badge badge-${q.difficulty}`}>{q.difficulty}</span>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>{q.type}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{q.title}</h3>
                </div>
                <span className="btn-secondary" style={{ padding: '8px 16px' }}>Solve →</span>
              </div>
            </Link>
          ))}

          {data.nextCursor && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={() => setCursor(data.nextCursor)}
                className="btn-secondary"
                style={{ padding: '12px 24px' }}
              >
                Load Next Page →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
