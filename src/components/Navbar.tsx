'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Sparkles,
  BookOpen,
  Network,
  Wand2,
  BarChart3,
  Key,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Layers
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'learn' | 'knowledge_graph' | 'instructor_studio' | 'admin_analytics';
  setActiveTab: (tab: 'learn' | 'knowledge_graph' | 'instructor_studio' | 'admin_analytics') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, courses, activeCourse, setActiveCourse, geminiApiKey, setGeminiApiKey } = useStore();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(geminiApiKey);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  const handleSaveKey = () => {
    setGeminiApiKey(tempKey);
    setShowKeyModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('learn')}>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-glow">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-white">CogniLearn</span>
                  <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/30">
                    OS v2.4
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">AI-Native Adaptive LMS</p>
              </div>
            </div>

            {/* Course Selector Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                className="flex items-center gap-2 rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-200 border border-slate-700/60 hover:border-indigo-500/50 transition-all"
              >
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span className="max-w-[200px] truncate">{activeCourse.title}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showCourseDropdown && (
                <div className="absolute left-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-2xl z-50">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Available Courses
                  </div>
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => {
                        setActiveCourse(course);
                        setShowCourseDropdown(false);
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition-colors ${
                        course.id === activeCourse.id
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                      <div>
                        <div className="font-semibold line-clamp-1">{course.title}</div>
                        <div className="text-[10px] text-slate-400">{course.level} • {course.estimatedHours}h estimated</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('learn')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                activeTab === 'learn'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>Learner Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge_graph')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                activeTab === 'knowledge_graph'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Network className="h-4 w-4 text-cyan-400" />
              <span>Knowledge Graph</span>
            </button>

            <button
              onClick={() => setActiveTab('instructor_studio')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                activeTab === 'instructor_studio'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Wand2 className="h-4 w-4 text-amber-400" />
              <span>AI Synthesizer</span>
            </button>

            <button
              onClick={() => setActiveTab('admin_analytics')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                activeTab === 'admin_analytics'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <span>Telemetry</span>
            </button>
          </nav>

          {/* Right Action: Free-tier AI Badge & Key Configuration */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300 hover:border-indigo-500/40 hover:text-white transition-colors"
              title="Configure Gemini API Key"
            >
              <Key className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {geminiApiKey ? 'Custom Key Active' : 'Free AI Engine (Zero-Cost)'}
              </span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full border border-indigo-500/40 object-cover"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-200">{user.name}</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Adaptive Learner
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Engine Configuration</h3>
                <p className="text-xs text-slate-400">CogniLearn OS runs 100% free with built-in fallbacks</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              You can optionally enter a <strong>Google Gemini API Key</strong> (which has a 100% Free Tier on Google AI Studio). If left blank, CogniLearn OS will automatically use its internal zero-cost autonomous simulation agents!
            </p>

            <input
              type="password"
              placeholder="AIzaSy... (Optional Gemini Key)"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-4"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowKeyModal(false)}
                className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-glow transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" /> Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
