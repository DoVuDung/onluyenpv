'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', submittedQuery],
    queryFn: () => apiClient.search(submittedQuery),
    enabled: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(query);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.6rem', marginBottom: '12px' }} className="gradient-text">
          Search Practice Database
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Powered by Meilisearch high-speed indexing + exact MongoDB domain fallback.
        </p>

        <form onSubmit={handleSearch} style={{ maxWidth: '640px', margin: '28px auto 0', display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords: React Server Actions, Virtual DOM, closure..."
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
            }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '14px 28px' }}>
            Search
          </button>
        </form>
      </div>

      {isLoading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>Querying Meilisearch engine...</div>
      ) : !results || results.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <h3>No matching questions found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try broadening your search query or generate custom questions in AI Studio.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {results.map((q) => (
            <Link key={q._id} href={`/questions/${q.slug}`}>
              <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <span className={`badge badge-${q.difficulty}`}>{q.difficulty}</span>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.08)' }}>{q.type}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{q.title}</h3>
                </div>
                <span className="btn-secondary" style={{ padding: '8px 16px' }}>Solve →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
