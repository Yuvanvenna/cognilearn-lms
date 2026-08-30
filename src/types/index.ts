export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export type ContentType = 'VIDEO' | 'ARTICLE' | 'INTERACTIVE_LAB' | 'QUIZ' | 'ASSIGNMENT';

export type MasteryStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'MASTERED' | 'NEEDS_REMEDIATION';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface InteractiveCheckpoint {
  timestampSeconds: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface LessonEmbedding {
  id: string;
  lessonId: string;
  startSec: number;
  endSec: number;
  chunkText: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: ContentType;
  orderIndex: number;
  videoUrl?: string;
  videoDuration?: number; // in seconds
  transcriptRaw?: string;
  articleBody?: string;
  conceptCode: string;
  prerequisites: string[];
  keyLearningOutcomes: string[];
  interactiveCheckpoints?: InteractiveCheckpoint[];
  embeddings?: LessonEmbedding[];
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface KnowledgeNode {
  id: string;
  courseId: string;
  lessonId?: string;
  conceptCode: string;
  title: string;
  description: string;
  prerequisites: string[]; // array of conceptCodes
  status?: MasteryStatus;
  score?: number;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  published: boolean;
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string;
  modules: CourseModule[];
  knowledgeNodes: KnowledgeNode[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatCitation {
  startSec: number;
  endSec: number;
  quote: string;
  lessonTitle?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: ChatCitation[];
  createdAt: string;
}

export interface SubmissionEvaluation {
  score: number; // 0.0 to 1.0
  passed: boolean;
  feedback: string;
  hintLevel: 1 | 2 | 3;
  socraticHint?: string;
  diagnosticBreakdown?: string[];
  masteredConcepts: string[];
  suggestedReviewNodes?: string[];
}
