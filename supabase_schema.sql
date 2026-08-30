-- ============================================================
-- CogniLearn OS — Complete Supabase PostgreSQL Schema & Seed
-- ============================================================

-- 1. Enable pgvector Extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create Enums
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ContentType" AS ENUM ('VIDEO', 'ARTICLE', 'INTERACTIVE_LAB', 'QUIZ', 'ASSIGNMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MasteryStatus" AS ENUM ('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'MASTERED', 'NEEDS_REMEDIATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Tables
CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Course" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "instructorId" TEXT NOT NULL,
    "instructorName" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS "CourseModule" (
    "id" TEXT PRIMARY KEY,
    "courseId" TEXT NOT NULL REFERENCES "Course"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Lesson" (
    "id" TEXT PRIMARY KEY,
    "moduleId" TEXT NOT NULL REFERENCES "CourseModule"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "type" "ContentType" NOT NULL DEFAULT 'VIDEO',
    "orderIndex" INTEGER NOT NULL,
    "videoUrl" TEXT,
    "videoDuration" INTEGER,
    "transcriptRaw" TEXT,
    "articleBody" TEXT,
    "conceptCode" TEXT NOT NULL,
    "keyLearningOutcomes" JSONB DEFAULT '[]'::jsonb,
    "interactiveCheckpoints" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS "LessonEmbedding" (
    "id" TEXT PRIMARY KEY,
    "lessonId" TEXT NOT NULL REFERENCES "Lesson"("id") ON DELETE CASCADE,
    "startSec" INTEGER NOT NULL,
    "endSec" INTEGER NOT NULL,
    "chunkText" TEXT NOT NULL,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS "KnowledgeNode" (
    "id" TEXT PRIMARY KEY,
    "courseId" TEXT NOT NULL REFERENCES "Course"("id") ON DELETE CASCADE,
    "lessonId" TEXT,
    "conceptCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prerequisites" JSONB DEFAULT '[]'::jsonb,
    "status" "MasteryStatus" NOT NULL DEFAULT 'LOCKED',
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS "ChatSession" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT PRIMARY KEY,
    "sessionId" TEXT NOT NULL REFERENCES "ChatSession"("id") ON DELETE CASCADE,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "citations" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Submission" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "conceptCode" TEXT NOT NULL,
    "submissionText" TEXT NOT NULL,
    "evaluation" JSONB,
    "score" DOUBLE PRECISION,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_embeddings_lesson ON "LessonEmbedding"("lessonId");
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_course ON "KnowledgeNode"("courseId");
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON "ChatMessage"("sessionId");

-- 5. Seed Initial Production AI Course
INSERT INTO "Course" ("id", "title", "slug", "description", "thumbnailUrl", "published", "instructorId", "instructorName")
VALUES (
    'course-ai-rag-arch-01',
    'Autonomous RAG & Agentic LLM Architectures',
    'autonomous-rag-agentic-llm',
    'Master production-grade RAG, pgvector hybrid search, autonomous multi-agent orchestration, and dynamic knowledge graph routing.',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    true,
    'inst-dr-elena-01',
    'Dr. Elena Vance'
) ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CourseModule" ("id", "courseId", "title", "orderIndex")
VALUES (
    'mod-foundations-rag',
    'course-ai-rag-arch-01',
    'Module 1: High-Performance Vector Retrieval & Indexing',
    1
) ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Lesson" ("id", "moduleId", "title", "type", "orderIndex", "videoUrl", "videoDuration", "transcriptRaw", "conceptCode", "keyLearningOutcomes", "interactiveCheckpoints")
VALUES (
    'lesson-embeddings-chunking',
    'mod-foundations-rag',
    '1.1 Deep Dive: Semantic Chunking & 1536-dim Embedding Geometry',
    'VIDEO',
    1,
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    596,
    '[00:00] Welcome to CogniLearn deep dive into semantic chunking and high-dimensional vector embeddings.\n[00:50] Each text block is mapped to a 1536 dimensional hypersphere.\n[01:20] Cosine similarity calculates the angle theta between vectors.\n[02:30] Semantic chunking detects shifts in cosine similarity.',
    'VECTOR_EMBEDDINGS_AND_CHUNKING',
    '["Understand geometric vector space boundaries", "Implement token-aware semantic windowing"]'::jsonb,
    '[{"timestampSeconds": 80, "question": "Why is Cosine Similarity preferred over Euclidean Distance?", "options": ["Cosine similarity measures angle invariant to length magnitude", "Euclidean requires 2D", "Cosine avoids GPU", "Euclidean requires exact match"], "correctAnswerIndex": 0, "explanation": "Cosine similarity evaluates orientation irrespective of length."}]'::jsonb
) ON CONFLICT ("id") DO NOTHING;

INSERT INTO "KnowledgeNode" ("id", "courseId", "lessonId", "conceptCode", "title", "description", "prerequisites", "status", "score")
VALUES 
('node-vec-embeddings', 'course-ai-rag-arch-01', 'lesson-embeddings-chunking', 'VECTOR_EMBEDDINGS_AND_CHUNKING', 'Vector Embeddings & Semantic Chunking', 'Mathematical foundations of high-dimensional embedding spaces.', '[]'::jsonb, 'MASTERED', 0.95),
('node-pgvector-indexing', 'course-ai-rag-arch-01', 'lesson-embeddings-chunking', 'PGVECTOR_HNSW_INDEXING', 'Supabase pgvector & HNSW Search', 'Hierarchical Navigable Small World graphs for fast vector search.', '["VECTOR_EMBEDDINGS_AND_CHUNKING"]'::jsonb, 'IN_PROGRESS', 0.70)
ON CONFLICT ("id") DO NOTHING;
