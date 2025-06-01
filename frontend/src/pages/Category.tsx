import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import NewsCard from '../components/NewsCard';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

const Category: React.FC = () => {
  const { category } = useParams();
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    api.get(`/news?category=${category}`).then((res) => setNews(res.data));
  }, [category]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold capitalize">{category}</h1>
      {news.map((item) => (
        <NewsCard key={item.id} {...item} />
      ))}
    </div>
  );
};

export default Category;
