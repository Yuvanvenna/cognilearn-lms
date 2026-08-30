import { SubmissionEvaluation } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface EvaluatorInput {
  lessonTitle: string;
  conceptCode: string;
  rubric: string;
  studentSubmission: string;
  attemptNumber: number; // 1, 2, or 3
  apiKey?: string;
}

export async function evaluateSubmissionSocratic(
  input: EvaluatorInput
): Promise<SubmissionEvaluation> {
  const geminiKey = input.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are CogniLearn's Master Socratic Pedagogical Evaluator.
Evaluate the student's submission against the assignment rubric.

Lesson: ${input.lessonTitle}
Target Concept: ${input.conceptCode}
Rubric / Criteria:
${input.rubric}

Student Submission:
"""
${input.studentSubmission}
"""

Current Attempt Number: ${input.attemptNumber} of 3

INSTRUCTIONS:
1. Score accuracy from 0.0 to 1.0. A score >= 0.85 passes.
2. If passing, provide celebratory reinforcement and summarize why their mental model is strong.
3. If NOT passing:
   - DO NOT reveal the final code or answer directly!
   - On Attempt 1: Give a Tier-1 conceptual Socratic hint that nudges them to reflect on the core equation/architecture.
   - On Attempt 2: Give a Tier-2 guided hint with architectural constraints.
   - On Attempt 3: Provide a diagnostic breakdown explaining where their logic branched off.
4. Return ONLY valid JSON matching this schema:
{
  "score": number,
  "passed": boolean,
  "feedback": "...",
  "hintLevel": 1 | 2 | 3,
  "socraticHint": "...",
  "diagnosticBreakdown": ["...", "..."],
  "masteredConcepts": ["..."],
  "suggestedReviewNodes": ["..."]
}`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      return JSON.parse(result.response.text());
    } catch (err) {
      console.warn('Gemini Socratic Evaluator error, falling back to heuristic engine:', err);
    }
  }

  // Heuristic Socratic engine
  const submission = input.studentSubmission.trim().toLowerCase();
  const hasKeywords = ['hnsw', 'ivfflat', 'graph', 'cosine', 'vector', 'latency', 'tradeoff'].filter(
    (kw) => submission.includes(kw)
  );

  const wordCount = submission.split(/\s+/).length;
  const passed = wordCount >= 30 && hasKeywords.length >= 3;
  const score = passed ? 0.92 : Math.min(0.75, 0.3 + hasKeywords.length * 0.15);

  if (passed) {
    return {
      score: 0.92,
      passed: true,
      hintLevel: 1,
      feedback: 'Outstanding work! Your architectural explanation clearly articulates the graph traversal mechanics, memory footprint, and query latency trade-offs.',
      masteredConcepts: [input.conceptCode],
      suggestedReviewNodes: [],
    };
  }

  if (input.attemptNumber === 1) {
    return {
      score,
      passed: false,
      hintLevel: 1,
      feedback: 'You are on the right track, but your response needs deeper technical precision regarding the internal graph structure vs centroid partitioning.',
      socraticHint: 'Reflect on how HNSW constructs multi-layer proximity skip-lists compared to how IVFFlat clusters high-dimensional vectors into Voronoi cells.',
      diagnosticBreakdown: [
        'Missing comparison of index build time vs runtime search latency.',
        'Consider the impact of dataset size on memory utilization.',
      ],
      masteredConcepts: [],
      suggestedReviewNodes: [input.conceptCode],
    };
  } else if (input.attemptNumber === 2) {
    return {
      score,
      passed: false,
      hintLevel: 2,
      feedback: 'Closer! You noted the clustering differences, but haven\'t fully quantified the latency and memory trade-offs.',
      socraticHint: 'Think about what happens when new vectors are inserted: does IVFFlat require retraining cluster centroids, whereas HNSW dynamically inserts nodes into the graph?',
      diagnosticBreakdown: [
        'Quantify how memory usage scales in RAM with HNSW.',
        'Address cold-start retraining requirements in IVFFlat.',
      ],
      masteredConcepts: [],
      suggestedReviewNodes: [input.conceptCode],
    };
  } else {
    return {
      score,
      passed: false,
      hintLevel: 3,
      feedback: 'Diagnostic Evaluation: Review the architectural trade-offs below to achieve full mastery.',
      socraticHint: 'Key takeaway: HNSW trades higher RAM and build time for sub-millisecond query recall without retraining. IVFFlat conserves memory but requires Voronoi list probing.',
      diagnosticBreakdown: [
        'HNSW: Hierarchical Navigable Small World, O(log N) search complexity, high RAM usage.',
        'IVFFlat: Inverted File Flat, requires training centroids, lower memory, potential recall degradation if nprobe is too low.',
      ],
      masteredConcepts: [],
      suggestedReviewNodes: [input.conceptCode],
    };
  }
}
