'use client';

import React from 'react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const mockGlobalRankings = [
    { rank: 1, name: 'Minh Nguyen', title: 'Principal Engineer at Grab', score: 3420, streak: 45, badges: ['🔥 Top 1%', '🏆 Master'] },
    { rank: 2, name: 'Hoang Le', title: 'Senior Frontend at Shopee', score: 3190, streak: 32, badges: ['⚡ SM-2 Pro'] },
    { rank: 3, name: 'Thu Tran', title: 'Staff Engineer at VNG', score: 2980, streak: 28, badges: ['🤖 AI Innovator'] },
    { rank: 4, name: 'David Pham', title: 'Frontend Lead at MoMo', score: 2740, streak: 21, badges: ['🌟 Contender'] },
    { rank: 5, name: 'Elena Vo', title: 'Senior Engineer at Atlassian', score: 2610, streak: 19, badges: ['🎯 Focused'] },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '12px' }} className="gradient-text">
          Global CQRS Hall of Fame
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Top engineers ranked by SM-2 mastery, contest victories, and daily practice streaks.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mockGlobalRankings.map((user) => (
            <div
              key={user.rank}
              style={{
                padding: '20px 24px',
                borderRadius: '16px',
                background: user.rank === 1 ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.15) 0%, rgba(250, 204, 21, 0.05) 100%)' : 'var(--bg-secondary)',
                border: user.rank === 1 ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: user.rank === 1 ? '#facc15' : user.rank === 2 ? '#94a3b8' : user.rank === 3 ? '#d97706' : 'rgba(255,255,255,0.08)',
                  color: user.rank <= 3 ? '#000' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                }}>
                  #{user.rank}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.title}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {user.badges.map((b, idx) => (
                    <span key={idx} className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--primary)' }}>
                      {b}
                    </span>
                  ))}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: '1.3rem', fontWeight: 800 }} className="gradient-text">
                    {user.score} pts
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                    🔥 {user.streak}-day streak
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '36px' }}>
        <Link href="/questions" className="btn-primary" style={{ padding: '14px 28px' }}>
          Practice More Questions to Climb Rank →
        </Link>
      </div>
    </div>
  );
}
