'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { QuestionOption } from '@onluyenphongvan/types';

export default function QuestionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { user } = useAuthStore();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [fillAnswer, setFillAnswer] = useState<string>('');
  const [codeAnswer, setCodeAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    correct: boolean;
    sm2Interval: number;
    sm2EFactor: number;
    sm2Repetitions: number;
  } | null>(null);
  const [aiExplanation, setAiExplanation] = useState<{
    whyWrong: string;
    conceptToReview: string;
    suggestedAction: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const startTime = React.useRef(Date.now());

  const { data: question, isLoading } = useQuery({
    queryKey: ['question', params.slug],
    queryFn: () => apiClient.getQuestionBySlug(params.slug),
  });

  if (isLoading) {
    return <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading question detail...</div>;
  }

  if (!question) {
    return <div style={{ padding: '80px', textAlign: 'center' }}>Question not found</div>;
  }

  const handleSubmit = async () => {
    if (!user) {
      alert('Please sign in first to submit and save your SM-2 progress.');
      return;
    }

    const durationMs = Date.now() - startTime.current;
    let payloadAnswer = '';
    if (question.type === 'multiple-choice') {
      payloadAnswer = selectedOption;
    } else if (question.type === 'fill-blank') {
      payloadAnswer = fillAnswer;
    } else if (question.type === 'code-output' || question.type === 'coding-challenge') {
      payloadAnswer = codeAnswer;
    }

    try {
      const att = await apiClient.submitAttempt({
        questionId: question._id,
        durationMs,
        ...(question.type === 'multiple-choice'
          ? { selectedOptionId: selectedOption }
          : { submittedAnswer: payloadAnswer }),
      });

      setIsSubmitted(true);
      setSubmissionResult({
        correct: att.correct,
        sm2Interval: att.sm2Interval,
        sm2EFactor: att.sm2EFactor,
        sm2Repetitions: att.sm2Repetitions,
      });

      if (!att.correct) {
        setAiLoading(true);
        apiClient.aiExplain({
          questionId: question._id,
          userAnswer: payloadAnswer || selectedOption || 'No answer provided',
        })
          .then((res: { whyWrong: string; conceptToReview: string; suggestedAction: string }) => setAiExplanation(res))
          .finally(() => setAiLoading(false));
      }
    } catch (err) {
      if (err instanceof Error) alert(`Submission failed: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '32px' }}>
        {/* Left Column: Question Content */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <span className={`badge badge-${question.difficulty}`}>{question.difficulty}</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{question.type}</span>
          </div>

          <h1 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>{question.title}</h1>

          <div className="markdown-body" style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '28px' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {question.markdown}
            </ReactMarkdown>
          </div>

          {question.type === 'code-output' && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>CODE SNIPPET:</h4>
              <pre style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', overflowX: 'auto', border: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)' }}>
                <code>{question.codeSnippet}</code>
              </pre>
            </div>
          )}

          {isSubmitted && (
            <div style={{ marginTop: '32px', padding: '24px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glow)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }} className="gradient-text">
                Author Explanation
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{question.explanation}</p>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Workspace & SM-2 Feedback */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Submit Your Solution</h3>

            {question.type === 'multiple-choice' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {question.options.map((opt: QuestionOption) => (
                  <button
                    key={opt.id}
                    onClick={() => !isSubmitted && setSelectedOption(opt.id)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      background: selectedOption === opt.id ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-secondary)',
                      border: selectedOption === opt.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{opt.content}</span>
                    {isSubmitted && (
                      <span style={{ fontWeight: 700, color: opt.correct ? 'var(--success)' : selectedOption === opt.id ? 'var(--danger)' : 'inherit' }}>
                        {opt.correct ? '✓ Correct' : selectedOption === opt.id ? '✗ Wrong' : ''}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {question.type === 'fill-blank' && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Enter answer(s), comma-separated:
                </label>
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={fillAnswer}
                  onChange={(e) => setFillAnswer(e.target.value)}
                  placeholder="e.g. useMemo, useCallback"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                  }}
                />
              </div>
            )}

            {(question.type === 'code-output' || question.type === 'coding-challenge') && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {question.type === 'code-output' ? 'Expected Output String:' : 'Write Code Solution inside Monaco Editor:'}
                </label>
                {question.type === 'code-output' ? (
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={codeAnswer}
                    onChange={(e) => setCodeAnswer(e.target.value)}
                    placeholder="Output text..."
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                ) : (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                    <Editor
                      height="260px"
                      defaultLanguage="typescript"
                      theme="vs-dark"
                      value={codeAnswer || question.starterCode}
                      onChange={(val) => setCodeAnswer(val ?? '')}
                      options={{ minimap: { enabled: false }, fontSize: 13 }}
                    />
                  </div>
                )}
              </div>
            )}

            {!isSubmitted ? (
              <button onClick={handleSubmit} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
                Verify & Grade via SM-2 Engine →
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSubmissionResult(null);
                  setAiExplanation(null);
                  startTime.current = Date.now();
                }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              >
                Attempt Again
              </button>
            )}
          </div>

          {/* SM-2 Spaced Repetition Feedback Strip */}
          {submissionResult && (
            <div className="glass-card" style={{
              padding: '24px',
              borderLeft: submissionResult.correct ? '4px solid var(--success)' : '4px solid var(--danger)',
            }}>
              <h4 style={{ fontSize: '1.1rem', color: submissionResult.correct ? 'var(--success)' : 'var(--danger)', marginBottom: '12px' }}>
                {submissionResult.correct ? '🎉 Correct Solution!' : '✗ Incorrect Attempt'}
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>NEXT SM-2 REVIEW IN:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{submissionResult.sm2Interval} Days</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>SM-2 E-FACTOR:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>{submissionResult.sm2EFactor.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Explanation card when wrong */}
          {aiLoading && (
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--primary)' }}>
              Generating tailored AI explanation using strict Zod output schemas...
            </div>
          )}

          {aiExplanation && (
            <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent)', fontWeight: 700 }}>
                <span>AI Concept Diagnosis</span>
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                <strong>Why incorrect:</strong> {aiExplanation.whyWrong}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                <strong>Key Concept to Review:</strong> <span className="badge badge-middle">{aiExplanation.conceptToReview}</span>
              </p>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', fontSize: '0.85rem', color: '#e9d5ff' }}>
                💡 <strong>Suggested Next Step:</strong> {aiExplanation.suggestedAction}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
