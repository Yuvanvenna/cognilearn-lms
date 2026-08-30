# ARCHITECTURAL BLUEPRINT & AGENT EXECUTION SPECIFICATION
## System: CogniLearn OS — Next-Generation AI-Native Adaptive LMS
**Target Engine:** Antigravity AI Orchestration & Next.js / Express.js Ecosystem  
**Target Environment:** Node.js 20+ / TypeScript / Supabase (PostgreSQL + pgvector + Supabase Auth) / Redis

---

## 1. High-Level Architecture Overview

```
                                    +-------------------------------------------------------------+
                                    |                      CLIENT LAYER                           |
                                    |  Next.js 15 (App Router) + Tailwind CSS + shadcn/ui         |
                                    |  - Adaptive Learner Portal (Video + Timestamped AI Sidebar) |
                                    |  - Instructor Studio (1-Click Curriculum Synthesizer)       |
                                    |  - Admin & Analytics Control Center                         |
                                    +------------------------------+------------------------------+
                                                                   | HTTP / WebSockets / SSE
                                                                   v
                                    +-------------------------------------------------------------+
                                    |                    API & GATEWAY LAYER                      |
                                    |  Node.js + Express.js API Gateway (TypeScript)              |
                                    |  - Supabase JWT Auth & RBAC Verification                    |
                                    |  - Real-Time Event Telemetry Ingestion (BullMQ / Redis)     |
                                    +------------------------------+------------------------------+
                                                                   |
                                    +------------------------------+------------------------------+
                                    |                                                             |
                                    v                                                             v
+-------------------------------------------------------+     +-------------------------------------------------------+
|             ANTIGRAVITY AGENTIC PIPELINES             |     |           SUPABASE DATA & STORAGE LAYER               |
|                                                       |     |                                                       |
|  1. Ingestion & Course Synthesizer Agent              |     |  Supabase PostgreSQL (Users, Courses, Nodes)          |
|     (PDF/Video -> Structured JSON Curriculum Tree)    |     |  pgvector Extension (Knowledge Embeddings)            |
|                                                       |     |  Supabase Auth (JWT & Role Management)                |
|  2. Real-Time RAG Video Copilot Agent                 |     |  Supabase Storage (Course assets, PDFs, uploads)      |
|     (Timestamped transcript lookup & grounded Q&A)    |     |  Redis (Session cache, real-time rate limits, queues) |
|                                                       |     |  Mux / Cloudflare Stream (Adaptive HLS Video)         |
|  3. Dynamic Assessment & Rubric Evaluator             |     +-------------------------------------------------------+
|     (Multi-attempt Socratic hints + Code evaluator)   |
|                                                       |
|  4. Knowledge Graph Prerequisite Adaptive Router      |
|     (Dynamically reorders modules based on mastery)   |
+-------------------------------------------------------+
```

---

## 2. Complete PostgreSQL Database Schema (Prisma Data Model for Supabase)

Save this as `prisma/schema.prisma`:

```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

enum UserRole {
  STUDENT
  INSTRUCTOR
  ADMIN
}

enum ContentType {
  VIDEO
  ARTICLE
  INTERACTIVE_LAB
  QUIZ
  ASSIGNMENT
}

enum MasteryStatus {
  LOCKED
  AVAILABLE
  IN_PROGRESS
  MASTERED
  NEEDS_REMEDIATION
}

model User {
  id            String          @id @db.Uuid
  email         String          @unique
  name          String?
  role          UserRole        @default(STUDENT)
  avatarUrl     String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  enrollments   Enrollment[]
  nodeProgress  NodeProgress[]
  chatSessions  ChatSession[]
  submissions   Submission[]
}

model Course {
  id            String          @id @default(uuid())
  title         String
  slug          String          @unique
  description   String?
  thumbnailUrl  String?
  published     Boolean         @default(false)
  instructorId  String          @db.Uuid
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  modules       CourseModule[]
  knowledgeNodes KnowledgeNode[]
  enrollments   Enrollment[]
}

model CourseModule {
  id            String          @id @default(uuid())
  courseId      String
  course        Course          @relation(fields: [courseId], references: [id], onDelete: Cascade)
  title         String
  orderIndex    Int
  lessons       Lesson[]
  createdAt     DateTime        @default(now())
}

model Lesson {
  id            String          @id @default(uuid())
  moduleId      String
  module        CourseModule    @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  title         String
  type          ContentType     @default(VIDEO)
  orderIndex    Int
  videoUrl      String?
  videoDuration Int?            // in seconds
  transcriptRaw String?         @db.Text
  articleBody   String?         @db.Text
  createdAt     DateTime        @default(now())

  embeddings    LessonEmbedding[]
  nodeLinks     KnowledgeNode[]
}

model LessonEmbedding {
  id            String                      @id @default(uuid())
  lessonId      String
  lesson        Lesson                      @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  startSec      Int
  endSec        Int
  chunkText     String                      @db.Text
  embedding     Unsupported("vector(1536)")
  createdAt     DateTime                    @default(now())

  @@index([lessonId])
}

model KnowledgeNode {
  id            String          @id @default(uuid())
  courseId      String
  course        Course          @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessonId      String?
  lesson        Lesson?         @relation(fields: [lessonId], references: [id])
  conceptCode   String          // e.g. "GRAPH_TRAVERSAL_DFS"
  title         String
  description   String?
  prerequisites KnowledgeNode[] @relation("NodePrerequisites")
  dependents    KnowledgeNode[] @relation("NodePrerequisites")

  progressRecords NodeProgress[]
}

model Enrollment {
  id            String          @id @default(uuid())
  userId        String          @db.Uuid
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId      String
  course        Course          @relation(fields: [courseId], references: [id], onDelete: Cascade)
  enrolledAt    DateTime        @default(now())
  completedAt   DateTime?

  @@unique([userId, courseId])
}

model NodeProgress {
  id            String          @id @default(uuid())
  userId        String          @db.Uuid
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  nodeId        String
  node          KnowledgeNode   @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  status        MasteryStatus   @default(LOCKED)
  score         Float           @default(0.0) // 0.0 to 1.0
  lastActivity  DateTime        @default(now())

  @@unique([userId, nodeId])
}

model ChatSession {
  id            String          @id @default(uuid())
  userId        String          @db.Uuid
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessonId      String
  messages      ChatMessage[]
  createdAt     DateTime        @default(now())
}

model ChatMessage {
  id            String          @id @default(uuid())
  sessionId     String
  session       ChatSession     @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  role          String          // "user" | "assistant" | "system"
  content       String          @db.Text
  citations     Json?           // Array of [{ startSec: 120, endSec: 155, quote: "..." }]
  createdAt     DateTime        @default(now())
}

model Submission {
  id            String          @id @default(uuid())
  userId        String          @db.Uuid
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessonId      String
  submissionText String         @db.Text
  evaluation    Json?           // Detailed rubric scores, suggestions, and hints
  score         Float?
  passed        Boolean         @default(false)
  createdAt     DateTime        @default(now())
}
```

---

## 3. Antigravity Agent Definitions & Prompt Schemas

### Agent 1: Curriculum Synthesis Agent (Ingestion)
**Role:** Ingests unstructured inputs (PDFs from Supabase Storage, raw text, lecture notes, or syllabi) and outputs a strictly validated JSON structure ready for database seeding.

```json
{
  "agent_id": "course_synthesizer_v1",
  "system_prompt": "You are CogniLearn's Master Curriculum Architect. Given raw source material, decompose it into a structured modular course graph with atomic knowledge nodes, explicit prerequisite dependencies, and time-coded learning checkpoints. Output strictly valid JSON matching the schema.",
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "CourseStructureSchema",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "courseTitle": { "type": "string" },
          "courseSummary": { "type": "string" },
          "modules": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "moduleTitle": { "type": "string" },
                "orderIndex": { "type": "integer" },
                "lessons": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "title": { "type": "string" },
                      "type": { "type": "string", "enum": ["VIDEO", "ARTICLE", "QUIZ", "ASSIGNMENT"] },
                      "conceptCode": { "type": "string" },
                      "prerequisites": { "type": "array", "items": { "type": "string" } },
                      "keyLearningOutcomes": { "type": "array", "items": { "type": "string" } },
                      "interactiveCheckpoints": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "timestampSeconds": { "type": "integer" },
                            "question": { "type": "string" },
                            "options": { "type": "array", "items": { "type": "string" } },
                            "correctAnswerIndex": { "type": "integer" },
                            "explanation": { "type": "string" }
                          },
                          "required": ["timestampSeconds", "question", "options", "correctAnswerIndex", "explanation"]
                        }
                      }
                    },
                    "required": ["title", "type", "conceptCode", "prerequisites", "keyLearningOutcomes", "interactiveCheckpoints"]
                  }
                }
              },
              "required": ["moduleTitle", "orderIndex", "lessons"]
            }
          }
        },
        "required": ["courseTitle", "courseSummary", "modules"]
      }
    }
  }
}
```

---

### Agent 2: Timestamped In-Video RAG Copilot
**Role:** Provides contextual answers to learner questions during lecture playback with video timestamp citations.

```json
{
  "agent_id": "video_rag_copilot_v1",
  "system_prompt": "You are the CogniLearn In-Video AI Tutor. You have access to Supabase pgvector search results containing video transcript chunks, slide text, and course documentation with exact start and end timestamps. Answer the student's question clearly, concisely, and cite exact timestamps where the concept was discussed. Never invent facts outside the transcript context. If the concept is outside the course scope, politely guide them back.",
  "parameters": {
    "temperature": 0.2,
    "max_tokens": 512
  }
}
```

---

### Agent 3: Adaptive Assessment & Socratic Feedback Agent
**Role:** Evaluates submissions and generates progressive Socratic hints.

```json
{
  "agent_id": "socratic_evaluator_v1",
  "system_prompt": "You are a master pedagogical coach. When evaluating a student's answer or code attempt: 1) Score accuracy from 0.0 to 1.0 against the rubric. 2) If incorrect, DO NOT reveal the final answer. Provide a Tier-1 Socratic hint guiding their mental model. 3) If on Attempt #3, provide a diagnostic breakdown explaining where their logic branched off.",
  "parameters": {
    "temperature": 0.3
  }
}
```

---

## 4. End-to-End Execution Workflow

```
1. CONTENT CREATOR FLOW:
   [Creator Uploads Video / PDF to Supabase Storage]
            |
            v
   [Express.js Background Queue (BullMQ / Redis)]
      ├─> Whisper API / Deepgram (Extract Transcripts + Timestamps)
      ├─> Antigravity Course Synthesizer Agent (Generate Course Tree + Checkpoints)
      ├─> Text Chunking & Embeddings (text-embedding-3-small -> Supabase pgvector)
      └─> Persist Course, Modules, Lessons, Nodes in Supabase PostgreSQL

2. LEARNER ACTIVE SESSION FLOW:
   [Learner Authenticates via Supabase Auth & Plays Video]
      ├─> Video Player hits checkpoint timestamp -> Pause & Trigger Interactive Quiz
      ├─> Learner asks question in sidebar -> Video RAG Agent retrieves top-3 vector chunks via Supabase pgvector -> Returns answer with [MM:SS] jump links
      └─> Learner submits assignment -> Socratic Evaluator assesses mastery -> Updates KnowledgeNode status in Supabase
```

---

## 5. Step-by-Step Antigravity Implementation Tasks

### Phase 1: Project Scaffolding & Supabase Integration
* Initialize repository with Next.js 15 App Router (`src/app`), Tailwind CSS, `@supabase/supabase-js`, and `shadcn/ui`.
* Configure Supabase PostgreSQL with `pgvector` extension enabled.
* Apply the Prisma schema and sync with Supabase (`npx prisma db push`).
* Setup Supabase Auth middleware in Express.js with RBAC verification (`STUDENT`, `INSTRUCTOR`, `ADMIN`).

### Phase 2: Ingestion Pipeline & AI Orchestrator
* Create Express.js Route Handlers for file uploads (`/api/v1/courses/synthesize`) using Supabase Storage.
* Integrate Antigravity agent workflow to take unstructured syllabi and auto-populate course hierarchies.
* Build the chunking & embedding pipeline using OpenAI `text-embedding-3-small` and store them in `LessonEmbedding` via Supabase `pgvector`.

### Phase 3: Interactive Learner Experience
* Build the dynamic video player (`/courses/[slug]/learn/[lessonId]`) with custom overlay for in-video checkpoints.
* Build the Copilot Sidebar with streaming responses and clickable timestamp links that seek the video player (`playerRef.current.seekTo(timestamp)`).
* Build the Knowledge Graph visualizer using `@xyflow/react` (React Flow) showing student mastery nodes (`LOCKED`, `IN_PROGRESS`, `MASTERED`).

### Phase 4: Socratic Assessment & Instructor Studio
* Implement the submission and grading endpoint wired to the Socratic Evaluator Agent.
* Build the Instructor Studio UI allowing 1-click publishing and live student telemetry dashboards backed by Supabase.
* Run end-to-end verification and deploy frontend on Vercel and Express.js API on Render/Railway.
