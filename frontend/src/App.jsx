import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlow, MiniMap, Controls, Background, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';
import dagre from 'dagre';

const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 140 });
  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: 180, height: 60 }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);
  return {
    nodes: nodes.map((node) => {
      const { x, y } = dagreGraph.node(node.id);
      return { ...node, position: { x: x - 90, y: y - 30 }, style: { ...node.style, color: 'white', fontWeight: 'bold', width: 180, textAlign: 'center' } };
    }),
    edges
  };
};

export default function App() {
  const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem('ai_sessions')) || {});
  const [activeId, setActiveId] = useState(() => localStorage.getItem('active_session_id') || null);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Funcție pentru a crea un chat nou
  const createNewChat = () => {
    const id = Date.now().toString();
    const newSession = {
      id,
      name: `Chat ${Object.keys(sessions).length + 1}`,
      history: [],
      nodes: [],
      edges: []
    };
    setSessions(prev => ({ ...prev, [id]: newSession }));
    setActiveId(id);
  };

  // Inițializare dacă nu există nicio sesiune
  useEffect(() => {
    if (Object.keys(sessions).length === 0) createNewChat();
    else if (!activeId) setActiveId(Object.keys(sessions)[0]);
  }, []);

  // Salvare automată
  useEffect(() => {
    localStorage.setItem('ai_sessions', JSON.stringify(sessions));
    localStorage.setItem('active_session_id', activeId);
  }, [sessions, activeId]);

  const currentSession = sessions[activeId] || { history: [], nodes: [], edges: [] };

  const onNodesChange = useCallback((c) => {
    setSessions(prev => ({
      ...prev,
      [activeId]: { ...prev[activeId], nodes: applyNodeChanges(c, prev[activeId].nodes) }
    }));
  }, [activeId]);

  const onEdgesChange = useCallback((c) => {
    setSessions(prev => ({
      ...prev,
      [activeId]: { ...prev[activeId], edges: applyEdgeChanges(c, prev[activeId].edges) }
    }));
  }, [activeId]);

  const handleSend = async () => {
    if (!inputMsg || loading || !activeId) return;
    setLoading(true);
    const updatedHistory = [...currentSession.history, { role: 'user', content: inputMsg }];
    
    // Update temporar UI
    setSessions(prev => ({
      ...prev,
      [activeId]: { ...prev[activeId], history: updatedHistory }
    }));
    setInputMsg('');

    try {
      const response = await axios.post('http://localhost:8000/api/generate-diagram', { history: updatedHistory });
      if (response.data.nodes) {
        const { nodes: lNodes, edges: lEdges } = getLayoutedElements(response.data.nodes, response.data.edges || []);
        setSessions(prev => ({
          ...prev,
          [activeId]: { 
            ...prev[activeId], 
            nodes: lNodes, 
            edges: lEdges, 
            history: [...updatedHistory, { role: 'assistant', content: "Diagramă actualizată." }],
            name: updatedHistory[0].content.substring(0, 20) + "..." // Redenumim chat-ul după primul mesaj
          }
        }));
      }
    } catch (err) {
      alert("Eroare la procesare. Verifică terminalul Python.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#020617', color: 'white' }}>
      
      {/* SIDEBAR LISTA CHAT-URI */}
      <div style={{ width: '220px', background: '#0f172a', borderRight: '1px solid #1e293b', padding: '15px', display: 'flex', flexDirection: 'column' }}>
        <button onClick={createNewChat} style={{ width: '100%', padding: '10px', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}>+ New Chat</button>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {Object.values(sessions).map(s => (
            <div 
              key={s.id} 
              onClick={() => setActiveId(s.id)}
              style={{ padding: '10px', marginBottom: '5px', borderRadius: '5px', cursor: 'pointer', background: activeId === s.id ? '#1e293b' : 'transparent', fontSize: '13px', border: activeId === s.id ? '1px solid #3b82f6' : '1px solid transparent' }}
            >
              {s.name}
            </div>
          ))}
        </div>
      </div>

      {/* CHAT HISTORY */}
      <div style={{ width: '350px', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {currentSession.history.map((m, i) => (
            <div key={i} style={{ marginBottom: '15px', padding: '10px', borderRadius: '10px', fontSize: '13px', background: m.role === 'user' ? '#3b82f6' : '#1e293b' }}>
              <b style={{ display: 'block', fontSize: '9px', opacity: 0.6 }}>{m.role.toUpperCase()}</b>
              {m.content}
            </div>
          ))}
          {loading && <div style={{ fontSize: '11px', color: '#64748b' }}>AI-ul procesează...</div>}
        </div>
        <div style={{ padding: '15px', borderTop: '1px solid #1e293b' }}>
          <textarea value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} style={{ width: '100%', height: '60px', background: '#1e293b', color: 'white', border: '1px solid #334155', padding: '10px', borderRadius: '8px', resize: 'none' }} />
          <button onClick={handleSend} style={{ width: '100%', marginTop: '5px', padding: '10px', background: '#3b82f6', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Send</button>
        </div>
      </div>

      {/* CANVAS */}
      <div style={{ flex: 1, background: '#f8fafc' }}>
        <ReactFlow nodes={currentSession.nodes} edges={currentSession.edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
          <Background variant="dots" gap={20} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}