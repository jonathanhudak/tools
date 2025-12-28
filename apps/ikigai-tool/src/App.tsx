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

interface CircleNodeData extends Record<string, unknown> {
  circle: Circle;
  circleKey: keyof Circles;
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
        background: '#1a1a1a',
        border: `2px solid ${regionColor}`,
        color: '#fafafa',
        padding: '16px 24px',
        borderRadius: '40px',
        fontSize: '24px',
        fontWeight: 500,
        boxShadow: selected
          ? `0 0 0 4px ${regionColor}, 0 8px 24px ${regionColor}88`
          : `0 4px 16px rgba(0,0,0,0.4)`,
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

// Custom node for background circles
const CircleNode: React.FC<{ data: CircleNodeData }> = ({ data }) => {
  const { circle } = data;
  const r = circle.r;
  const size = r * 2;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        pointerEvents: 'none',
        position: 'relative',
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <circle
          cx={r}
          cy={r}
          r={r}
          fill={circle.color}
          fillOpacity={0.2}
          stroke={circle.stroke}
          strokeWidth={10}
        />
      </svg>
    </div>
  );
};

// Custom node for text labels
const LabelNode: React.FC<{ data: { text: string; fontSize: number; color: string; lines?: string[]; lineStart?: { x: number; y: number }; lineEnd?: { x: number; y: number } } }> = ({ data }) => {
  const lines = data.lines || [data.text];
  const hasLine = data.lineStart && data.lineEnd;

  return (
    <div style={{ pointerEvents: 'none', position: 'relative' }}>
      {hasLine && data.lineStart && data.lineEnd && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '800px',
            height: '200px',
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          <line
            x1={data.lineStart.x}
            y1={data.lineStart.y}
            x2={data.lineEnd.x}
            y2={data.lineEnd.y}
            stroke={data.color}
            strokeWidth={2}
            strokeOpacity={0.5}
          />
        </svg>
      )}
      <div
        style={{
          textAlign: 'center',
          color: data.color,
          fontSize: `${data.fontSize}px`,
          fontWeight: 700,
          letterSpacing: '1.5px',
          lineHeight: 1.4,
          whiteSpace: 'nowrap',
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
};

const nodeTypes = {
  ikigaiItem: IkigaiItemNode,
  circle: CircleNode,
  label: LabelNode,
};

// Create static background nodes
const createBackgroundNodes = (): Node[] => {
  const nodes: Node[] = [];

  // Add circle nodes
  Object.entries(CIRCLES).forEach(([key, circle]) => {
    nodes.push({
      id: `circle-${key}`,
      type: 'circle',
      position: { x: circle.cx - circle.r, y: circle.cy - circle.r },
      data: { circle, circleKey: key },
      draggable: false,
      selectable: false,
      zIndex: -100,
    });
  });

  // Add main circle labels (positioned outside circles with connecting lines)
  const mainLabels = [
    {
      circle: CIRCLES.love,
      text: 'WHAT YOU LOVE',
      position: { x: 200, y: 1000 },
      lineStart: { x: 300, y: 28 },
      lineEnd: { x: 200, y: 28 }
    },
    {
      circle: CIRCLES.good,
      text: "WHAT YOU'RE GOOD AT",
      position: { x: 2000, y: 1000 },
      lineStart: { x: 0, y: 28 },
      lineEnd: { x: 100, y: 28 }
    },
    {
      circle: CIRCLES.paid,
      text: 'WHAT YOU CAN BE PAID FOR',
      position: { x: 2000, y: 1800 },
      lineStart: { x: 0, y: 28 },
      lineEnd: { x: 100, y: 28 }
    },
    {
      circle: CIRCLES.need,
      text: 'WHAT THE WORLD NEEDS',
      position: { x: 200, y: 1800 },
      lineStart: { x: 300, y: 28 },
      lineEnd: { x: 200, y: 28 }
    },
  ];

  mainLabels.forEach((label, i) => {
    nodes.push({
      id: `main-label-${i}`,
      type: 'label',
      position: label.position,
      data: {
        text: label.text,
        fontSize: 56,
        color: '#9ca3af',
        lineStart: label.lineStart,
        lineEnd: label.lineEnd
      },
      draggable: false,
      selectable: false,
      zIndex: -99,
    });
  });

  // Add intersection labels
  INTERSECTIONS.forEach((int, i) => {
    nodes.push({
      id: `intersection-label-${i}`,
      type: 'label',
      position: { x: int.x - 100, y: int.y - 24 },
      data: { text: int.label, fontSize: 48, color: '#6b7280' },
      draggable: false,
      selectable: false,
      zIndex: -98,
    });
  });

  // Add center IKIGAI label
  nodes.push({
    id: 'center-label',
    type: 'label',
    position: { x: 1400 - 150, y: 1400 - 36 },
    data: { text: 'IKIGAI', fontSize: 72, color: '#fafafa' },
    draggable: false,
    selectable: false,
    zIndex: -97,
  });

  return nodes;
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
  onImport: (file: File) => void;
}

// Sidebar component
const Sidebar: React.FC<SidebarProps> = ({ nodes, onDelete, onClear, onExport, onImport }) => {
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
        flexDirection: 'column',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
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
          <label
            htmlFor="import-file"
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
              textAlign: 'center',
            }}
          >
            Import JSON
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onImport(file);
                  e.target.value = '';
                }
              }}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <button
          onClick={onClear}
          style={{
            width: '100%',
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
  const backgroundNodes = createBackgroundNodes();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved) as FlowState;
      // Merge saved user nodes with background nodes
      const userNodes = state.nodes.filter(n => n.type === 'ikigaiItem');
      return {
        nodes: [...backgroundNodes, ...userNodes],
        edges: state.edges
      };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return { nodes: backgroundNodes, edges: [] };
};

// Main Flow component
const IkigaiFlow: React.FC = () => {
  const initialState = useMemo(() => loadState(), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialState.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialState.edges);
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [clickRegion, setClickRegion] = useState<keyof Circles | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Save to localStorage whenever nodes or edges change (only save user nodes)
  useEffect(() => {
    const userNodes = nodes.filter(n => n.type === 'ikigaiItem');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes: userNodes, edges }));
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

  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.nodes || !Array.isArray(data.nodes)) {
          alert('Invalid JSON file format. Expected a file with a "nodes" array.');
          return;
        }

        // Convert imported data to React Flow nodes
        const importedNodes: Node[] = data.nodes.map((n: { id: string; label: string; region: keyof Circles; position: { x: number; y: number } }) => ({
          id: n.id || `item-${Date.now()}-${Math.random()}`,
          type: 'ikigaiItem',
          position: n.position || { x: 1400, y: 1400 },
          data: {
            label: n.label,
            region: n.region || 'love',
          },
        }));

        // Get background nodes
        const backgroundNodes = createBackgroundNodes();

        // Replace all nodes with background + imported nodes
        setNodes([...backgroundNodes, ...importedNodes]);

        alert(`Successfully imported ${importedNodes.length} items!`);
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import JSON file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, [setNodes]);

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
          colorMode="dark"
          style={{ background: 'transparent' }}
          proOptions={{ hideAttribution: true }}
        >
          <Controls
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
            }}
          />
          <Background color="#222" gap={80} />
        </ReactFlow>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#fafafa',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10,
          }}
        >
          {sidebarOpen ? '← Hide Panel' : 'Show Panel →'}
        </button>

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

      {sidebarOpen && (
        <Sidebar
          nodes={nodes}
          onDelete={handleDeleteNode}
          onClear={handleClear}
          onExport={handleExport}
          onImport={handleImport}
        />
      )}

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
