'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { Ranking } from '@onluyenphongvan/types';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3001';

export default function ContestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<Ranking[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [submittedAnswer, setSubmittedAnswer] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const startTime = React.useRef(Date.now());

  const { data: contest, isLoading: contestLoading } = useQuery({
    queryKey: ['contest', params.id],
    queryFn: () => apiClient.getContest(params.id),
  });

  // Connect WebSocket & subscribe to realtime leaderboard
  useEffect(() => {
    const socket: Socket = io(SOCKET_URL);
    socket.emit('joinContest', { contestId: params.id });

    socket.on('leaderboard:update', (updated: Ranking[]) => {
      setLeaderboard(updated);
    });

    return () => {
      socket.disconnect();
    };
  }, [params.id]);

  useEffect(() => {
    if (contest && contest.questionIds.length > 0 && !selectedQuestionId) {
      const firstId = contest.questionIds[0];
      if (firstId) setSelectedQuestionId(firstId);
    }
  }, [contest, selectedQuestionId]);

  if (contestLoading) {
    return <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>Entering Contest Arena...</div>;
  }

  if (!contest) {
    return <div style={{ padding: '80px', textAlign: 'center' }}>Contest not found</div>;
  }

  const handleContestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('You must be signed in to submit answers to live contests.');
      return;
    }
    if (!submittedAnswer.trim()) return;

    setSubmitting(true);
    const durationMs = Date.now() - startTime.current;

    try {
      await apiClient.submitContestAnswer({
        contestId: contest._id,
        questionId: selectedQuestionId,
        submittedAnswer: submittedAnswer.trim(),
        durationMs,
      });
      setSubmittedAnswer('');
      alert('Answer submitted! Multi-document transaction processed.');
    } catch (err) {
      if (err instanceof Error) alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 32px' }}>
      <div className="glass-card" style={{ padding: '32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="badge badge-middle" style={{ marginBottom: '8px', display: 'inline-block' }}>
            ● ARENA STATUS: {contest.status.toUpperCase()}
          </span>
          <h1 style={{ fontSize: '2.2rem' }}>{contest.title}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>{contest.description}</p>
        </div>
        <div style={{ textAlign: 'right', background: 'rgba(56, 189, 248, 0.1)', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--border-glow)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>LIVE LEADERBOARD SOCKET</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>Connected ⚡</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '32px' }}>
        {/* Left column: Question selector and submit workspace */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Contest Questions</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {contest.questionIds.map((qId: string, index: number) => (
              <button
                key={qId}
                onClick={() => { setSelectedQuestionId(qId); startTime.current = Date.now(); }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: selectedQuestionId === qId ? 'var(--primary)' : 'var(--bg-secondary)',
                  color: selectedQuestionId === qId ? '#000' : 'var(--text-primary)',
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                }}
              >
                Problem #{index + 1}
              </button>
            ))}
          </div>

          <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Problem ID: {selectedQuestionId}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Solve the coding challenge or conceptual question associated with this arena problem. Submit your solution below to gain instant leaderboard rank delta.
            </p>
          </div>

          <form onSubmit={handleContestSubmit}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Your Solution Answer / Code Output:
            </label>
            <input
              type="text"
              required
              value={submittedAnswer}
              onChange={(e) => setSubmittedAnswer(e.target.value)}
              placeholder="Enter answer option ID or solution text..."
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                marginBottom: '16px',
              }}
            />
            <button
              type="submit"
              disabled={submitting || !submittedAnswer.trim()}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
            >
              {submitting ? 'Submitting Transaction...' : 'Submit to Live Arena →'}
            </button>
          </form>
        </div>

        {/* Right column: Real-time WebSocket Leaderboard */}
        <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem' }} className="gradient-text">🏆 Real-Time Leaderboard</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>● WEBSOCKET LIVE</span>
          </div>

          {leaderboard.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
              No submissions yet across this arena. Be the first to score!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '450px' }}>
              {leaderboard.map((rank, index) => (
                <div
                  key={rank.userId}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: index === 0 ? 'rgba(250, 204, 21, 0.15)' : 'var(--bg-secondary)',
                    border: index === 0 ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: index === 0 ? '#facc15' : index === 1 ? '#94a3b8' : index === 2 ? '#d97706' : 'rgba(255,255,255,0.1)',
                      color: index <= 2 ? '#000' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}>
                      {index + 1}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      Engineer ID: {rank.userId.substring(0, 8)}...
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>
                      {rank.totalScore} pts
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {(rank.totalDurationMs / 1000).toFixed(1)}s total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
