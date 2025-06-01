import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

const NewsDetail: React.FC = () => {
  const { id } = useParams();
  const [news, setNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    api.get(`/news/${id}`).then((res) => setNews(res.data));
  }, [id]);

  if (!news) return <p>Загрузка...</p>;

  return (
    <div className="prose dark:prose-invert max-w-3xl mx-auto">
      <h1>{news.title}</h1>
      <p className="text-sm text-gray-500">{new Date(news.createdAt).toLocaleString()}</p>
      <p>{news.content}</p>
    </div>
  );
};

export default NewsDetail;
