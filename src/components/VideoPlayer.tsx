'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  Video,
  Upload,
  Layers,
  Activity,
  Cpu,
  BrainCircuit
} from 'lucide-react';

interface VideoPlayerProps {
  lesson: Lesson;
  onTimeUpdate?: (currentTime: number) => void;
  onSeekRequested?: (callback: (seekToSec: number) => void) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ lesson, onTimeUpdate, onSeekRequested }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { updateNodeStatus, triggerMasteryCelebration } = useStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(lesson.videoDuration || 420);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCheckpoint, setActiveCheckpoint] = useState<InteractiveCheckpoint | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [passedCheckpoints, setPassedCheckpoints] = useState<number[]>([]);
  const [customVideoSrc, setCustomVideoSrc] = useState<string | null>(null);
  const [useCanvasMode, setUseCanvasMode] = useState(false);

  // Notify parent of time updates (isolated effect, prevents setState in render warning)
  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(currentTime);
    }
  }, [currentTime, onTimeUpdate]);

  // Expose seek function to parent (for Copilot timestamp clicks)
  useEffect(() => {
    if (onSeekRequested) {
      onSeekRequested((seekToSec: number) => {
        setCurrentTime(seekToSec);
        if (videoRef.current && !useCanvasMode) {
          try {
            videoRef.current.currentTime = seekToSec;
            videoRef.current.play().catch(() => {});
          } catch {}
        }
        setIsPlaying(true);
      });
    }
  }, [onSeekRequested, useCanvasMode]);

  // Robust timer loop for guaranteed smooth playback
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && !activeCheckpoint) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;

          // Check if we hit any checkpoint timestamp
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
  }, [isPlaying, activeCheckpoint, duration, lesson, passedCheckpoints]);

  // 60FPS Live Animated Canvas Engine (Visual Lecture Stream)
  useEffect(() => {
    let animFrame: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Grid pattern
      ctx.strokeStyle = '#1e293b25';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Glowing Center Orbitals (AI Concept Nodes)
      const cx = w / 2;
      const cy = h / 2 - 20;

      // Outer glowing ring
      ctx.beginPath();
      ctx.arc(cx, cy, 110 + Math.sin(tick * 0.05) * 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#6366f130';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Middle cyan ring
      ctx.beginPath();
      ctx.arc(cx, cy, 75 + Math.cos(tick * 0.04) * 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#06b6d440';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Orbiting particles
      for (let i = 0; i < 6; i++) {
        const angle = (tick * 0.02) + (i * Math.PI / 3);
        const px = cx + Math.cos(angle) * (85 + (i % 2) * 20);
        const py = cy + Math.sin(angle) * (85 + (i % 2) * 20);
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? '#6366f1' : '#06b6d4';
        ctx.shadowColor = i % 2 === 0 ? '#6366f1' : '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Central Hub
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();

      // Hub icon text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isPlaying ? 'AI LIVE' : 'PAUSED', cx, cy);

      // Slide Title Banner
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(lesson.title, cx, h - 75);

      // Subtitle Concept Tracker
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText(`Concept: ${lesson.conceptCode}  •  ${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${(currentTime % 60).toString().padStart(2, '0')}`, cx, h - 50);

      // Live waveform bars at bottom
      const barCount = 28;
      const barWidth = 6;
      const startX = cx - (barCount * 10) / 2;
      for (let b = 0; b < barCount; b++) {
        const barH = isPlaying ? Math.sin(tick * 0.15 + b) * 14 + 16 : 4;
        ctx.fillStyle = b % 2 === 0 ? '#6366f1' : '#06b6d4';
        ctx.fillRect(startX + b * 10, h - 25 - barH / 2, barWidth, barH);
      }

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isPlaying, lesson, currentTime]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
    if (videoRef.current && !useCanvasMode) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          setUseCanvasMode(true);
        });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current && !useCanvasMode) {
      try {
        videoRef.current.currentTime = time;
      } catch {}
    }

    // Check if scrubbed directly into a checkpoint
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoSrc(url);
      setUseCanvasMode(false);
      setCurrentTime(0);
      setIsPlaying(false);
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
        
        {/* Top Control Bar with Video Source Switcher & File Uploader */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-indigo-400 font-bold">{lesson.conceptCode}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-medium truncate max-w-xs">{lesson.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseCanvasMode(!useCanvasMode)}
              className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-300 border border-slate-700 transition-colors"
            >
              <Cpu className="h-3 w-3 text-cyan-400" />
              <span>{useCanvasMode ? 'AI Stream Mode' : 'Standard MP4 Mode'}</span>
            </button>

            <label className="flex items-center gap-1.5 cursor-pointer rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 px-2.5 py-1 text-[11px] font-bold text-indigo-200 border border-indigo-500/40 transition-colors">
              <Upload className="h-3 w-3 text-indigo-300" />
              <span>Load My .mp4</span>
              <input type="file" accept="video/mp4,video/webm" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Video Viewport: Displays Canvas Animated Stream or Native Video */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          
          {/* 60FPS Dynamic AI Motion Canvas */}
          <canvas
            ref={canvasRef}
            width={720}
            height={405}
            className={`h-full w-full object-cover ${!useCanvasMode && customVideoSrc ? 'hidden' : 'block'}`}
          />

          {/* Optional Native HTML5 Video Element (Used when custom .mp4 is loaded) */}
          {!useCanvasMode && customVideoSrc && (
            <video
              ref={videoRef}
              src={customVideoSrc}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="h-full w-full object-contain"
              playsInline
            />
          )}

          {/* Play/Pause Center Click Overlay */}
          {!isPlaying && !activeCheckpoint && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 cursor-pointer backdrop-blur-[2px] transition-all hover:bg-black/20"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/90 text-white shadow-glow hover:scale-110 transition-transform">
                <Play className="h-7 w-7 ml-1" />
              </div>
            </div>
          )}

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
          <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-4 border-t border-slate-800/40">
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

      {/* Floating High-Z-Index Checkpoint Quiz Modal */}
      {activeCheckpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
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
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-xs sm:text-sm font-bold text-white transition-all hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-glow cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Submit Answer</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResumeVideo}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs sm:text-sm font-bold text-white transition-all hover:bg-emerald-500 shadow-glow-emerald cursor-pointer"
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
