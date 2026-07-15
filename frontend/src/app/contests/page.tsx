'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export default function ContestsIndexPage() {
  const { data: contests, isLoading } = useQuery({
    queryKey: ['contests'],
    queryFn: () => apiClient.getContests(),
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '12px' }} className="gradient-text">
          Live Interview Contests
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
          Compete with thousands of frontend engineers across live timed coding arenas with real-time WebSocket leaderboard updates.
        </p>
      </div>

      {isLoading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading contest arenas...</div>
      ) : !contests || contests.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <h3>No contests currently active or scheduled</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Check back shortly for upcoming weekly weekend sprint arenas.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {contests.map((c) => (
            <div key={c._id} className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span className="badge" style={{
                    background: c.status === 'live' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                    color: c.status === 'live' ? '#34d399' : '#38bdf8',
                  }}>
                    ● {c.status.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {c.questionIds.length} Questions
                  </span>
                </div>

                <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>{c.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
                  {c.description}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>START TIME:</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {new Date(c.startTime).toLocaleDateString()} {new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <Link href={`/contests/${c._id}`} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                  Enter Arena →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
