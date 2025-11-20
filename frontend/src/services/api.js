const BASE = 'http://localhost:5000/api';

export async function fetchJSON(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}

export const getTasks = () => fetchJSON('/tasks');
export const createTask = (body) => fetchJSON('/tasks', { method: 'POST', body: JSON.stringify(body) });
export const deleteTask = (id) => fetchJSON(`/tasks/${id}`, { method: 'DELETE' });
export const updateTask = (id, body) => fetchJSON(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) });
