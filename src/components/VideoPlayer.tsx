'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Lesson, InteractiveCheckpoint } from '@/types';
import { useStore } from '@/lib/store';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  Activity,
  Radio,
  FileText
} from 'lucide-react';

interface VideoPlayerProps {
  lesson: Lesson;
  onTimeUpdate?: (currentTime: number) => void;
  onSeekRequested?: (callback: (seekToSec: number) => void) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ lesson, onTimeUpdate, onSeekRequested }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { updateNodeStatus, triggerMasteryCelebration } = useStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(lesson.videoDuration || 596);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCheckpoint, setActiveCheckpoint] = useState<InteractiveCheckpoint | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [passedCheckpoints, setPassedCheckpoints] = useState<number[]>([]);

  // Expose seek function to parent (for Copilot timestamp clicks)
  useEffect(() => {
    if (onSeekRequested) {
      onSeekRequested((seekToSec: number) => {
        setCurrentTime(seekToSec);
        if (videoRef.current) {
          try {
            videoRef.current.currentTime = seekToSec;
          } catch {}
        }
        setIsPlaying(true);
      });
    }
  }, [onSeekRequested]);

  // Robust playback loop that guarantees smooth time progression
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && !activeCheckpoint) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;

          // Notify parent
          if (onTimeUpdate) onTimeUpdate(next);

          // Check if we hit any checkpoint
          if (lesson.interactiveCheckpoints && lesson.interactiveCheckpoints.length > 0) {
            for (const cp of lesson.interactiveCheckpoints) {
              if (
                next >= cp.timestampSeconds &&
                prev < cp.timestampSeconds &&
                !passedCheckpoints.includes(cp.timestampSeconds)
              ) {
                setIsPlaying(false);
                setActiveCheckpoint(cp);
                setSelectedOption(null);
                setIsAnswerSubmitted(false);
                return cp.timestampSeconds;
              }
            }
          }

          if (next >= duration) {
            setIsPlaying(false);
            return duration;
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, activeCheckpoint, duration, lesson, passedCheckpoints, onTimeUpdate]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (onTimeUpdate) onTimeUpdate(time);

    // Check if scrubbed directly to a checkpoint
    if (lesson.interactiveCheckpoints) {
      for (const cp of lesson.interactiveCheckpoints) {
        if (
          Math.abs(time - cp.timestampSeconds) < 2 &&
          !passedCheckpoints.includes(cp.timestampSeconds)
        ) {
          setIsPlaying(false);
          setActiveCheckpoint(cp);
          setSelectedOption(null);
          setIsAnswerSubmitted(false);
          break;
        }
      }
    }
  };

  const handleCheckpointSubmit = () => {
    if (selectedOption === null || !activeCheckpoint) return;
    const correct = selectedOption === activeCheckpoint.correctAnswerIndex;
    setIsCorrect(correct);
    setIsAnswerSubmitted(true);

    if (correct) {
      setPassedCheckpoints((prev) => [...prev, activeCheckpoint.timestampSeconds]);
      triggerMasteryCelebration();
      updateNodeStatus(lesson.conceptCode, 'IN_PROGRESS', 0.7);
    }
  };

  const handleResumeVideo = () => {
    const nextTime = (activeCheckpoint?.timestampSeconds || currentTime) + 2;
    setActiveCheckpoint(null);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setCurrentTime(nextTime);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        {/* Dynamic Interactive Lecture Visual Canvas */}
        <div className="relative aspect-video w-full bg-[#070b14] flex flex-col justify-between p-6 overflow-hidden select-none">
          
          {/* Animated Background Grid & Visual Glow */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Lecture Header Top Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="rounded-lg bg-slate-900/90 px-3 py-1 text-xs font-mono font-semibold text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                {lesson.conceptCode}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 px-3 py-1 text-xs text-slate-300 border border-slate-800 backdrop-blur-md">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isPlaying ? 'Live Playback' : 'Paused'}</span>
            </div>
          </div>

          {/* Central Animated Lecture Slide & Key Concepts Visualizer */}
          <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-xl mx-auto space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-glow">
              <Sparkles className="h-7 w-7 animate-pulse" />
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                {lesson.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md line-clamp-2">
                {currentTime < 80
                  ? 'Foundational geometric mapping & high-dimensional vector embeddings'
                  : currentTime < 155
                  ? 'Cosine similarity angles vs Euclidean distance on 1536-dim hyperspheres'
                  : 'Semantic boundary detection & Supabase pgvector HNSW indexing'}
              </p>
            </div>

            {/* Live Audio Waveform Simulation */}
            <div className="flex items-center gap-1 h-6">
              {[40, 70, 90, 60, 100, 45, 80, 65, 95, 50, 75, 85, 60, 40].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlaying ? 'bg-indigo-500' : 'bg-slate-700'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(20, (h * ((i % 3) + 1) * 0.4))}%` : '20%',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Checkpoint Indicators on Timeline */}
          <div className="absolute bottom-16 left-4 right-4 z-20 flex pointer-events-none">
            {lesson.interactiveCheckpoints?.map((cp, idx) => {
              const leftPct = Math.min(96, Math.max(4, (cp.timestampSeconds / (duration || 300)) * 100));
              const isPassed = passedCheckpoints.includes(cp.timestampSeconds);
              return (
                <div
                  key={idx}
                  style={{ left: `${leftPct}%` }}
                  className="absolute -top-3 -translate-x-1/2 flex flex-col items-center pointer-events-auto cursor-pointer group"
                  title={`Checkpoint at ${formatTime(cp.timestampSeconds)}`}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveCheckpoint(cp);
                    setSelectedOption(null);
                    setIsAnswerSubmitted(false);
                  }}
                >
                  <div
                    className={`h-4 w-4 rounded-full border-2 transition-transform hover:scale-125 flex items-center justify-center shadow-lg ${
                      isPassed
                        ? 'bg-emerald-500 border-emerald-300 text-white'
                        : 'bg-amber-500 border-amber-300 animate-pulse text-slate-950'
                    }`}
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Video Controls Bar */}
          <div className="relative z-30 -mx-6 -mb-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-4 border-t border-slate-800/60">
            {/* Progress Bar */}
            <div className="relative mb-3 flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 300}
                step={1}
                value={currentTime}
                onChange={handleSeek}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-glow transition-all"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTime((t) => Math.max(0, t - 10))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                  title="Rewind 10s"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <div className="text-xs font-mono text-slate-400">
                  <span className="text-slate-200 font-bold">{formatTime(currentTime)}</span> / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High-Z-Index Floating Checkpoint Quiz Modal */}
      {activeCheckpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-indigo-500/50 bg-slate-900 p-6 sm:p-8 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-glow">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    In-Video Concept Checkpoint
                  </h3>
                  <p className="text-[11px] text-slate-400">Paused at {formatTime(activeCheckpoint.timestampSeconds)}</p>
                </div>
              </div>

              <span className="rounded-full bg-indigo-500/10 px-3 py-1 font-mono text-xs font-bold text-indigo-300 border border-indigo-500/30">
                {formatTime(activeCheckpoint.timestampSeconds)}
              </span>
            </div>

            {/* Question Text */}
            <h4 className="text-sm sm:text-base font-bold text-white mb-5 leading-relaxed">
              {activeCheckpoint.question}
            </h4>

            {/* Multiple Choice Options */}
            <div className="space-y-3 mb-6">
              {activeCheckpoint.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                let cardStyle = 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700 hover:bg-slate-950';

                if (isSelected && !isAnswerSubmitted) {
                  cardStyle = 'border-indigo-500 bg-indigo-500/20 text-white ring-1 ring-indigo-500 shadow-glow';
                }

                if (isAnswerSubmitted) {
                  if (idx === activeCheckpoint.correctAnswerIndex) {
                    cardStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500 shadow-glow-emerald';
                  } else if (isSelected) {
                    cardStyle = 'border-rose-500 bg-rose-500/20 text-rose-200 ring-1 ring-rose-500';
                  }
                }

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!isAnswerSubmitted) {
                        setSelectedOption(idx);
                      }
                    }}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-700 bg-slate-900 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-xs sm:text-sm font-medium leading-normal">{opt}</span>
                    </div>

                    {isAnswerSubmitted && idx === activeCheckpoint.correctAnswerIndex && (
                      <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
                    )}
                    {isAnswerSubmitted && isSelected && idx !== activeCheckpoint.correctAnswerIndex && (
                      <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Post-Submission Feedback */}
            {isAnswerSubmitted && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold mb-1">
                  {isCorrect ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" /> Correct Answer! Concept Mastered
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <XCircle className="h-4 w-4" /> Incorrect — Explanation:
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{activeCheckpoint.explanation}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {!isAnswerSubmitted ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleCheckpointSubmit}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-xs sm:text-sm font-bold text-white transition-all hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-glow"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Submit Answer</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResumeVideo}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs sm:text-sm font-bold text-white transition-all hover:bg-emerald-500 shadow-glow-emerald"
                >
                  <span>Continue Lecture</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};
