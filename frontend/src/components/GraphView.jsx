import { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
  Handle,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const PersonNode = ({ data }) => (
  <div className="relative px-4 py-3 bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-xl shadow-xl min-w-[200px] border-2 border-white/20">
    <Handle
      type="target"
      position={Position.Left}
      className="!w-3 !h-3 !bg-primary-300 !border-2 !border-white !-left-1.5"
    />
    <div className="flex items-center space-x-3 mb-1">
      <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
        <span className="text-primary-700 font-bold text-sm">
          {data.name?.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-sm leading-snug truncate">{data.name}</div>
        <div className="text-xs text-primary-100 truncate">{data.title}</div>
      </div>
    </div>
    <Handle
      type="source"
      position={Position.Right}
      className="!w-3 !h-3 !bg-primary-300 !border-2 !border-white !-right-1.5"
    />
  </div>
);

const EventNode = ({ data }) => (
  <div className="relative px-4 py-3 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-xl shadow-xl min-w-[200px] border-2 border-white/20">
    <Handle
      type="target"
      position={Position.Left}
      className="!w-3 !h-3 !bg-amber-300 !border-2 !border-white !-left-1.5"
    />
    <div className="min-w-0">
      <div className="text-xs font-semibold uppercase tracking-wider text-amber-200 mb-0.5">
        Event
      </div>
      <div className="font-bold text-sm leading-snug truncate">{data.name}</div>
      <div className="text-xs text-amber-100 truncate">{data.date}</div>
    </div>
    <Handle
      type="source"
      position={Position.Right}
      className="!w-3 !h-3 !bg-amber-300 !border-2 !border-white !-right-1.5"
    />
  </div>
);

const CompanyNode = ({ data }) => (
  <div className="relative px-4 py-3 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl shadow-xl min-w-[200px] border-2 border-white/20">
    <Handle
      type="target"
      position={Position.Left}
      className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white !-left-1.5"
    />
    <div className="min-w-0">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-0.5">
        Company
      </div>
      <div className="font-bold text-sm leading-snug truncate">{data.name}</div>
      <div className="text-xs text-slate-300 truncate">{data.industry}</div>
    </div>
    <Handle
      type="source"
      position={Position.Right}
      className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white !-right-1.5"
    />
  </div>
);

const TopicNode = ({ data }) => (
  <div className="relative px-4 py-3 bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-xl shadow-xl min-w-[200px] border-2 border-white/20">
    <Handle
      type="target"
      position={Position.Left}
      className="!w-3 !h-3 !bg-emerald-300 !border-2 !border-white !-left-1.5"
    />
    <div className="min-w-0">
      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-200 mb-0.5">
        Topic Interest
      </div>
      <div className="font-bold text-sm leading-snug truncate">#{data.name}</div>
    </div>
    <Handle
      type="source"
      position={Position.Right}
      className="!w-3 !h-3 !bg-emerald-300 !border-2 !border-white !-right-1.5"
    />
  </div>
);

const nodeTypes = {
  person: PersonNode,
  event: EventNode,
  company: CompanyNode,
  topic: TopicNode,
};

export default function GraphView({ pathData }) {
  const apiNodes = useMemo(() => pathData?.nodes || [], [pathData]);
  const relationships = useMemo(() => pathData?.relationships || [], [pathData]);

  const initialNodes = useMemo(() => {
    return apiNodes.map((node, index) => {
      const nodeType = node.title
        ? 'person'
        : node.date
        ? 'event'
        : node.industry
        ? 'company'
        : 'topic';

      return {
        id: String(node.id || `node-${index}`),
        type: nodeType,
        position: { x: index * 280, y: 150 },
        data: node,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [apiNodes]);

  const initialEdges = useMemo(() => {
    return relationships.map((rel, index) => {
      const sourceId = String(apiNodes[index]?.id || `node-${index}`);
      const targetId = String(apiNodes[index + 1]?.id || `node-${index + 1}`);

      return {
        id: `edge-${index}-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        label: rel.type,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#4f46e5',
        },
        labelStyle: {
          fontSize: 11,
          fontWeight: 700,
          fill: '#312e81',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
        labelBgStyle: {
          fill: '#ffffff',
          fillOpacity: 0.95,
          rx: 6,
          ry: 6,
          stroke: '#c7d2fe',
          strokeWidth: 1,
        },
        labelBgPadding: [8, 4],
        style: {
          stroke: '#4f46e5',
          strokeWidth: 3,
        },
      };
    });
  }, [relationships, apiNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Synchronize when initialNodes or initialEdges change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  return (
    <div className="w-full h-[480px] bg-slate-900/5 rounded-2xl border border-slate-200 overflow-hidden shadow-inner relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Background color="#94a3b8" gap={24} size={1.5} />
        <Controls className="bg-white rounded-xl shadow-md border border-slate-200 m-4" />
        <MiniMap
          nodeStrokeColor="#64748b"
          nodeColor="#6366f1"
          maskColor="rgba(241, 245, 249, 0.75)"
          className="bg-white rounded-xl border border-slate-200 shadow-md m-4"
        />
      </ReactFlow>
    </div>
  );
}