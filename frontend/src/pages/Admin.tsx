import React, { useState, useEffect } from 'react';
import api from '../api/axios';

interface NewsForm {
  title: string;
  content: string;
  category: string;
}

const Admin: React.FC = () => {
  const [form, setForm] = useState<NewsForm>({
    title: '',
    content: '',
    category: 'economy',
  });

  const [status, setStatus] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/news', form);
      setStatus('Новость добавлена');
      setForm({ title: '', content: '', category: 'economy' });
    } catch {
      setStatus('Ошибка при добавлении');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 mt-10">
      <h1 className="text-2xl font-bold">Панель администратора</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="text"
          placeholder="Заголовок"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="Содержание"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full p-2 border rounded"
          rows={5}
          required
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="economy">Экономика</option>
          <option value="society">Общество</option>
          <option value="science">Наука</option>
          <option value="military">Армия</option>
        </select>
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Добавить новость
        </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default Admin;
