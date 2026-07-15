'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Difficulty } from '@onluyenphongvan/types';
import { apiClient } from '@/lib/api';

export default function HomePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ['questions', selectedDifficulty, selectedCategory],
    queryFn: () =>
      apiClient.getQuestions({
        ...(selectedDifficulty ? { difficulty: selectedDifficulty } : {}),
        ...(selectedCategory ? { categoryId: selectedCategory } : {}),
        limit: 15,
      }),
  });

  const difficulties: { label: string; value: Difficulty | '' }[] = [
    { label: 'All Levels', value: '' },
    { label: 'Junior (0-2 Yrs)', value: 'junior' },
    { label: 'Middle (2-4 Yrs)', value: 'middle' },
    { label: 'Senior (5+ Yrs)', value: 'senior' },
    { label: 'Staff / Principal', value: 'staff' },
  ];

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 32px' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '60px 24px',
        position: 'relative',
        marginBottom: '48px',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: '50px',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '20px',
        }}>
          ✨ Production-Ready Frontend Interview Platform v2.0
        </div>

        <h1 style={{
          fontSize: '3.8rem',
          lineHeight: 1.15,
          maxWidth: '850px',
          margin: '0 auto 24px',
        }}>
          Master Frontend Engineering with <span className="gradient-text">AI Coaching & SM-2</span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          margin: '0 auto 36px',
          lineHeight: 1.6,
        }}>
          Practice 2,000+ real interview questions from Big Tech. Built on Clean CQRS Architecture, high-concurrency MongoDB transactions, and real-time AI guidance.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href="/questions" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            Start Practicing Now →
          </Link>
          <Link href="/ai-studio" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            ⚡ Generate AI Quiz
          </Link>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginTop: '60px',
        }}>
          {[
            { label: 'Curated Questions', value: '2,000+', desc: 'React, Next.js, System Design' },
            { label: 'Target Concurrency', value: '10M Users', desc: 'CQRS + Redis + BullMQ' },
            { label: 'Spaced Repetition', value: 'SM-2 Engine', desc: 'Optimal memory retention' },
            { label: 'AI Coach Assistant', value: 'Strict Zod', desc: 'Targeted hint generation' },
          ].map((stat, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '24px', textAlign: 'left' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }} className="gradient-text">{stat.value}</span>
              <h4 style={{ fontSize: '1rem', marginTop: '4px' }}>{stat.label}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category filters */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ fontSize: '1.8rem' }}>Browse Practice Feed</h2>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() => setSelectedDifficulty(diff.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: selectedDifficulty === diff.value ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedDifficulty === diff.value ? '#000' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s',
                }}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories strip */}
        {categoriesData && categoriesData.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '28px' }}>
            <button
              onClick={() => setSelectedCategory('')}
              style={{
                padding: '8px 18px',
                borderRadius: '50px',
                background: selectedCategory === '' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: selectedCategory === '' ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                color: selectedCategory === '' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
              }}
            >
              All Categories
            </button>
            {categoriesData.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '50px',
                  background: selectedCategory === cat._id ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: selectedCategory === cat._id ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                  color: selectedCategory === cat._id ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{cat.icon ?? '📁'}</span> {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Questions list */}
        {questionsLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading questions feed with TanStack Query...
          </div>
        ) : !questionsData || questionsData.questions.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No matching questions found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Try clearing your filters or generate a tailored quiz with AI Studio.
            </p>
            <button onClick={() => { setSelectedDifficulty(''); setSelectedCategory(''); }} className="btn-primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questionsData.questions.map((q) => (
              <Link key={q._id} href={`/questions/${q.slug}`}>
                <div className="glass-card" style={{
                  padding: '22px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span className={`badge badge-${q.difficulty}`}>
                        {q.difficulty}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        TYPE: {q.type}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {q.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      Solve Question →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
