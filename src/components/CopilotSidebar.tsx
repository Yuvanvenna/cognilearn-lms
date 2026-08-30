'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Lesson, ChatMessage } from '@/types';
import { askVideoCopilot } from '@/lib/agents/videoRagCopilot';
import { useStore } from '@/lib/store';
import {
  Sparkles,
  Send,
  Clock,
  ExternalLink,
  Bot,
  User as UserIcon,
  HelpCircle,
  Lightbulb,
  CornerDownLeft
} from 'lucide-react';

interface CopilotSidebarProps {
  lesson: Lesson;
  currentTime: number;
  onSeek: (seconds: number) => void;
}

export const CopilotSidebar: React.FC<CopilotSidebarProps> = ({ lesson, currentTime, onSeek }) => {
  const { geminiApiKey } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content: `Hello! I am your **CogniLearn In-Video AI Copilot**.\n\nI have full indexing of this lecture's transcript, slide checkpoints, and code snippets. Ask me anything or click any timestamp to jump straight to that moment in the video.`,
      createdAt: new Date().toISOString(),
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await askVideoCopilot({
        question: q,
        lesson,
        currentPlaybackTime: currentTime,
        chatHistory: messages,
        apiKey: geminiApiKey,
      });

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered a temporary issue processing your question. Please try again.',
          createdAt: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Rich formatted renderer with proper headings, bold tags, and clickable timestamp badges
  const renderFormattedMessage = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();

      // Heading 3: ### Title
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={lineIdx} className="text-xs font-bold text-indigo-300 mt-2.5 mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>{trimmed.replace(/^###\s*/, '')}</span>
          </h4>
        );
      }

      // Bullet points: * Item or - Item
      const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
      const textToParse = isBullet ? trimmed.replace(/^[\*\-•]\s*/, '') : line;

      // Inline parser for timestamps [MM:SS] and **bold**
      const parseInline = (text: string) => {
        // Regex to capture [MM:SS] or **bold**
        const tokenRegex = /(\[\d{2}:\d{2}\]|\*\*[^*]+\*\*|\$[^\$]+\$)/g;
        const elements = [];
        let lastIdx = 0;
        let match;

        while ((match = tokenRegex.exec(text)) !== null) {
          if (match.index > lastIdx) {
            elements.push(text.substring(lastIdx, match.index));
          }

          const token = match[0];

          // Timestamp Badge: [MM:SS]
          if (token.startsWith('[') && token.endsWith(']')) {
            const timeStr = token.slice(1, -1);
            const [m, s] = timeStr.split(':').map(Number);
            const totalSec = m * 60 + s;

            elements.push(
              <button
                key={`badge-${match.index}`}
                type="button"
                onClick={() => onSeek(totalSec)}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-500/25 px-1.5 py-0.5 text-[11px] font-mono font-bold text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500 hover:text-white transition-all shadow-sm mx-1 align-baseline cursor-pointer"
                title={`Jump lecture to ${timeStr}`}
              >
                <Clock className="h-3 w-3 text-cyan-400" />
                <span>{timeStr}</span>
              </button>
            );
          }
          // Bold text: **text**
          else if (token.startsWith('**') && token.endsWith('**')) {
            elements.push(
              <strong key={`bold-${match.index}`} className="font-bold text-white">
                {token.slice(2, -2)}
              </strong>
            );
          }
          // Math notation: $formula$
          else if (token.startsWith('$') && token.endsWith('$')) {
            elements.push(
              <span key={`math-${match.index}`} className="font-mono text-cyan-300 bg-slate-950/80 px-1 py-0.5 rounded text-[11px]">
                {token.slice(1, -1)}
              </span>
            );
          }

          lastIdx = match.index + token.length;
        }

        if (lastIdx < text.length) {
          elements.push(text.substring(lastIdx));
        }

        return elements;
      };

      if (isBullet) {
        return (
          <div key={lineIdx} className="flex items-start gap-2 text-xs text-slate-300 my-1 pl-1">
            <span className="text-indigo-400 font-bold mt-0.5">•</span>
            <div className="leading-relaxed">{parseInline(textToParse)}</div>
          </div>
        );
      }

      if (!trimmed) {
        return <div key={lineIdx} className="h-1.5" />;
      }

      return (
        <p key={lineIdx} className="text-xs text-slate-300 leading-relaxed my-0.5">
          {parseInline(line)}
        </p>
      );
    });
  };

  const quickPrompts = [
    'Explain this concept in simple terms',
    'Why is cosine similarity preferred?',
    'What are the key trade-offs?'
  ];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 p-4 bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white shadow-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              RAG Video Copilot
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400 border border-emerald-500/30">
                Grounding Active
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Timestamped Q&A synced to lecture</p>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs leading-relaxed ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'border border-slate-800 bg-slate-900/90 text-slate-200 shadow-sm'
              }`}
            >
              <div>{renderFormattedMessage(msg.content)}</div>

              {/* Grounded Citations Box */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3.5 border-t border-slate-800/80 pt-2.5 space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-cyan-400" /> Grounded Timestamp Citations
                  </div>
                  {msg.citations.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSeek(c.startSec)}
                      className="flex w-full items-start gap-2 rounded-xl bg-slate-950/80 p-2.5 text-left text-[11px] text-slate-300 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950 transition-all group"
                    >
                      <span className="shrink-0 rounded-lg bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        {Math.floor(c.startSec / 60).toString().padStart(2, '0')}:{(c.startSec % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="line-clamp-2 italic text-slate-400 group-hover:text-slate-200 transition-colors">&ldquo;{c.quote}&rdquo;</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                <UserIcon className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse pl-2">
            <Sparkles className="h-4 w-4" />
            <span>AI Copilot is searching transcript vectors...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="border-t border-slate-800/80 bg-slate-950/50 p-2 overflow-x-auto flex gap-1.5 no-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(qp)}
            className="shrink-0 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-300 hover:border-indigo-500/40 hover:text-white transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="border-t border-slate-800 p-3 bg-slate-900/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask question about current timestamp..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors shadow-glow"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
