import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const STORAGE_KEY = 'ikigai-flow-state';

interface Circle {
  cx: number;
  cy: number;
  r: number;
  color: string;
  stroke: string;
  label: string;
}

interface Circles {
  love: Circle;
  good: Circle;
  paid: Circle;
  need: Circle;
}

const CIRCLES: Circles = {
  love: { cx: 1000, cy: 1000, r: 800, color: '#ec4899', stroke: '#f472b6', label: 'WHAT YOU\nLOVE' },
  good: { cx: 1800, cy: 1000, r: 800, color: '#3b82f6', stroke: '#60a5fa', label: "WHAT YOU'RE\nGOOD AT" },
  paid: { cx: 1800, cy: 1800, r: 800, color: '#22c55e', stroke: '#4ade80', label: 'WHAT YOU CAN\nBE PAID FOR' },
  need: { cx: 1000, cy: 1800, r: 800, color: '#eab308', stroke: '#fbbf24', label: 'WHAT THE\nWORLD NEEDS' },
};

const INTERSECTIONS = [
  { x: 1400, y: 720, label: 'Passion' },
  { x: 2080, y: 1400, label: 'Profession' },
  { x: 1400, y: 2080, label: 'Vocation' },
  { x: 720, y: 1400, label: 'Mission' },
];

interface IkigaiItemNodeData extends Record<string, unknown> {
  label: string;
  region: keyof Circles;
}

type IkigaiNode = Node<IkigaiItemNodeData>;

interface IkigaiItemNodeProps {
  data: IkigaiItemNodeData;
  selected: boolean;
}

// Custom node for user items
const IkigaiItemNode: React.FC<IkigaiItemNodeProps> = ({ data, selected }) => {
  const regionColor = CIRCLES[data.region]?.stroke || '#888';

  return (
    <div
      style={{
        background: regionColor,
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '40px',
        fontSize: '24px',
        fontWeight: 500,
        boxShadow: selected
          ? `0 0 0 4px #fff, 0 8px 24px ${regionColor}88`
          : `0 4px 16px rgba(0,0,0,0.3)`,
        cursor: 'grab',
        maxWidth: '300px',
        textAlign: 'center',
        wordWrap: 'break-word',
      }}
    >
      {data.label}
    </div>
  );
};

const nodeTypes = {
  ikigaiItem: IkigaiItemNode,
};

// SVG Background with Ikigai circles
const IkigaiBackground: React.FC = () => {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '2800px',
        height: '2800px',
        pointerEvents: 'none',
      }}
      viewBox="0 0 2800 2800"
      preserveAspectRatio="xMidYMid meet"
    >
      {Object.entries(CIRCLES).map(([key, circle]) => (
        <circle
          key={key}
          cx={circle.cx}
          cy={circle.cy}
          r={circle.r}
          fill={circle.color}
          fillOpacity={0.2}
          stroke={circle.stroke}
          strokeWidth={10}
        />
      ))}

      {/* Main circle labels */}
      <text x="560" y="520" textAnchor="middle" fill="#9ca3af" fontSize="56" fontWeight="700" letterSpacing="1.5">
        <tspan x="560" dy="0">WHAT YOU</tspan>
        <tspan x="560" dy="80">LOVE</tspan>
      </text>
      <text x="2240" y="520" textAnchor="middle" fill="#9ca3af" fontSize="56" fontWeight="700" letterSpacing="1.5">
        <tspan x="2240" dy="0">WHAT YOU&apos;RE</tspan>
        <tspan x="2240" dy="80">GOOD AT</tspan>
      </text>
      <text x="2240" y="2220" textAnchor="middle" fill="#9ca3af" fontSize="56" fontWeight="700" letterSpacing="1.5">
        <tspan x="2240" dy="0">WHAT YOU CAN</tspan>
        <tspan x="2240" dy="80">BE PAID FOR</tspan>
      </text>
      <text x="560" y="2220" textAnchor="middle" fill="#9ca3af" fontSize="56" fontWeight="700" letterSpacing="1.5">
        <tspan x="560" dy="0">WHAT THE</tspan>
        <tspan x="560" dy="80">WORLD NEEDS</tspan>
      </text>

      {/* Intersection labels */}
      {INTERSECTIONS.map((int, i) => (
        <text key={i} x={int.x} y={int.y} textAnchor="middle" fill="#6b7280" fontSize="48" fontWeight="500">
          {int.label}
        </text>
      ))}

      {/* Center IKIGAI label */}
      <text x="1400" y="1420" textAnchor="middle" fill="#fafafa" fontSize="72" fontWeight="800" letterSpacing="8">
        IKIGAI
      </text>
    </svg>
  );
};

// Determine region from position
const getRegion = (x: number, y: number): keyof Circles | null => {
  const regions: Array<{ name: keyof Circles; dist: number }> = [];
  for (const [name, circle] of Object.entries(CIRCLES)) {
    const dist = Math.sqrt((x - circle.cx) ** 2 + (y - circle.cy) ** 2);
    if (dist <= circle.r) {
      regions.push({ name: name as keyof Circles, dist });
    }
  }
  if (regions.length === 0) return null;
  regions.sort((a, b) => a.dist - b.dist);
  return regions[0].name;
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  region: keyof Circles | null;
}

// Modal component
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, region }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const regionInfo = region ? CIRCLES[region] : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '24px',
          width: '360px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{
          fontSize: '16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#fafafa',
        }}>
          <span style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: regionInfo?.stroke
          }} />
          Add item
        </h3>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && text.trim()) {
              onSave(text.trim());
            } else if (e.key === 'Escape') {
              onClose();
            }
          }}
          placeholder="Enter your item..."
          autoFocus
          style={{
            width: '100%',
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '12px 14px',
            color: '#fafafa',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid #333',
              color: '#888',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => text.trim() && onSave(text.trim())}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              background: '#fafafa',
              border: 'none',
              color: '#0a0a0a',
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

interface SidebarProps {
  nodes: Node[];
  onDelete: (id: string) => void;
  onClear: () => void;
  onExport: () => void;
}

// Sidebar component
const Sidebar: React.FC<SidebarProps> = ({ nodes, onDelete, onClear, onExport }) => {
  const itemNodes = nodes.filter((n): n is IkigaiNode => n.type === 'ikigaiItem');

  const groupedNodes = {
    love: itemNodes.filter(n => n.data.region === 'love'),
    good: itemNodes.filter(n => n.data.region === 'good'),
    paid: itemNodes.filter(n => n.data.region === 'paid'),
    need: itemNodes.filter(n => n.data.region === 'need'),
  };

  const categories = [
    { key: 'love' as keyof Circles, label: 'What you love', color: '#f472b6' },
    { key: 'good' as keyof Circles, label: "What you're good at", color: '#60a5fa' },
    { key: 'paid' as keyof Circles, label: 'What you can be paid for', color: '#4ade80' },
    { key: 'need' as keyof Circles, label: 'What the world needs', color: '#fbbf24' },
  ];

  return (
    <div style={{
      width: '320px',
      background: '#111',
      borderLeft: '1px solid #222',
      padding: '24px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <h2 style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '16px',
      }}>
        Your Ikigai
      </h2>

      {categories.map(cat => (
        <div key={cat.key} style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 500,
            padding: '8px 12px',
            borderRadius: '6px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: `${cat.color}22`,
            color: cat.color,
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color }} />
            {cat.label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {groupedNodes[cat.key].length === 0 ? (
              <div style={{ color: '#444', fontSize: '12px', fontStyle: 'italic', padding: '8px 12px' }}>
                Click on the diagram to add items
              </div>
            ) : (
              groupedNodes[cat.key].map(node => (
                <div
                  key={node.id}
                  style={{
                    background: '#1a1a1a',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #222',
                    color: '#fafafa',
                  }}
                >
                  <span>{node.data.label}</span>
                  <button
                    onClick={() => onDelete(node.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                      padding: '2px 6px',
                      fontSize: '16px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      <div style={{
        marginTop: 'auto',
        paddingTop: '16px',
        borderTop: '1px solid #222',
        display: 'flex',
        gap: '10px',
      }}>
        <button
          onClick={onExport}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            background: '#1a1a1a',
            border: '1px solid #333',
            color: '#888',
          }}
        >
          Export JSON
        </button>
        <button
          onClick={onClear}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            background: 'transparent',
            border: '1px solid #333',
            color: '#666',
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

interface FlowState {
  nodes: Node[];
  edges: Edge[];
}

// Load initial state from localStorage
const loadState = (): FlowState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as FlowState;
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return { nodes: [], edges: [] };
};

// Main Flow component
const IkigaiFlow: React.FC = () => {
  const initialState = useMemo(() => loadState(), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialState.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialState.edges);
  const [modalOpen, setModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [clickRegion, setClickRegion] = useState<keyof Circles | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Save to localStorage whenever nodes or edges change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const region = getRegion(position.x, position.y);
    if (region) {
      setClickPosition(position);
      setClickRegion(region);
      setModalOpen(true);
    }
  }, [screenToFlowPosition]);

  const handleSaveNode = useCallback((text: string) => {
    if (!clickPosition || !clickRegion) return;

    const newNode: Node = {
      id: `item-${Date.now()}`,
      type: 'ikigaiItem',
      position: clickPosition,
      data: { label: text, region: clickRegion },
    };

    setNodes((nds) => [...nds, newNode]);
    setModalOpen(false);
    setClickPosition(null);
    setClickRegion(null);
  }, [clickPosition, clickRegion, setNodes]);

  const handleDeleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  }, [setNodes]);

  const handleClear = useCallback(() => {
    if (confirm('Clear all items? This cannot be undone.')) {
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  const handleExport = useCallback(() => {
    const ikigaiNodes = nodes.filter((n): n is IkigaiNode => n.type === 'ikigaiItem');
    const data = {
      exported: new Date().toISOString(),
      nodes: ikigaiNodes.map(n => ({
        id: n.id,
        label: n.data.label,
        region: n.data.region,
        position: n.position,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ikigai.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          minZoom={0.1}
          maxZoom={4}
          defaultViewport={{ x: 0, y: 0, zoom: 0.35 }}
          style={{ background: 'transparent' }}
          proOptions={{ hideAttribution: true }}
        >
          <IkigaiBackground />
          <Controls
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
            }}
          />
          <Background color="#222" gap={80} />
        </ReactFlow>

        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#666',
          fontSize: '13px',
          pointerEvents: 'none',
          background: '#0a0a0acc',
          padding: '8px 16px',
          borderRadius: '6px',
        }}>
          Click anywhere on the diagram to add an item • Use mouse wheel to zoom • Drag to pan
        </div>
      </div>

      <Sidebar
        nodes={nodes}
        onDelete={handleDeleteNode}
        onClear={handleClear}
        onExport={handleExport}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveNode}
        region={clickRegion}
      />
    </div>
  );
};

// Wrap with provider
export default function App(): JSX.Element {
  return (
    <ReactFlowProvider>
      <IkigaiFlow />
    </ReactFlowProvider>
  );
}
