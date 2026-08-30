'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Activity,
  BrainCircuit,
  PieChart
} from 'lucide-react';

export const AdminTelemetry: React.FC = () => {
  const { activeCourse, knowledgeNodes } = useStore();

  const masteredCount = knowledgeNodes.filter((n) => n.status === 'MASTERED').length;
  const inProgressCount = knowledgeNodes.filter((n) => n.status === 'IN_PROGRESS').length;
  const lockedCount = knowledgeNodes.filter((n) => n.status === 'LOCKED').length;
  const masteryPercentage = Math.round((masteredCount / (knowledgeNodes.length || 1)) * 100);

  const conceptStruggleData = [
    { concept: 'CROSS_ENCODER_RERANKING', avgAttempts: 2.8, passRate: '68%', risk: 'HIGH' },
    { concept: 'PGVECTOR_HNSW_INDEXING', avgAttempts: 1.4, passRate: '91%', risk: 'LOW' },
    { concept: 'VECTOR_EMBEDDINGS_AND_CHUNKING', avgAttempts: 1.2, passRate: '96%', risk: 'LOW' },
    { concept: 'AUTONOMOUS_TOOL_CALLING', avgAttempts: 2.2, passRate: '74%', risk: 'MEDIUM' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white shadow-glow-emerald">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Admin & Real-Time Telemetry Control Center
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                Live Cohort Feed
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Monitoring telemetry across active learners, concept friction points, and checkpoint completion rates.
            </p>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Cohort Size</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">1,428</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="h-3 w-3" /> +14.2% active this week
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Concept Mastery</span>
            <BrainCircuit className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{masteryPercentage}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {masteredCount} of {knowledgeNodes.length} nodes cleared
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Checkpoint Accuracy</span>
            <CheckCircle className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">88.4%</div>
          <div className="text-[11px] text-cyan-400 mt-1">First-attempt pass rate</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Copilot Inquiries</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">3,912</div>
          <div className="text-[11px] text-purple-300 mt-1">Timestamped Q&A sessions</div>
        </div>
      </div>

      {/* Concept Struggle Heatmap Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Concept Struggle & Friction Heatmap
            </h3>
            <p className="text-xs text-slate-400">Identifies lessons where students require multiple Socratic attempts.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 bg-slate-950/40">
              <tr>
                <th className="py-3 px-4">Concept Code</th>
                <th className="py-3 px-4">Avg Socratic Attempts</th>
                <th className="py-3 px-4">Pass Rate</th>
                <th className="py-3 px-4">Friction Index</th>
                <th className="py-3 px-4 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {conceptStruggleData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-indigo-300">{row.concept}</td>
                  <td className="py-3.5 px-4">{row.avgAttempts} Attempts</td>
                  <td className="py-3.5 px-4 text-slate-200">{row.passRate}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        row.risk === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : row.risk === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {row.risk} FRICTION
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold underline underline-offset-2">
                      Auto-Synthesize Remediation Lab
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
