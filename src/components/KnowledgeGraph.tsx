'use client';

import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  Handle,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '@/lib/store';
import { KnowledgeNode, MasteryStatus } from '@/types';
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';

interface KnowledgeGraphProps {
  onSelectNodeLesson?: (lessonId: string) => void;
}

// Custom Node Component for React Flow
const ConceptNodeComponent = ({ data }: { data: { node: KnowledgeNode; onSelect?: () => void } }) => {
  const node = data.node;

  const statusConfig: Record<
    MasteryStatus,
    { label: string; bg: string; border: string; text: string; icon: any }
  > = {
    MASTERED: {
      label: 'Mastered',
      bg: 'bg-emerald-950/70',
      border: 'border-emerald-500/80 shadow-glow-emerald',
      text: 'text-emerald-400',
      icon: CheckCircle2,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-indigo-950/70',
      border: 'border-indigo-500/80 shadow-glow',
      text: 'text-indigo-400',
      icon: PlayCircle,
    },
    AVAILABLE: {
      label: 'Available',
      bg: 'bg-cyan-950/70',
      border: 'border-cyan-500/80 shadow-glow-cyan',
      text: 'text-cyan-400',
      icon: Sparkles,
    },
    LOCKED: {
      label: 'Prerequisites Needed',
      bg: 'bg-slate-900/60',
      border: 'border-slate-800',
      text: 'text-slate-500',
      icon: Lock,
    },
    NEEDS_REMEDIATION: {
      label: 'Needs Review',
      bg: 'bg-rose-950/70',
      border: 'border-rose-500/80',
      text: 'text-rose-400',
      icon: AlertCircle,
    },
  };

  const currentStatus = node.status || 'LOCKED';
  const cfg = statusConfig[currentStatus];
  const IconComponent = cfg.icon;

  return (
    <div
      onClick={data.onSelect}
      className={`group w-72 cursor-pointer rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 hover:scale-105 ${cfg.bg} ${cfg.border}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-indigo-500 !w-2.5 !h-2.5" />
      
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {node.conceptCode}
        </span>
        <div className={`flex items-center gap-1 text-[11px] font-semibold ${cfg.text}`}>
          <IconComponent className="h-3.5 w-3.5" />
          <span>{cfg.label}</span>
        </div>
      </div>

      <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1.5">
        {node.title}
      </h4>

      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
        {node.description}
      </p>

      {/* Progress Bar if available */}
      {node.score !== undefined && node.score > 0 && (
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
          <div
            className={`h-full rounded-full ${
              node.status === 'MASTERED' ? 'bg-emerald-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${Math.round(node.score * 100)}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
        <span>Prereqs: {node.prerequisites.length === 0 ? 'None (Root)' : node.prerequisites.length}</span>
        <span className="flex items-center gap-0.5 text-indigo-400 group-hover:underline">
          Launch Node <ArrowRight className="h-3 w-3" />
        </span>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-cyan-500 !w-2.5 !h-2.5" />
    </div>
  );
};

const nodeTypes = {
  conceptNode: ConceptNodeComponent,
};

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ onSelectNodeLesson }) => {
  const { knowledgeNodes, activeCourse, updateNodeStatus } = useStore();

  // Build React Flow graph layout
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const nodePositions: Record<string, { x: number; y: number }> = {};
    const colSpacing = 340;
    const rowSpacing = 160;

    // Arrange nodes into visual columns based on prerequisite depth
    const depths: Record<string, number> = {};
    const getDepth = (conceptCode: string): number => {
      if (depths[conceptCode] !== undefined) return depths[conceptCode];
      const kn = knowledgeNodes.find((n) => n.conceptCode === conceptCode);
      if (!kn || !kn.prerequisites || kn.prerequisites.length === 0) {
        depths[conceptCode] = 0;
        return 0;
      }
      const maxParent = Math.max(...kn.prerequisites.map(getDepth));
      depths[conceptCode] = maxParent + 1;
      return depths[conceptCode];
    };

    knowledgeNodes.forEach((kn) => getDepth(kn.conceptCode));

    const depthCounts: Record<number, number> = {};
    knowledgeNodes.forEach((kn) => {
      const d = depths[kn.conceptCode] || 0;
      const row = depthCounts[d] || 0;
      depthCounts[d] = row + 1;

      const posX = 60 + d * colSpacing;
      const posY = 60 + row * rowSpacing;
      nodePositions[kn.conceptCode] = { x: posX, y: posY };

      nodes.push({
        id: kn.conceptCode,
        type: 'conceptNode',
        position: { x: posX, y: posY },
        data: {
          node: kn,
          onSelect: () => {
            if (kn.lessonId && onSelectNodeLesson) {
              onSelectNodeLesson(kn.lessonId);
            }
          },
        },
      });
    });

    // Create directed edges for prerequisites
    knowledgeNodes.forEach((kn) => {
      kn.prerequisites.forEach((prereqCode) => {
        edges.push({
          id: `edge-${prereqCode}-${kn.conceptCode}`,
          source: prereqCode,
          target: kn.conceptCode,
          animated: kn.status === 'IN_PROGRESS' || kn.status === 'AVAILABLE',
          style: {
            stroke: kn.status === 'MASTERED' ? '#10b981' : '#6366f1',
            strokeWidth: 2,
          },
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [knowledgeNodes, onSelectNodeLesson]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-[calc(100vh-140px)] w-full rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl relative">
      {/* Overlay Banner */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3 backdrop-blur-xl shadow-xl">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            Adaptive Knowledge Graph Engine
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[9px] font-semibold text-indigo-300 border border-indigo-500/30">
              Topology Router Active
            </span>
          </h3>
          <p className="text-[10px] text-slate-400">
            {activeCourse.title} • {knowledgeNodes.filter((n) => n.status === 'MASTERED').length}/{knowledgeNodes.length} Concepts Mastered
          </p>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        className="bg-[#070a12]"
      >
        <Background color="#1e293b" gap={24} size={1.5} />
        <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300 rounded-xl overflow-hidden shadow-xl" />
        <MiniMap
          nodeColor={(n) => {
            const kn = (n.data as any)?.node as KnowledgeNode;
            if (kn?.status === 'MASTERED') return '#10b981';
            if (kn?.status === 'IN_PROGRESS') return '#6366f1';
            return '#334155';
          }}
          className="!bg-slate-900/90 !border-slate-800 rounded-xl overflow-hidden shadow-xl"
        />
      </ReactFlow>
    </div>
  );
};
