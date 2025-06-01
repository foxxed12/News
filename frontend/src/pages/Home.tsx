import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import NewsCard from '../components/NewsCard';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

const Home: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    api.get('/news').then((res) => setNews(res.data));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Все новости</h1>
      {news.map((item) => (
        <NewsCard key={item.id} {...item} />
      ))}
    </div>
  );
};

export default Home;
