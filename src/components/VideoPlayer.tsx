'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Lesson, InteractiveCheckpoint } from '@/types';
import { useStore } from '@/lib/store';
import { parseAndSynthesizeVideoCheckpoints } from '@/lib/agents/videoParser';
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
  Upload,
  RefreshCw,
  Layers,
  Clock,
  BrainCircuit
} from 'lucide-react';

interface VideoPlayerProps {
  lesson: Lesson;
  onTimeUpdate?: (currentTime: number) => void;
  onSeekRequested?: (callback: (seekToSec: number) => void) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ lesson, onTimeUpdate, onSeekRequested }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevLessonIdRef = useRef<string>(lesson.id);
  const { updateNodeStatus, triggerMasteryCelebration, geminiApiKey, updateActiveLesson } = useStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(lesson.videoDuration || 300);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCheckpoint, setActiveCheckpoint] = useState<InteractiveCheckpoint | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [passedCheckpoints, setPassedCheckpoints] = useState<number[]>([]);
  const [customVideoSrc, setCustomVideoSrc] = useState<string | null>(null);

  // Dynamic checkpoints
  const [checkpoints, setCheckpoints] = useState<InteractiveCheckpoint[]>(lesson.interactiveCheckpoints || []);

  // AI Video Ingestion State
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestStep, setIngestStep] = useState<string>('');

  // Only reset custom video when switching to a completely different lesson
  useEffect(() => {
    if (prevLessonIdRef.current !== lesson.id) {
      prevLessonIdRef.current = lesson.id;
      setCheckpoints(lesson.interactiveCheckpoints || []);
      setDuration(lesson.videoDuration || 300);
      setCurrentTime(0);
      setIsPlaying(false);
      setCustomVideoSrc(null);
    }
  }, [lesson.id, lesson.interactiveCheckpoints, lesson.videoDuration]);

  // Video source
  const videoSrc = customVideoSrc || lesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  // Notify parent of time updates (isolated effect prevents setState-in-render errors)
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
        if (videoRef.current) {
          try {
            videoRef.current.currentTime = seekToSec;
            videoRef.current.play().catch(() => {});
          } catch {}
        }
        setIsPlaying(true);
      });
    }
  }, [onSeekRequested]);

  // Natural HTML5 video time updates
  const handleNativeTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    // Organically check if we hit any checkpoint timestamp
    if (checkpoints && checkpoints.length > 0) {
      for (const cp of checkpoints) {
        if (
          curr >= cp.timestampSeconds &&
          curr <= cp.timestampSeconds + 1.5 &&
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
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback notice:', err);
        setIsPlaying(true);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      try {
        videoRef.current.currentTime = time;
      } catch {}
    }

    // Check if scrubbed directly into a checkpoint
    if (checkpoints) {
      for (const cp of checkpoints) {
        if (
          Math.abs(time - cp.timestampSeconds) < 2 &&
          !passedCheckpoints.includes(cp.timestampSeconds)
        ) {
          if (videoRef.current) videoRef.current.pause();
          setIsPlaying(false);
          setActiveCheckpoint(cp);
          setSelectedOption(null);
          setIsAnswerSubmitted(false);
          break;
        }
      }
    }
  };

  // AI Video Ingestion Handler (Parses uploaded video & auto-generates checkpoints)
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setCustomVideoSrc(localUrl);
    setIsIngesting(true);

    try {
      setIngestStep('Loading video container & extracting duration metadata...');
      await new Promise((r) => setTimeout(r, 500));

      // Get video duration
      const tempVideo = document.createElement('video');
      tempVideo.src = localUrl;
      await new Promise((resolve) => {
        tempVideo.onloadedmetadata = () => resolve(true);
        tempVideo.onerror = () => resolve(true);
      });

      const videoDur = tempVideo.duration && !isNaN(tempVideo.duration) && tempVideo.duration > 10 ? tempVideo.duration : 180;
      setDuration(videoDur);

      setIngestStep('Running AI Audio/Transcript segmentation across timeline...');
      await new Promise((r) => setTimeout(r, 600));

      setIngestStep('Synthesizing domain checkpoints & quiz rubrics...');
      const parseResult = await parseAndSynthesizeVideoCheckpoints(
        file.name,
        videoDur,
        lesson.title,
        geminiApiKey
      );

      setIngestStep('Linking dynamic knowledge nodes & updating RAG Copilot vectors...');
      await new Promise((r) => setTimeout(r, 500));

      // Apply newly synthesized checkpoints & sync globally without wiping video src
      setCheckpoints(parseResult.checkpoints);
      updateActiveLesson({
        title: parseResult.cleanedTitle,
        conceptCode: parseResult.conceptCode,
        transcriptRaw: parseResult.extractedTranscript,
        interactiveCheckpoints: parseResult.checkpoints,
        keyLearningOutcomes: parseResult.keyOutcomes,
        videoDuration: parseResult.durationSeconds,
        videoUrl: localUrl,
      });

      setCurrentTime(0);
      setIsPlaying(false);
      triggerMasteryCelebration();
    } catch (err) {
      console.error('Video parsing error:', err);
    } finally {
      setIsIngesting(false);
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
    if (videoRef.current) {
      try {
        videoRef.current.currentTime = nextTime;
        videoRef.current.play().catch(() => {});
      } catch {}
    }
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
        
        {/* Top Control Bar with AI Auto-Parser Uploader */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-indigo-400 font-bold">{lesson.conceptCode}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-medium truncate max-w-xs">{lesson.title}</span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 px-3 py-1.5 text-xs font-bold text-white shadow-glow transition-all">
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Video & Auto-Generate Quizzes</span>
            <input type="file" accept="video/mp4,video/webm" onChange={handleVideoUpload} className="hidden" />
          </label>
        </div>

        {/* Video Viewport */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          
          {/* Actual HTML5 Video Element */}
          <video
            ref={videoRef}
            key={videoSrc}
            src={videoSrc}
            onTimeUpdate={handleNativeTimeUpdate}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration || lesson.videoDuration || 300);
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="h-full w-full object-contain"
            playsInline
            controls={false}
          />

          {/* Play/Pause Center Click Overlay */}
          {!isPlaying && !activeCheckpoint && !isIngesting && (
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
            {checkpoints?.map((cp, idx) => {
              const leftPct = Math.min(96, Math.max(4, (cp.timestampSeconds / (duration || 300)) * 100));
              const isPassed = passedCheckpoints.includes(cp.timestampSeconds);
              return (
                <div
                  key={idx}
                  style={{ left: `${leftPct}%` }}
                  className="absolute -top-3 -translate-x-1/2 flex flex-col items-center pointer-events-auto cursor-pointer group"
                  title={`Checkpoint at ${formatTime(cp.timestampSeconds)}`}
                  onClick={() => {
                    if (videoRef.current) videoRef.current.pause();
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
                step={0.5}
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
                  onClick={() => {
                    const newTime = Math.max(0, currentTime - 10);
                    setCurrentTime(newTime);
                    if (videoRef.current) videoRef.current.currentTime = newTime;
                  }}
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
                  type="button"
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

      {/* AI Video Parsing Telemetry Modal */}
      {isIngesting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-indigo-500/50 bg-slate-900 p-6 shadow-2xl text-center space-y-4">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 shadow-glow">
              <RefreshCw className="h-7 w-7 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Video Ingestion Agent</h3>
              <p className="text-xs text-slate-400 mt-1">Autonomous transcript extraction & checkpoint synthesis</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-indigo-300 animate-pulse">
              {ingestStep}
            </div>
          </div>
        </div>
      )}

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
