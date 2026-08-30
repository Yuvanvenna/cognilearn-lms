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
  HelpCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  Award
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
  const [duration, setDuration] = useState(lesson.videoDuration || 300);
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
        if (videoRef.current) {
          videoRef.current.currentTime = seekToSec;
          videoRef.current.play();
          setIsPlaying(true);
        }
      });
    }
  }, [onSeekRequested]);

  // Handle time updates & trigger checkpoints
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);
    if (onTimeUpdate) onTimeUpdate(curr);

    // Check if we hit any checkpoint timestamp
    if (lesson.interactiveCheckpoints && lesson.interactiveCheckpoints.length > 0) {
      for (const cp of lesson.interactiveCheckpoints) {
        if (
          Math.abs(curr - cp.timestampSeconds) < 1 &&
          !passedCheckpoints.includes(cp.timestampSeconds) &&
          !activeCheckpoint
        ) {
          videoRef.current.pause();
          setIsPlaying(false);
          setActiveCheckpoint(cp);
          setSelectedOption(null);
          setIsAnswerSubmitted(false);
          break;
        }
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
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
      // Update node status
      updateNodeStatus(lesson.conceptCode, 'IN_PROGRESS', 0.7);
    }
  };

  const handleResumeVideo = () => {
    setActiveCheckpoint(null);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    if (videoRef.current) {
      videoRef.current.currentTime = (activeCheckpoint?.timestampSeconds || currentTime) + 1;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Video Element */}
      <div className="relative aspect-video w-full bg-slate-950">
        <video
          ref={videoRef}
          src={lesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration || lesson.videoDuration || 300);
            }
          }}
          className="h-full w-full object-cover"
          playsInline
        />

        {/* Checkpoint Indicators on Timeline */}
        <div className="absolute bottom-16 left-4 right-4 z-20 flex pointer-events-none">
          {lesson.interactiveCheckpoints?.map((cp, idx) => {
            const leftPct = (cp.timestampSeconds / (duration || 300)) * 100;
            const isPassed = passedCheckpoints.includes(cp.timestampSeconds);
            return (
              <div
                key={idx}
                style={{ left: `${leftPct}%` }}
                className="absolute -top-3 -translate-x-1/2 flex flex-col items-center group pointer-events-auto cursor-pointer"
                title={`Interactive Checkpoint at ${formatTime(cp.timestampSeconds)}`}
              >
                <div
                  className={`h-4 w-4 rounded-full border-2 transition-transform hover:scale-125 flex items-center justify-center ${
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

        {/* Interactive Checkpoint Modal Overlay */}
        {activeCheckpoint && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md transition-all">
            <div className="w-full max-w-lg rounded-2xl border border-indigo-500/40 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    In-Video Mastery Checkpoint
                  </span>
                </div>
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300 font-mono">
                  {formatTime(activeCheckpoint.timestampSeconds)}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-4 leading-relaxed">
                {activeCheckpoint.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5 mb-5">
                {activeCheckpoint.options.map((opt, idx) => {
                  let optStyle = 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700';

                  if (selectedOption === idx && !isAnswerSubmitted) {
                    optStyle = 'border-indigo-500 bg-indigo-500/10 text-indigo-200';
                  }

                  if (isAnswerSubmitted) {
                    if (idx === activeCheckpoint.correctAnswerIndex) {
                      optStyle = 'border-emerald-500/80 bg-emerald-500/15 text-emerald-200';
                    } else if (selectedOption === idx) {
                      optStyle = 'border-rose-500/80 bg-rose-500/15 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswerSubmitted}
                      onClick={() => setSelectedOption(idx)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs font-medium transition-all ${optStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-[10px] text-slate-400">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isAnswerSubmitted && idx === activeCheckpoint.correctAnswerIndex && (
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                      )}
                      {isAnswerSubmitted && selectedOption === idx && idx !== activeCheckpoint.correctAnswerIndex && (
                        <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Action */}
              {isAnswerSubmitted ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-1">
                    {isCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Correct! Concept Verified
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Review Explanation
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{activeCheckpoint.explanation}</p>
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3">
                {!isAnswerSubmitted ? (
                  <button
                    disabled={selectedOption === null}
                    onClick={handleCheckpointSubmit}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50 shadow-glow"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleResumeVideo}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-500 shadow-glow-emerald"
                  >
                    <span>Continue Lecture</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom Video Controls Bar */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="relative mb-3 flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 300}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                title="Rewind 10s"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <div className="text-xs font-mono text-slate-400">
                <span className="text-slate-200">{formatTime(currentTime)}</span> / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      videoRef.current.requestFullscreen();
                    }
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Maximize className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
