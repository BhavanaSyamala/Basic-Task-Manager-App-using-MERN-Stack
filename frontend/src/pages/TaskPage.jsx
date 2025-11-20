import React, { useEffect, useState } from 'react';
import * as api from '../services/api';

export default function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  const load = async () => {
    setTasks(await api.getTasks());
  };

  useEffect(() => { load(); }, []);

  const addTask = async () => {
    await api.createTask({ title });
    setTitle('');
    load();
  };

  return (
    <div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New Task" />
      <button onClick={addTask}>Add</button>

      <ul>
        {tasks.map(t => (
          <li key={t._id}>{t.title}</li>
        ))}
      </ul>
    </div>
  );
}
