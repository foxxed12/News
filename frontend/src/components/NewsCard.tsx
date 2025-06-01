import React from 'react';
import { Link } from 'react-router-dom';

interface NewsCardProps {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ id, title, content, category, createdAt }) => {
  return (
    <Link to={`/news/${id}`} className="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(createdAt).toLocaleString()}</p>
      <p className="mt-2 text-gray-700 dark:text-gray-200 line-clamp-3">{content}</p>
      <span className="inline-block mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase">
        {category}
      </span>
    </Link>
  );
};

export default NewsCard;
