/*
Task Manager — Single-file React component (App.jsx)
Drop this file into a Vite/CRA React project at `src/App.jsx`.
Run frontend with `npm run dev` (Vite) or `npm start` (CRA).

Features:
- Add / Edit / Delete tasks
- Toggle status (pending / completed)
- Filter (All / Pending / Completed)
- Simple localStorage persistence (no backend required)
- Plain HTML + CSS + React (no external UI libs)

Notes: This file exports a default React component.
*/

import React, { useEffect, useState } from 'react';

// Inject small stylesheet once
const injectStyles = () => {
  if (document.getElementById('tm-styles')) return;
  const css = `
  .tm-root { max-width:900px; margin:32px auto; font-family:Inter, system-ui, Arial; }
  .tm-card { background:#fff; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.06); padding:16px; margin-bottom:12px; }
  .tm-grid { display:flex; gap:12px; align-items:center; }
  .tm-input, .tm-textarea, .tm-select { width:100%; padding:8px 10px; border-radius:6px; border:1px solid #ddd; }
  .tm-button { padding:8px 12px; border-radius:6px; border:0; cursor:pointer; }
  .tm-button.primary { background:#2563eb; color:#fff; }
  .tm-button.ghost { background:transparent; border:1px solid #ddd; }
  .tm-task { display:flex; justify-content:space-between; gap:12px; align-items:center; }
  .tm-task h4 { margin:0; }
  .tm-actions button { margin-left:8px; }
  .tm-filter { margin-bottom:12px; }
  .tm-empty { text-align:center; color:#666; padding:20px; }
  .tm-status { font-size:12px; padding:4px 8px; border-radius:999px; background:#eef2ff; color:#3730a3; }
  .tm-status.completed { background:#ecfdf5; color:#065f46; }
  `;
  const style = document.createElement('style');
  style.id = 'tm-styles';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
};

const STORAGE_KEY = 'tm_tasks_v1';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    injectStyles();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setTasks(JSON.parse(raw)); } catch (e) { setTasks([]); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const resetForm = () => { setTitle(''); setDescription(''); setEditingId(null); setError(''); };

  const handleAddOrUpdate = (e) => {
    e?.preventDefault();
    setError('');
    if (!title.trim()) { setError('Title cannot be empty'); return; }

    if (editingId) {
      setTasks(prev => prev.map(t => t.id === editingId ? { ...t, title: title.trim(), description: description.trim(), updatedAt: Date.now() } : t));
    } else {
      const newTask = { id: uid(), title: title.trim(), description: description.trim(), status: 'pending', createdAt: Date.now(), updatedAt: Date.now() };
      setTasks(prev => [newTask, ...prev]);
    }
    resetForm();
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this task?')) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    if (editingId === id) resetForm();
  };

  const toggleStatus = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed', updatedAt: Date.now() } : t));
  };

  const filtered = tasks.filter(t => filter === 'all' ? true : t.status === filter);

  return (
    <div className="tm-root">
      <div className="tm-card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <h2 style={{margin:0}}>Task Manager</h2>
          <div style={{fontSize:13, color:'#666'}}>Local only · No backend</div>
        </div>

        <form onSubmit={handleAddOrUpdate} style={{marginBottom:12}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 140px', gap:8, marginBottom:8}}>
            <input className="tm-input" placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
            <select className="tm-select" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div style={{marginBottom:8}}>
            <textarea className="tm-textarea" rows={3} placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          {error && <div style={{color:'#b91c1c', marginBottom:8}}>{error}</div>}

          <div style={{display:'flex', gap:8}}>
            <button className="tm-button primary" type="submit">{editingId ? 'Update Task' : 'Add Task'}</button>
            <button type="button" className="tm-button ghost" onClick={resetForm}>Clear</button>
          </div>
        </form>

        <div style={{marginTop:8}}>
          {filtered.length === 0 ? (
            <div className="tm-empty">No tasks — try adding one!</div>
          ) : (
            filtered.map(task => (
              <div key={task.id} className="tm-card tm-task" style={{marginBottom:10}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h4 style={{margin:0, textDecoration: task.status === 'completed' ? 'line-through' : 'none'}}>{task.title}</h4>
                    <small style={{color:'#666'}}>{new Date(task.createdAt).toLocaleString()}</small>
                  </div>
                  {task.description && <div style={{color:'#444', marginTop:6}}>{task.description}</div>}
                  <div style={{marginTop:8}}>
                    <span className={`tm-status ${task.status === 'completed' ? 'completed' : ''}`}>{task.status}</span>
                  </div>
                </div>

                <div className="tm-actions" style={{display:'flex', alignItems:'center'}}>
                  <button className="tm-button" onClick={() => toggleStatus(task.id)}>{task.status === 'completed' ? 'Mark Pending' : 'Mark Done'}</button>
                  <button className="tm-button" onClick={() => startEdit(task)}>Edit</button>
                  <button className="tm-button" onClick={() => handleDelete(task.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      <div style={{textAlign:'center', color:'#666', fontSize:13}}>Tip: This app saves tasks to your browser localStorage. Use devtools to clear data.</div>
    </div>
  );
}
