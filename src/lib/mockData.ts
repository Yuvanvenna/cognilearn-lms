import { Course, User } from '@/types';

export const INITIAL_USER: User = {
  id: 'usr-alex-rivers-01',
  email: 'alex.learner@cognilearn.ai',
  name: 'Alex Rivers',
  role: 'STUDENT',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: new Date().toISOString(),
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-ai-rag-arch-01',
    title: 'Autonomous RAG & Agentic LLM Architectures',
    slug: 'autonomous-rag-agentic-llm',
    description: 'Master production-grade RAG, pgvector hybrid search, autonomous multi-agent orchestration, and dynamic knowledge graph routing.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    level: 'Advanced',
    estimatedHours: 14,
    published: true,
    instructorId: 'inst-dr-elena-01',
    instructorName: 'Dr. Elena Vance',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    knowledgeNodes: [
      {
        id: 'node-vec-embeddings',
        courseId: 'course-ai-rag-arch-01',
        lessonId: 'lesson-embeddings-chunking',
        conceptCode: 'VECTOR_EMBEDDINGS_AND_CHUNKING',
        title: 'Vector Embeddings & Semantic Chunking',
        description: 'Mathematical foundations of high-dimensional embedding spaces, cosine similarity, and contextual chunking strategies.',
        prerequisites: [],
        status: 'MASTERED',
        score: 0.95,
      },
      {
        id: 'node-pgvector-indexing',
        courseId: 'course-ai-rag-arch-01',
        lessonId: 'lesson-pgvector-hnsw',
        conceptCode: 'PGVECTOR_HNSW_INDEXING',
        title: 'Supabase pgvector & HNSW Search',
        description: 'Hierarchical Navigable Small World graphs vs IVFFlat indexes for millisecond nearest-neighbor search.',
        prerequisites: ['VECTOR_EMBEDDINGS_AND_CHUNKING'],
        status: 'MASTERED',
        score: 0.9,
      },
      {
        id: 'node-reranking-pipeline',
        courseId: 'course-ai-rag-arch-01',
        lessonId: 'lesson-reranking-fusion',
        conceptCode: 'CROSS_ENCODER_RERANKING',
        title: 'Cross-Encoder Reranking & Reciprocal Rank Fusion',
        description: 'Mitigating context dilution and lost-in-the-middle phenomena using Cohere/Cross-Encoder scoring.',
        prerequisites: ['PGVECTOR_HNSW_INDEXING'],
        status: 'IN_PROGRESS',
        score: 0.65,
      },
      {
        id: 'node-agentic-tool-use',
        courseId: 'course-ai-rag-arch-01',
        lessonId: 'lesson-agentic-tool-use',
        conceptCode: 'AUTONOMOUS_TOOL_CALLING',
        title: 'Agentic Tool Calling & Dynamic Routers',
        description: 'Building multi-turn ReAct loops and function dispatching with automated self-correction and validation.',
        prerequisites: ['CROSS_ENCODER_RERANKING'],
        status: 'AVAILABLE',
        score: 0.0,
      },
      {
        id: 'node-graph-rag-eval',
        courseId: 'course-ai-rag-arch-01',
        lessonId: 'lesson-eval-socratic',
        conceptCode: 'GRAPH_RAG_EVAL_BENCHMARKS',
        title: 'Knowledge Graph RAG & Socratic Benchmarking',
        description: 'Evaluating faithfulness, answer relevance, and context precision with automated synthetic testsets.',
        prerequisites: ['AUTONOMOUS_TOOL_CALLING'],
        status: 'LOCKED',
        score: 0.0,
      },
    ],
    modules: [
      {
        id: 'mod-foundations-rag',
        courseId: 'course-ai-rag-arch-01',
        title: 'Module 1: High-Performance Vector Retrieval & Indexing',
        orderIndex: 1,
        lessons: [
          {
            id: 'lesson-embeddings-chunking',
            moduleId: 'mod-foundations-rag',
            title: '1.1 Deep Dive: Semantic Chunking & 1536-dim Embedding Geometry',
            type: 'VIDEO',
            orderIndex: 1,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoDuration: 596,
            conceptCode: 'VECTOR_EMBEDDINGS_AND_CHUNKING',
            prerequisites: [],
            keyLearningOutcomes: [
              'Understand geometric vector space boundaries in high dimensions',
              'Implement token-aware semantic windowing with overlap',
              'Avoid semantic drift across heading breaks in technical documentation'
            ],
            transcriptRaw: `
[00:00] Welcome to CogniLearn's deep dive into semantic chunking and high-dimensional vector embeddings.
[00:25] In classical information retrieval, keyword matching failed to capture underlying semantic synonyms.
[00:50] When we generate embeddings using models like text-embedding-3-small or Gemini text-embedding-004, each text block is mapped to a 1536 or 768 dimensional hypersphere.
[01:20] Notice that cosine similarity calculates the angle theta between vectors rather than Euclidean distance, making it invariant to text length.
[01:55] A common mistake is fixed-size chunking (e.g. 500 characters). This splits sentences mid-thought, corrupting semantic integrity.
[02:30] Semantic chunking detects shifts in cosine similarity between adjacent sentences to find natural semantic boundaries.
[03:15] Let us look at how overlapping chunk windows preserve boundary context for cross-encoder rerankers.
[04:00] In the next section, we will see how Supabase pgvector uses HNSW indexes to query millions of vectors in under 5 milliseconds.
            `.trim(),
            interactiveCheckpoints: [
              {
                timestampSeconds: 80,
                question: 'Why is Cosine Similarity preferred over Euclidean Distance for text vector search in normalized embeddings?',
                options: [
                  'Cosine similarity measures the orientation/angle between vectors, invariant to token length magnitude.',
                  'Euclidean distance is only compatible with 2D coordinates.',
                  'Cosine similarity avoids using GPU compute.',
                  'Euclidean distance requires exact word match.'
                ],
                correctAnswerIndex: 0,
                explanation: 'Cosine similarity evaluates the cosine of the angle between two multi-dimensional vectors. When embeddings are unit-normalized, the cosine score directly represents semantic alignment irrespective of minor length variations.'
              },
              {
                timestampSeconds: 155,
                question: 'What is the primary drawback of arbitrary fixed-character chunking (e.g., rigid 256-character splits)?',
                options: [
                  'It increases database disk usage by 10x.',
                  'It frequently splits sentences or logical code blocks mid-thought, destroying semantic context.',
                  'It makes vector embeddings too large to index.',
                  'It cannot be stored in PostgreSQL pgvector.'
                ],
                correctAnswerIndex: 1,
                explanation: 'Fixed-size chunking ignores linguistic and semantic structure, slicing concepts in half and degrading retrieval accuracy during RAG lookups.'
              }
            ],
            embeddings: [
              {
                id: 'emb-1',
                lessonId: 'lesson-embeddings-chunking',
                startSec: 0,
                endSec: 45,
                chunkText: 'Overview of semantic chunking and vector space geometry in high dimensions.'
              },
              {
                id: 'emb-2',
                lessonId: 'lesson-embeddings-chunking',
                startSec: 46,
                endSec: 105,
                chunkText: 'Cosine similarity calculation between text embeddings on a 1536-dimensional hypersphere and why it is invariant to text length.'
              },
              {
                id: 'emb-3',
                lessonId: 'lesson-embeddings-chunking',
                startSec: 106,
                endSec: 180,
                chunkText: 'Pitfalls of fixed-size chunking and how semantic boundary detection prevents context corruption.'
              },
              {
                id: 'emb-4',
                lessonId: 'lesson-embeddings-chunking',
                startSec: 181,
                endSec: 260,
                chunkText: 'Window overlap techniques and preparing chunks for Supabase pgvector HNSW indexing.'
              }
            ]
          },
          {
            id: 'lesson-pgvector-hnsw',
            moduleId: 'mod-foundations-rag',
            title: '1.2 Production Indexing: Supabase pgvector & HNSW Graphs',
            type: 'VIDEO',
            orderIndex: 2,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            videoDuration: 653,
            conceptCode: 'PGVECTOR_HNSW_INDEXING',
            prerequisites: ['VECTOR_EMBEDDINGS_AND_CHUNKING'],
            keyLearningOutcomes: [
              'Configure pgvector with vector(1536) columns in Supabase',
              'Compare IVFFlat vs HNSW indexing performance trade-offs',
              'Execute hybrid queries combining SQL filters with vector cosine distance (<=>)'
            ],
            transcriptRaw: `
[00:00] In this lesson, we configure PostgreSQL on Supabase with the pgvector extension.
[00:30] We define vector columns with 1536 dimensions and create an HNSW index using cosine operator classes.
[01:10] HNSW creates hierarchical proximity graphs allowing sub-linear logarithmic search times without needing full scans.
[02:00] We will also write hybrid SQL queries combining metadata filters (e.g. course_id and user_id) with vector similarity.
            `.trim(),
            interactiveCheckpoints: [
              {
                timestampSeconds: 70,
                question: 'Which PostgreSQL operator is used in pgvector to calculate Cosine Distance?',
                options: [
                  '<=>',
                  '<->',
                  '<#>',
                  '==='
                ],
                correctAnswerIndex: 0,
                explanation: 'In pgvector: <=> calculates Cosine Distance (1 - cosine similarity), <-> calculates Euclidean L2 distance, and <#> calculates negative inner product.'
              }
            ]
          }
        ]
      },
      {
        id: 'mod-agentic-workflows',
        courseId: 'course-ai-rag-arch-01',
        title: 'Module 2: Agentic Multi-Turn Loops & Socratic Evaluation',
        orderIndex: 2,
        lessons: [
          {
            id: 'lesson-reranking-fusion',
            moduleId: 'mod-agentic-workflows',
            title: '2.1 Reciprocal Rank Fusion & Cross-Encoder Precision',
            type: 'ARTICLE',
            orderIndex: 1,
            conceptCode: 'CROSS_ENCODER_RERANKING',
            prerequisites: ['PGVECTOR_HNSW_INDEXING'],
            keyLearningOutcomes: [
              'Understand Bi-Encoder vs Cross-Encoder latency and precision trade-offs',
              'Implement Reciprocal Rank Fusion (RRF) to merge dense and sparse keyword results',
              'Eliminate hallucination by setting relevance score thresholds'
            ],
            articleBody: `# Cross-Encoder Reranking & Hybrid Fusion

While bi-encoders generate independent vector embeddings for fast nearest neighbor search, **cross-encoders** evaluate the query and document chunk simultaneously across all transformer attention layers.

### The Two-Stage Retrieval Architecture
1. **Stage 1 (Bi-Encoder Retrieval):** High-recall search in Supabase pgvector fetches the top 50 candidate passages in < 10ms.
2. **Stage 2 (Cross-Encoder Reranking):** Cross-encoder scores and reorders the top 50 candidates, returning the top 5 high-precision chunks to the LLM prompt.

### Reciprocal Rank Fusion (RRF) Formula
$$RRF\\_Score(d \\in D) = \\sum_{m \\in M} \\frac{1}{k + r_m(d)}$$

Where $k$ is a smoothing constant (typically 60) and $r_m(d)$ is the rank of document $d$ in ranking system $m$.`
          },
          {
            id: 'lesson-agentic-tool-use',
            moduleId: 'mod-agentic-workflows',
            title: '2.2 Autonomous Tool Calling & Dynamic Routing Loops',
            type: 'VIDEO',
            orderIndex: 2,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            videoDuration: 420,
            conceptCode: 'AUTONOMOUS_TOOL_CALLING',
            prerequisites: ['CROSS_ENCODER_RERANKING'],
            keyLearningOutcomes: [
              'Design deterministic tool-calling schemas with JSON schema validation',
              'Implement fallback error correction when agents provide malformed arguments',
              'Coordinate subagents for multi-step data synthesis'
            ],
            transcriptRaw: `
[00:00] Autonomous agent loops rely on structured tool calling to interact with external environments.
[00:40] Instead of raw unstructured completions, the model outputs structured JSON representing function calls.
[01:30] We examine how our CogniLearn Curriculum Synthesizer Agent decomposes raw markdown or PDF documents into validated course schemas.
            `.trim(),
            interactiveCheckpoints: []
          },
          {
            id: 'lesson-eval-socratic',
            moduleId: 'mod-agentic-workflows',
            title: '2.3 Interactive Lab: Building a Socratic Evaluator Agent',
            type: 'ASSIGNMENT',
            orderIndex: 3,
            conceptCode: 'GRAPH_RAG_EVAL_BENCHMARKS',
            prerequisites: ['AUTONOMOUS_TOOL_CALLING'],
            keyLearningOutcomes: [
              'Build a 3-tier Socratic hinting agent',
              'Grade student submissions against structured rubrics without leaking answers',
              'Update student mastery records in real time'
            ],
            articleBody: `### Assignment Prompt: Build an Adaptive Socratic Assessment Function

Write a Python or TypeScript agent function that evaluates a learner's explanation of **HNSW indexing vs IVFFlat indexing**.

**Grading Rubric Criteria:**
1. Mentions that HNSW builds multi-layer proximity graphs while IVFFlat uses Voronoi cell clustering.
2. Identifies that HNSW has higher build memory/time but superior query latency and recall without needing retraining.
3. Suggests proper indexing strategy based on dataset scale.

**Submission Guidelines:**
Provide your structured JSON evaluation prompt or code implementation below. The CogniLearn Socratic Evaluator will evaluate your submission.`
          }
        ]
      }
    ]
  },
  {
    id: 'course-fullstack-nextjs-ai-02',
    title: 'Full-Stack Next.js 15 & Real-Time AI Systems',
    slug: 'fullstack-nextjs15-realtime-ai',
    description: 'Build enterprise Next.js 15 applications with Server Components, Supabase Auth RBAC, SSE streaming, and glassmorphic UI design.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    level: 'Intermediate',
    estimatedHours: 10,
    published: true,
    instructorId: 'inst-marcus-dev-02',
    instructorName: 'Marcus Vance',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    knowledgeNodes: [
      {
        id: 'node-nextjs-rsc',
        courseId: 'course-fullstack-nextjs-ai-02',
        conceptCode: 'NEXTJS_REACT_SERVER_COMPONENTS',
        title: 'React Server Components & Streaming SSR',
        description: 'Zero-bundle-size server components, suspense boundaries, and streaming UI pipelines.',
        prerequisites: [],
        status: 'MASTERED',
        score: 1.0,
      },
      {
        id: 'node-sse-streaming',
        courseId: 'course-fullstack-nextjs-ai-02',
        conceptCode: 'SERVER_SENT_EVENTS_STREAMING',
        title: 'SSE Streaming & AI Tokens',
        description: 'Handling chunked streaming responses from LLM endpoints using ReadableStreams and fetch.',
        prerequisites: ['NEXTJS_REACT_SERVER_COMPONENTS'],
        status: 'AVAILABLE',
        score: 0.0,
      }
    ],
    modules: [
      {
        id: 'mod-nextjs-core',
        courseId: 'course-fullstack-nextjs-ai-02',
        title: 'Module 1: Next.js 15 App Router & Server Architecture',
        orderIndex: 1,
        lessons: [
          {
            id: 'lesson-rsc-deepdive',
            moduleId: 'mod-nextjs-core',
            title: '1.1 React Server Components & Streaming Hydration',
            type: 'VIDEO',
            orderIndex: 1,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            videoDuration: 734,
            conceptCode: 'NEXTJS_REACT_SERVER_COMPONENTS',
            prerequisites: [],
            keyLearningOutcomes: [
              'Understand Server vs Client Component boundaries',
              'Optimize page load times with streaming Suspense',
              'Secure sensitive environment keys on the server layer'
            ],
            transcriptRaw: `
[00:00] Next.js 15 leverages React 19 and Server Components by default.
[00:35] Server components execute exclusively on the server, producing rendered HTML and React flight data without adding JavaScript to client bundles.
            `.trim(),
            interactiveCheckpoints: []
          }
        ]
      }
    ]
  }
];
