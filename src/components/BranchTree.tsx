// ============================================================
// BranchTree — Zen Story Topology
// ============================================================
import { useState, useMemo } from 'react';
import { Lock, Check, Sparkles } from 'lucide-react';
import type { StorySchema, StoryNode } from '@/types';

interface BranchTreeProps {
  story: StorySchema;
  visitedNodes?: string[];
  unlockedEndings?: string[];
  compact?: boolean;
  onNodeClick?: (nodeId: string) => void;
}

interface NodePos {
  node: StoryNode;
  x: number;
  y: number;
  level: number;
}

export default function BranchTree({
  story,
  visitedNodes = [],
  unlockedEndings = [],
  compact = false,
  onNodeClick,
}: BranchTreeProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { positions, connections } = useMemo(() => {
    const posMap = new Map<string, NodePos>();
    const levels: StoryNode[][] = [];
    const visited = new Set<string>();

    const queue: { nodeId: string; level: number }[] = [
      { nodeId: story.startNodeId, level: 0 },
    ];

    while (queue.length > 0) {
      const { nodeId: id, level } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);

      if (!levels[level]) levels[level] = [];
      const node = story.nodes.find((n) => n.id === id);
      if (node) levels[level].push(node);

      node?.choices.forEach((c) => {
        if (!visited.has(c.targetNodeId)) {
          queue.push({ nodeId: c.targetNodeId, level: level + 1 });
        }
      });
    }

    const nodeWidth = compact ? 100 : 140;
    const nodeHeight = compact ? 36 : 48;
    const levelGap = compact ? 50 : 70;
    const nodeGap = compact ? 12 : 20;

    levels.forEach((levelNodes, levelIdx) => {
      const totalWidth = levelNodes.length * nodeWidth + (levelNodes.length - 1) * nodeGap;
      const startX = -totalWidth / 2 + nodeWidth / 2;

      levelNodes.forEach((node, i) => {
        posMap.set(node.id, {
          node,
          x: startX + i * (nodeWidth + nodeGap),
          y: levelIdx * (nodeHeight + levelGap),
          level: levelIdx,
        });
      });
    });

    const conns: Array<{
      from: string;
      to: string;
      fromPos: { x: number; y: number };
      toPos: { x: number; y: number };
    }> = [];

    posMap.forEach((pos, nodeId) => {
      pos.node.choices.forEach((choice) => {
        const targetPos = posMap.get(choice.targetNodeId);
        if (targetPos) {
          conns.push({
            from: nodeId,
            to: choice.targetNodeId,
            fromPos: { x: pos.x, y: pos.y + nodeHeight / 2 },
            toPos: { x: targetPos.x, y: targetPos.y - nodeHeight / 2 },
          });
        }
      });
    });

    return { positions: posMap, connections: conns };
  }, [story, compact]);

  const isVisited = (nodeId: string) => visitedNodes.includes(nodeId);
  const isEnding = (nodeId: string) => {
    const n = story.nodes.find((x) => x.id === nodeId);
    return n?.isEnding || false;
  };
  const isTrueEnding = (nodeId: string) => {
    const n = story.nodes.find((x) => x.id === nodeId);
    return n?.endingType === 'true';
  };

  const allEndings = story.nodes.filter((n) => n.isEnding);
  const normalEndings = allEndings.filter((n) => n.endingType !== 'true');
  const allNormalUnlocked = normalEndings.every((n) => unlockedEndings.includes(n.id));

  const treeHeight = (() => {
    let max = 0;
    positions.forEach((p) => {
      max = Math.max(max, p.y);
    });
    return max + (compact ? 50 : 80);
  })();

  return (
    <div className="w-full overflow-auto">
      <div
        className="relative mx-auto"
        style={{
          width: compact ? '100%' : '600px',
          height: treeHeight,
          minWidth: compact ? '300px' : '500px',
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          {connections.map((conn, i) => {
            const visited = isVisited(conn.from) && isVisited(conn.to);
            return (
              <path
                key={i}
                d={`M ${conn.fromPos.x + (compact ? 50 : 70)} ${conn.fromPos.y + (compact ? 18 : 24)}
                    C ${conn.fromPos.x + (compact ? 50 : 70)} ${conn.fromPos.y + (compact ? 18 : 24) + 30}
                    ${conn.toPos.x + (compact ? 50 : 70)} ${conn.toPos.y + (compact ? 18 : 24) - 30}
                    ${conn.toPos.x + (compact ? 50 : 70)} ${conn.toPos.y + (compact ? 18 : 24)}`}
                fill="none"
                stroke={visited ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.26)'}
                strokeWidth={1}
                strokeDasharray={visited ? 'none' : '4 4'}
              />
            );
          })}
        </svg>

        {Array.from(positions.values()).map((pos) => {
          const visited = isVisited(pos.node.id);
          const ending = isEnding(pos.node.id);
          const trueEnd = isTrueEnding(pos.node.id);
          const locked = trueEnd && !allNormalUnlocked;
          const hovered = hoveredNode === pos.node.id;

          return (
            <div
              key={pos.node.id}
              className={`absolute cursor-pointer transition-all duration-300 ${
                onNodeClick ? 'hover:scale-105' : ''
              }`}
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: pos.y,
                transform: 'translateX(-50%)',
                zIndex: hovered ? 10 : 1,
              }}
              onClick={() => onNodeClick?.(pos.node.id)}
              onMouseEnter={() => setHoveredNode(pos.node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div
                className={`
                  relative flex items-center justify-center rounded-lg border transition-all duration-300
                  ${compact ? 'px-2 py-1.5 w-[100px]' : 'px-3 py-2 w-[140px]'}
                  ${ending
                    ? 'border-white/[0.26] bg-white/[0.24]'
                    : visited
                    ? 'border-white/95 bg-white/[0.24]'
                    : 'border-white/[0.24] bg-white/[0.26]'
                  }
                  ${hovered && !locked ? 'border-white/95' : ''}
                  ${locked ? 'opacity-30' : ''}
                `}
              >
                <div className="absolute -top-1 -right-1">
                  {locked ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/[0.26] flex items-center justify-center">
                      <Lock size={7} className="text-white" />
                    </div>
                  ) : visited ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-white/[0.26] border border-white/95 flex items-center justify-center">
                      <Check size={7} className="text-white" />
                    </div>
                  ) : ending ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-white/[0.26] border border-white/[0.26] flex items-center justify-center">
                      <Sparkles size={7} className="text-white" />
                    </div>
                  ) : null}
                </div>

                <span
                  className={`
                    truncate text-center font-mono
                    ${compact ? 'text-[9px]' : 'text-[10px]'}
                    ${visited ? 'text-white/85' : ending ? 'text-white/85' : 'text-white/85'}
                  `}
                  style={{ letterSpacing: '0.05em' }}
                >
                  {locked ? '???' : pos.node.title}
                </span>
              </div>

              {pos.level === 0 && (
                <div className={`absolute -left-8 top-1/2 -translate-y-1/2 text-[7px] text-white/[0.26] font-mono ${compact ? 'hidden' : ''}`}>
                  START
                </div>
              )}
            </div>
          );
        })}

        {!compact && (
          <div className="absolute bottom-0 left-0 flex items-center gap-4 text-[8px] text-white/[0.26] font-mono">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/95 border border-white" />
              <span>已访问</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/[0.26] border border-white/[0.26]" />
              <span>结局</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/[0.26] border border-white/[0.26]" />
              <span>未访问</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BranchTreeMini({
  story,
  visitedNodes = [],
  unlockedEndings = [],
  onNodeClick,
}: BranchTreeProps) {
  return (
    <BranchTree
      story={story}
      visitedNodes={visitedNodes}
      unlockedEndings={unlockedEndings}
      compact={true}
      onNodeClick={onNodeClick}
    />
  );
}
