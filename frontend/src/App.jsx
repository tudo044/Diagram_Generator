import React, { useState, useCallback } from 'react';
import { ReactFlow, MiniMap, Controls, Background, addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';
import dagre from 'dagre';

// Algoritmul magic pentru Auto-Layout
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 100 }); // Spațiere generoasă

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 }); // Mărime estimată
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'TB' ? 'top' : 'left';
    node.sourcePosition = direction === 'TB' ? 'bottom' : 'right';
    node.position = {
      x: nodeWithPosition.x - 75,
      y: nodeWithPosition.y - 25,
    };
  });

  return { nodes, edges };
};

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds)), []);

  const handleGenerate = async () => {
    if (!inputMsg) return;
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/generate-diagram', {
        prompt: inputMsg
      });
      
      if (response.data.nodes && response.data.edges) {
        // Aici aplicăm magia de aranjare automată
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          response.data.nodes,
          response.data.edges
        );
        
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      }
    } catch (error) {
      console.error("Eroare la generare:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#1e1e1e', color: 'white', fontFamily: 'sans-serif' }}>
      
      <div style={{ width: '250px', borderRight: '1px solid #333', padding: '20px', backgroundColor: '#252526' }}>
        <h3>Settings</h3>
        <label style={{ fontSize: '12px', color: '#aaa' }}>LLM Model</label>
        <select style={{ width: '100%', padding: '8px', marginTop: '5px', marginBottom: '20px', backgroundColor: '#3c3c3c', color: 'white', border: 'none', borderRadius: '4px' }}>
          <option>Llama 3 (Local)</option>
        </select>
      </div>

      <div style={{ width: '350px', borderRight: '1px solid #333', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h3>Chat</h3>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', backgroundColor: '#1e1e1e', padding: '10px', borderRadius: '8px' }}>
           <p style={{ fontSize: '14px', color: '#aaa' }}>Descrie diagrama...</p>
        </div>
        <textarea 
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Ex: Utilizatorul introduce parola..."
          style={{ width: '100%', height: '100px', backgroundColor: '#3c3c3c', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', resize: 'none' }}
        />
        <button 
          onClick={handleGenerate}
          disabled={loading}
          style={{ marginTop: '10px', padding: '10px', backgroundColor: '#6200ea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Generare...' : 'Generează Diagrama'}
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative', backgroundColor: '#f4f4f5' }}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#ccc" gap={16} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}