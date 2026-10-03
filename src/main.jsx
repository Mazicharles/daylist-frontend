import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

async function api(path = '', method = 'GET', body) {
  const response = await fetch(`${API_URL}/api/tasks${path}`, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(typeof data.detail === 'string' ? data.detail : 'Something went wrong. Please try again.'); }
  return response.status === 204 ? null : response.json();
}

function App() {
  const [tasks, setTasks] = useState([]), [title, setTitle] = useState(''), [filter, setFilter] = useState('All');
  const [editing, setEditing] = useState(null), [draft, setDraft] = useState(''), [error, setError] = useState('');
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [dragging, setDragging] = useState(null);
  async function refresh() { setTasks(await api()); }
  useEffect(() => { refresh().catch(() => setError('Could not connect to the server. Please reload to try again.')).finally(() => setLoading(false)); }, []);
  async function act(action) { setBusy(true); setError(''); try { await action(); } catch (e) { setError(e.message); try { await refresh(); } catch {} } finally { setBusy(false); } }
  function add(e) { e.preventDefault(); if (!title.trim() || busy) return; act(async () => { const task = await api('', 'POST', { title: title.trim() }); setTasks(old => [...old, task]); setTitle(''); }); }
  function update(task, changes) { return act(async () => { const updated = await api(`/${task.id}`, 'PATCH', changes); setTasks(old => old.map(t => t.id === task.id ? updated : t)); }); }
  function save(e, task) { e.preventDefault(); if (!draft.trim()) return; act(async () => { const updated = await api(`/${task.id}`, 'PATCH', { title: draft.trim() }); setTasks(old => old.map(t => t.id === task.id ? updated : t)); setEditing(null); }); }
  function move(id, target) { if (busy || id === target) return; const next = [...tasks]; const from = next.findIndex(t => t.id === id), to = next.findIndex(t => t.id === target); if (from < 0 || to < 0) return; next.splice(to, 0, next.splice(from, 1)[0]); act(async () => { await api('/reorder', 'PUT', { ids: next.map(t => t.id) }); setTasks(next); }); }
  const completed = tasks.filter(t => t.completed).length;
  const visible = tasks.filter(t => filter === 'All' || (filter === 'Completed' ? t.completed : !t.completed));
  return <div className="shell">
    <header><a className="brand" href="/"> <span className="logo">✓</span> daylist<span className="brand-dot">.</span></a><span className="header-note">A little more done. A little less on your mind.</span></header>
    <main><div className="eyebrow">YOUR EVERYDAY, SIMPLIFIED</div><div className="heading"><div><h1>Make room for<br/><span>what matters.</span></h1><p>Big plans start with small steps. Let’s take one.</p></div><div className="date"><span>✦</span><div>{new Date().toLocaleDateString(undefined, { weekday: 'long' })}<small>{new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</small></div></div></div>
    <section className="task-card" aria-label="Your tasks"><div className="card-top"><div><h2>My tasks <span>{tasks.length}</span></h2><p>Your space to turn to-dos into ta-das.</p></div><span className="small-spark">✧</span></div>
      <form className="add-form" onSubmit={add}><span aria-hidden="true">＋</span><input aria-label="New task" placeholder="What would you like to get done?" value={title} maxLength={500} onChange={e => setTitle(e.target.value)} disabled={loading || busy}/><button disabled={loading || busy || !title.trim()}>Add task <span>↗</span></button></form>
      <div className="toolbar"><div className="tabs" aria-label="Filter tasks">{['All', 'Active', 'Completed'].map(f => <button key={f} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>{f} <span>{f === 'All' ? tasks.length : f === 'Active' ? tasks.length - completed : completed}</span></button>)}</div><span className="reorder-note">⠿ Drag to reorder</span></div>
      {error && <div role="alert" className="error">{error}</div>}
      <div className="task-list">{loading ? <div className="empty">Loading your tasks…</div> : visible.length === 0 ? <div className="empty"><div className="empty-icon">{filter === 'Completed' ? '✓' : '☀'}</div><h3>{filter === 'Completed' ? 'Good things take a first step.' : filter === 'Active' && tasks.length ? 'All caught up!' : 'A fresh start, just for you.'}</h3><p>{filter === 'Completed' ? 'Your completed tasks will appear here.' : filter === 'Active' && tasks.length ? 'Take a breath. You’ve earned it.' : 'Add a task above and make a little progress today.'}</p></div> : visible.map(task => { const index = tasks.findIndex(t => t.id === task.id); return <div key={task.id} className={`task ${task.completed ? 'done' : ''} ${dragging === task.id ? 'dragging' : ''}`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); move(dragging, task.id); setDragging(null); }}>
        <span className="drag-handle" draggable={!busy && editing === null} onDragStart={e => { setDragging(task.id); e.dataTransfer.setData('text/plain', String(task.id)); e.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => setDragging(null)} title="Drag to reorder">⠿</span>
        <button className="check" aria-label={`Mark ${task.title} ${task.completed ? 'active' : 'complete'}`} disabled={busy} onClick={() => update(task, { completed: !task.completed })}>{task.completed ? '✓' : ''}</button>
        {editing === task.id ? <form className="edit-form" onSubmit={e => save(e, task)}><input autoFocus aria-label="Edit task title" value={draft} maxLength={500} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setEditing(null); }}/><button disabled={busy || !draft.trim()}>Save</button><button type="button" onClick={() => setEditing(null)}>Cancel</button></form> : <><span className="task-title">{task.title}</span><div className="task-actions"><button disabled={busy || index === 0} onClick={() => move(task.id, tasks[index - 1].id)} aria-label={`Move ${task.title} up`}>↑</button><button disabled={busy || index === tasks.length - 1} onClick={() => move(task.id, tasks[index + 1].id)} aria-label={`Move ${task.title} down`}>↓</button><button disabled={busy} onClick={() => { setEditing(task.id); setDraft(task.title); }} aria-label={`Edit ${task.title}`}>✎</button><button className="delete" disabled={busy} onClick={() => act(async () => { await api(`/${task.id}`, 'DELETE'); setTasks(old => old.filter(t => t.id !== task.id)); })} aria-label={`Delete ${task.title}`}>×</button></div></>}
      </div>; })}</div>
      <div className="card-bottom"><span><i/>{tasks.length - completed} {tasks.length - completed === 1 ? 'task' : 'tasks'} left to do</span><span>{completed > 0 ? `${completed} completed. Nice work!` : 'One step at a time.'}</span></div>
    </section><div className="footnote"><span>✦</span> Progress doesn’t have to be perfect. It just has to be yours.</div></main><footer>Made for a clearer day.<span>Less clutter. More focus.</span></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
