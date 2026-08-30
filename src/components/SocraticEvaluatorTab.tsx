'use client';

import React, { useState } from 'react';
import { Lesson, SubmissionEvaluation } from '@/types';
import { evaluateSubmissionSocratic } from '@/lib/agents/socraticEvaluator';
import { useStore } from '@/lib/store';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  Award,
  RefreshCw,
  Code,
  BrainCircuit
} from 'lucide-react';

interface SocraticEvaluatorTabProps {
  lesson: Lesson;
}

export const SocraticEvaluatorTab: React.FC<SocraticEvaluatorTabProps> = ({ lesson }) => {
  const { updateNodeStatus, geminiApiKey } = useStore();
  const [submissionText, setSubmissionText] = useState('');
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [evaluation, setEvaluation] = useState<SubmissionEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleSubmit = async () => {
    if (!submissionText.trim() || isEvaluating) return;
    setIsEvaluating(true);

    try {
      const result = await evaluateSubmissionSocratic({
        lessonTitle: lesson.title,
        conceptCode: lesson.conceptCode,
        rubric: lesson.articleBody || 'Explain high-dimensional vector search and HNSW graph traversal.',
        studentSubmission: submissionText,
        attemptNumber,
        apiKey: geminiApiKey,
      });

      setEvaluation(result);

      if (result.passed) {
        updateNodeStatus(lesson.conceptCode, 'MASTERED', result.score);
      } else {
        updateNodeStatus(lesson.conceptCode, 'NEEDS_REMEDIATION', result.score);
        setAttemptNumber((prev) => Math.min(3, prev + 1));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const sampleGoodAnswer = `HNSW (Hierarchical Navigable Small World) constructs a multi-layer graph skip-list of high-dimensional vectors, enabling logarithmic O(log N) search complexity. Unlike IVFFlat, which partitions vectors into Voronoi cells and requires retraining centroids when data drifts, HNSW allows dynamic point insertion. While HNSW consumes more RAM and indexing time, it delivers sub-millisecond query latency and superior recall.`;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-glow">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Socratic Assessment & Rubric Evaluator
              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30">
                Attempt {attemptNumber} of 3
              </span>
            </h3>
            <p className="text-xs text-slate-400">Target Concept: <span className="font-mono text-indigo-400">{lesson.conceptCode}</span></p>
          </div>
        </div>

        <button
          onClick={() => setSubmissionText(sampleGoodAnswer)}
          className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:border-indigo-500 hover:text-white transition-colors"
        >
          Load Master Solution Demo
        </button>
      </div>

      {/* Rubric Prompt */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Code className="h-4 w-4 text-cyan-400" /> Assessment Criteria & Rubric
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Provide your technical analysis or architecture design for <strong>{lesson.title}</strong>. Your explanation will be evaluated by the Socratic Agent for conceptual accuracy, latency-memory trade-offs, and algorithmic mechanics.
        </p>
      </div>

      {/* Editor Area */}
      <div className="mb-4">
        <textarea
          rows={6}
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          placeholder="Type your explanation or architectural solution here..."
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed"
        />
      </div>

      {/* Action button */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-[11px] text-slate-400">
          The Socratic Evaluator guides your thinking with graduated hints if your solution is incomplete.
        </div>

        <button
          disabled={!submissionText.trim() || isEvaluating}
          onClick={handleSubmit}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 shadow-glow transition-all"
        >
          {isEvaluating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Evaluating Rubric...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Submit for Socratic Evaluation</span>
            </>
          )}
        </button>
      </div>

      {/* Evaluation Results Display */}
      {evaluation && (
        <div
          className={`rounded-2xl border p-5 transition-all ${
            evaluation.passed
              ? 'border-emerald-500/50 bg-emerald-950/20 shadow-glow-emerald'
              : 'border-amber-500/50 bg-amber-950/20'
          }`}
        >
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              {evaluation.passed ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Lightbulb className="h-5 w-5" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-white">
                  {evaluation.passed ? 'Concept Mastered!' : `Tier ${evaluation.hintLevel} Socratic Guidance`}
                </h4>
                <p className="text-xs text-slate-400">
                  Accuracy Score: <span className="font-mono font-bold text-indigo-400">{Math.round(evaluation.score * 100)}%</span>
                </p>
              </div>
            </div>

            {evaluation.passed && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                <Award className="h-4 w-4" /> Mastery Node Unlocked
              </span>
            )}
          </div>

          <p className="text-xs text-slate-200 leading-relaxed mb-4">{evaluation.feedback}</p>

          {evaluation.socraticHint && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 mb-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-1">
                <Lightbulb className="h-3.5 w-3.5" /> Pedagogical Hint
              </div>
              <p className="text-xs text-amber-200 leading-relaxed">{evaluation.socraticHint}</p>
            </div>
          )}

          {evaluation.diagnosticBreakdown && evaluation.diagnosticBreakdown.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Diagnostic Analysis
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                {evaluation.diagnosticBreakdown.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
