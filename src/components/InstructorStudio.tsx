'use client';

import React, { useState } from 'react';
import { synthesizeCurriculumWithAI } from '@/lib/agents/courseSynthesizer';
import { useStore } from '@/lib/store';
import { Course } from '@/types';
import {
  Wand2,
  Sparkles,
  FileText,
  Layers,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Clock,
  ShieldCheck,
  Video,
  FileCode
} from 'lucide-react';

export const InstructorStudio: React.FC = () => {
  const { addSynthesizedCourse, setActiveCourse, geminiApiKey } = useStore();

  const [topic, setTopic] = useState('Quantum Computing & Qiskit Algorithms');
  const [sourceText, setSourceText] = useState(`Syllabus Draft:
1. Qubits, Superposition & Bloch Sphere Geometry
2. Quantum Gates (Hadamard, CNOT, Phase Shift)
3. Grover's Search Algorithm & Quantum Phase Estimation
4. Noise Mitigation & VQE Optimization on Real Quantum Hardware`);
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Advanced');

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [synthesizedResult, setSynthesizedResult] = useState<Course | null>(null);

  const samplePresets = [
    {
      title: 'Full-Stack Rust & WebAssembly',
      text: 'Memory safety, Borrow Checker, WASM compilation pipelines, high-concurrency Axum backend.',
      level: 'Advanced' as const,
    },
    {
      title: 'Graph Neural Networks & PyTorch Geometric',
      text: 'Message passing neural networks, Node classification, Link prediction, Graph Attention Networks (GAT).',
      level: 'Advanced' as const,
    },
    {
      title: 'Enterprise Kubernetes & Service Meshes',
      text: 'Pod lifecycle, Istio ingress routing, mTLS security, Prometheus telemetry dashboards.',
      level: 'Intermediate' as const,
    },
  ];

  const handleSynthesize = async () => {
    if (!topic.trim() || isSynthesizing) return;
    setIsSynthesizing(true);
    setSynthesizedResult(null);

    try {
      setCurrentStep('Analyzing unstructured syllabus and decomposing concept graphs...');
      await new Promise((r) => setTimeout(r, 600));

      setCurrentStep('Generating atomic KnowledgeNodes and topological prerequisite DAG...');
      await new Promise((r) => setTimeout(r, 700));

      setCurrentStep('Synthesizing in-video checkpoints, quizzes, and timestamp rubrics...');
      const { course } = await synthesizeCurriculumWithAI(
        {
          topic,
          sourceText,
          targetAudience: level,
        },
        geminiApiKey
      );

      setCurrentStep('Course synthesis finalized and ready for publishing.');
      setSynthesizedResult(course);
    } catch (err) {
      console.error('Synthesis failed:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handlePublish = () => {
    if (!synthesizedResult) return;
    addSynthesizedCourse(synthesizedResult);
    setActiveCourse(synthesizedResult);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-glow">
              <Wand2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                1-Click Curriculum Synthesizer Agent
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                  Antigravity Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Transform raw documents, syllabi, and lecture notes into fully structured courses with in-video checkpoints.
              </p>
            </div>
          </div>
        </div>

        {/* Preset Quick Fill */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400">Quick Templates:</span>
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopic(preset.title);
                setSourceText(preset.text);
                setLevel(preset.level);
              }}
              className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-xs text-slate-300 hover:border-amber-500/50 hover:text-white transition-colors"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-xl space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">Course Topic & Domain</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Distributed Consensus in Raft & Paxos"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">Target Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={`rounded-xl border py-2 text-xs font-medium transition-all ${
                      level === l
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200 shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Raw Source Text / Syllabus / Lecture Notes
              </label>
              <textarea
                rows={6}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste outline, markdown docs, or book chapter headings..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <button
              disabled={!topic.trim() || isSynthesizing}
              onClick={handleSynthesize}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 py-3 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 shadow-glow transition-all"
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Course Topology...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Synthesize Full Course Structure</span>
                </>
              )}
            </button>

            {isSynthesizing && (
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-3.5 animate-pulse">
                <div className="text-[11px] font-semibold text-indigo-300 flex items-center gap-2 mb-1">
                  <Wand2 className="h-3.5 w-3.5" /> Agent Ingestion Telemetry
                </div>
                <p className="text-xs text-slate-300">{currentStep}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Synthesized Course Preview */}
        <div className="lg:col-span-7">
          {synthesizedResult ? (
            <div className="rounded-2xl border border-indigo-500/40 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                      Synthesis Complete
                    </span>
                    <span className="text-xs text-slate-400">{synthesizedResult.level} • {synthesizedResult.estimatedHours} Hours</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{synthesizedResult.title}</h3>
                  <p className="text-xs text-slate-300 mt-1">{synthesizedResult.description}</p>
                </div>

                <button
                  onClick={handlePublish}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-glow-emerald transition-all shrink-0"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Publish & Open</span>
                </button>
              </div>

              {/* Modules & Lessons breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" /> Synthesized Modules & Checkpoints
                </h4>

                {synthesizedResult.modules.map((mod, mIdx) => (
                  <div key={mod.id || mIdx} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <h5 className="text-xs font-bold text-indigo-300 mb-3">{mod.title}</h5>

                    <div className="space-y-2">
                      {mod.lessons.map((les, lIdx) => (
                        <div
                          key={les.id || lIdx}
                          className="flex items-center justify-between rounded-lg bg-slate-900/80 p-2.5 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            {les.type === 'VIDEO' ? (
                              <Video className="h-4 w-4 text-cyan-400" />
                            ) : (
                              <FileCode className="h-4 w-4 text-purple-400" />
                            )}
                            <div>
                              <span className="font-semibold text-slate-200">{les.title}</span>
                              <div className="text-[10px] text-slate-400 font-mono">{les.conceptCode}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {les.interactiveCheckpoints && les.interactiveCheckpoints.length > 0 && (
                              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/20 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> {les.interactiveCheckpoints.length} Checkpoints
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/60 text-slate-400 mb-4">
                <Sparkles className="h-7 w-7 text-indigo-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Synthesizer Output Canvas</h3>
              <p className="max-w-md text-xs text-slate-400 leading-relaxed">
                Enter a topic or select a quick template on the left, then click &ldquo;Synthesize Full Course Structure&rdquo; to watch the AI agent generate an end-to-end curriculum.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
