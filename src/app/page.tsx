'use client';

import React, { useState } from 'react';
import { StoreProvider, useStore } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { LearnerPortal } from '@/components/LearnerPortal';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { InstructorStudio } from '@/components/InstructorStudio';
import { AdminTelemetry } from '@/components/AdminTelemetry';

function MainApp() {
  const [activeTab, setActiveTab] = useState<'learn' | 'knowledge_graph' | 'instructor_studio' | 'admin_analytics'>('learn');
  const { activeCourse, setActiveLesson } = useStore();

  const handleSelectNodeLesson = (lessonId: string) => {
    // Find lesson across all modules in active course
    for (const mod of activeCourse.modules) {
      const found = mod.lessons.find((l) => l.id === lessonId);
      if (found) {
        setActiveLesson(found);
        setActiveTab('learn');
        return;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 pb-12">
        {activeTab === 'learn' && <LearnerPortal onOpenKnowledgeGraph={() => setActiveTab('knowledge_graph')} />}
        {activeTab === 'knowledge_graph' && (
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <KnowledgeGraph onSelectNodeLesson={handleSelectNodeLesson} />
          </div>
        )}
        {activeTab === 'instructor_studio' && <InstructorStudio />}
        {activeTab === 'admin_analytics' && <AdminTelemetry />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>CogniLearn OS</strong> — Autonomous Agentic LMS & Knowledge Graph Engine
          </div>
          <div className="text-[11px] text-slate-400">
            Node.js 22 • Next.js 15 App Router • React 19 • Tailwind CSS • Antigravity AI
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
