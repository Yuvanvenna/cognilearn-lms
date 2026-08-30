'use client';

import React, { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { Lesson } from '@/types';
import { VideoPlayer } from './VideoPlayer';
import { CopilotSidebar } from './CopilotSidebar';
import { SocraticEvaluatorTab } from './SocraticEvaluatorTab';
import {
  PlayCircle,
  FileText,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight,
  BookOpen,
  Layers,
  BrainCircuit,
  MessageSquare,
  Clock
} from 'lucide-react';

interface LearnerPortalProps {
  onOpenKnowledgeGraph?: () => void;
}

export const LearnerPortal: React.FC<LearnerPortalProps> = ({ onOpenKnowledgeGraph }) => {
  const { activeCourse, activeLesson, setActiveLesson, knowledgeNodes } = useStore();

  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'lecture' | 'socratic_lab' | 'transcript'>('lecture');

  // Reference holder for child video player seek callback
  const [seekFn, setSeekFn] = useState<((sec: number) => void) | null>(null);

  const handleSeekRequest = useCallback((fn: (sec: number) => void) => {
    setSeekFn(() => fn);
  }, []);

  const handleSeek = (seconds: number) => {
    if (seekFn) {
      seekFn(seconds);
    }
  };

  const currentLesson: Lesson = activeLesson || activeCourse.modules[0]?.lessons[0];

  // Find corresponding knowledge node for this lesson
  const currentNode = knowledgeNodes.find((n) => n.conceptCode === currentLesson?.conceptCode);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Course Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
              {activeCourse.level} Track
            </span>
            <span className="text-xs text-slate-400 font-medium">Instructor: {activeCourse.instructorName}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">{activeCourse.title}</h1>
        </div>

        {currentNode && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5">
            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Concept Status</div>
              <div className="text-xs font-bold text-indigo-300 font-mono">{currentNode.conceptCode}</div>
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                currentNode.status === 'MASTERED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}
            >
              {currentNode.status === 'MASTERED' ? <CheckCircle2 className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Left Curriculum, Center Player/Content, Right Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Curriculum Module Tree (3 cols) */}
        <div className="lg:col-span-3 space-y-3 order-2 lg:order-1">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
              <span className="flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-400" /> Syllabus
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                {activeCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons
              </span>
            </div>

            <div className="space-y-4">
              {activeCourse.modules.map((module) => (
                <div key={module.id} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-300 px-2 py-1 line-clamp-1">
                    {module.title}
                  </div>

                  <div className="space-y-1">
                    {module.lessons.map((lesson) => {
                      const isSelected = currentLesson?.id === lesson.id;
                      const node = knowledgeNodes.find((n) => n.conceptCode === lesson.conceptCode);
                      const isMastered = node?.status === 'MASTERED';

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition-all ${
                            isSelected
                              ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 shadow-sm'
                              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isMastered ? (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                            ) : lesson.type === 'VIDEO' ? (
                              <PlayCircle className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                            ) : (
                              <FileText className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                            )}
                            <span className="truncate font-medium">{lesson.title}</span>
                          </div>

                          {lesson.interactiveCheckpoints && lesson.interactiveCheckpoints.length > 0 && (
                            <span className="shrink-0 rounded bg-amber-500/10 px-1 py-0.2 text-[9px] font-mono text-amber-300">
                              {lesson.interactiveCheckpoints.length}Q
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Active Lesson Content & Video Player (6 cols) */}
        <div className="lg:col-span-6 space-y-4 order-1 lg:order-2">
          {/* Sub Navigation Bar */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('lecture')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'lecture'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlayCircle className="h-3.5 w-3.5" /> Interactive Lecture
            </button>

            <button
              onClick={() => setActiveTab('socratic_lab')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'socratic_lab'
                  ? 'bg-purple-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BrainCircuit className="h-3.5 w-3.5" /> Socratic Lab
            </button>

            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'transcript'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Transcript
            </button>
          </div>

          {/* Active View Container */}
          {activeTab === 'lecture' && currentLesson && (
            <div className="space-y-4">
              {currentLesson.type === 'VIDEO' ? (
                <VideoPlayer
                  lesson={currentLesson}
                  onTimeUpdate={setCurrentPlaybackTime}
                  onSeekRequested={handleSeekRequest}
                />
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
                  <div className="prose prose-invert prose-indigo max-w-none text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {currentLesson.articleBody}
                  </div>
                </div>
              )}

              {/* Lesson Learning Outcomes */}
              {currentLesson.keyLearningOutcomes && currentLesson.keyLearningOutcomes.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Key Learning Outcomes
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {currentLesson.keyLearningOutcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400">✓</span>
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'socratic_lab' && currentLesson && (
            <SocraticEvaluatorTab lesson={currentLesson} />
          )}

          {activeTab === 'transcript' && currentLesson && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" /> Grounded Transcript Records
              </h3>
              <div className="space-y-3 font-mono text-xs text-slate-300 leading-relaxed max-h-[450px] overflow-y-auto">
                {currentLesson.transcriptRaw?.split('\n').filter(Boolean).map((line, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 hover:border-indigo-500/40">
                    {line}
                  </div>
                )) || <p className="text-slate-500">No raw transcript generated for this unit.</p>}
              </div>
            </div>
          )}
        </div>

        {/* Right: Real-Time In-Video Copilot (3 cols) */}
        <div className="lg:col-span-3 h-[560px] order-3">
          {currentLesson && (
            <CopilotSidebar
              lesson={currentLesson}
              currentTime={currentPlaybackTime}
              onSeek={handleSeek}
            />
          )}
        </div>

      </div>
    </div>
  );
};
