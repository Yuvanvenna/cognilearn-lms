'use client';

import React, { createContext, useContext, useState } from 'react';
import { Course, CourseModule, Lesson, KnowledgeNode, MasteryStatus, User } from '@/types';
import { INITIAL_COURSES, INITIAL_USER } from './mockData';
import confetti from 'canvas-confetti';

interface StoreContextType {
  user: User;
  courses: Course[];
  activeCourse: Course;
  activeLesson: Lesson | null;
  knowledgeNodes: KnowledgeNode[];
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  setActiveCourse: (course: Course) => void;
  setActiveLesson: (lesson: Lesson) => void;
  updateActiveLesson: (updatedFields: Partial<Lesson>) => void;
  updateNodeStatus: (conceptCode: string, status: MasteryStatus, score?: number) => void;
  addSynthesizedCourse: (course: Course) => void;
  triggerMasteryCelebration: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<User>(INITIAL_USER);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [activeCourse, setActiveCourseState] = useState<Course>(INITIAL_COURSES[0]);
  const [activeLesson, setActiveLessonState] = useState<Lesson | null>(
    INITIAL_COURSES[0].modules[0]?.lessons[0] || null
  );
  const [knowledgeNodes, setKnowledgeNodes] = useState<KnowledgeNode[]>(INITIAL_COURSES[0].knowledgeNodes);
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');

  const setActiveCourse = (course: Course) => {
    setActiveCourseState(course);
    setKnowledgeNodes(course.knowledgeNodes);
    if (course.modules[0]?.lessons[0]) {
      setActiveLessonState(course.modules[0].lessons[0]);
    } else {
      setActiveLessonState(null);
    }
  };

  const setActiveLesson = (lesson: Lesson) => {
    setActiveLessonState(lesson);
  };

  // Update active lesson and synchronize across course modules & knowledge nodes
  const updateActiveLesson = (updatedFields: Partial<Lesson>) => {
    if (!activeLesson) return;

    const mergedLesson: Lesson = {
      ...activeLesson,
      ...updatedFields,
    };

    setActiveLessonState(mergedLesson);

    // Update in activeCourse modules
    setActiveCourseState((prevCourse) => ({
      ...prevCourse,
      modules: prevCourse.modules.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((les) =>
          les.id === mergedLesson.id ? mergedLesson : les
        ),
      })),
    }));

    // Update or add knowledge node
    if (updatedFields.conceptCode && updatedFields.title) {
      setKnowledgeNodes((prevNodes) => {
        const exists = prevNodes.some((n) => n.conceptCode === updatedFields.conceptCode);
        if (exists) {
          return prevNodes.map((n) =>
            n.conceptCode === updatedFields.conceptCode
              ? { ...n, title: updatedFields.title || n.title, lessonId: mergedLesson.id }
              : n
          );
        } else {
          return [
            {
              id: `node-${Date.now()}`,
              courseId: activeCourse.id,
              lessonId: mergedLesson.id,
              conceptCode: updatedFields.conceptCode!,
              title: updatedFields.title!,
              description: `Mastery module for ${updatedFields.title}`,
              prerequisites: [],
              status: 'IN_PROGRESS',
              score: 0.5,
            },
            ...prevNodes,
          ];
        }
      });
    }
  };

  const updateNodeStatus = (conceptCode: string, status: MasteryStatus, score?: number) => {
    setKnowledgeNodes((prev) =>
      prev.map((node) => {
        if (node.conceptCode === conceptCode) {
          return {
            ...node,
            status,
            score: score !== undefined ? score : node.score,
          };
        }
        return node;
      })
    );

    if (status === 'MASTERED') {
      triggerMasteryCelebration();
      setKnowledgeNodes((prev) => {
        const masteredCodes = new Set(
          prev.filter((n) => n.status === 'MASTERED' || n.conceptCode === conceptCode).map((n) => n.conceptCode)
        );

        return prev.map((node) => {
          if (node.status === 'LOCKED' && node.prerequisites.length > 0) {
            const allPrereqsMet = node.prerequisites.every((p) => masteredCodes.has(p));
            if (allPrereqsMet) {
              return { ...node, status: 'AVAILABLE' };
            }
          }
          return node;
        });
      });
    }
  };

  const addSynthesizedCourse = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    setActiveCourse(newCourse);
    triggerMasteryCelebration();
  };

  const triggerMasteryCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#06b6d4', '#10b981', '#a855f7'],
      });
    } catch {}
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        courses,
        activeCourse,
        activeLesson,
        knowledgeNodes,
        geminiApiKey,
        setGeminiApiKey,
        setActiveCourse,
        setActiveLesson,
        updateActiveLesson,
        updateNodeStatus,
        addSynthesizedCourse,
        triggerMasteryCelebration,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
