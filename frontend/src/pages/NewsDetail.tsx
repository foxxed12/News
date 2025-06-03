/* ------------------------------------------------------------------
 *  frontend/src/pages/NewsDetail.tsx
 * ------------------------------------------------------------------
 *  • Публичная страница статьи (доступна только для status = published). *
 *  • Получает данные через GET /news/:id                                 *
 *  • Устанавливает SEO-теги (title, description, OG).                    *
 *  • Показывает обложку, HTML-контент, теги, дату.                       *
 * ------------------------------------------------------------------ */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../api/axios';
import Seo from '../components/Seo';
import { toast } from 'react-hot-toast';

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface NewsPublic {
  id: number;
  slug?: string;
  title: string;
  content: string;
  description?: string;
  keywords?: string;
  category: string;
  coverImageUrl?: string;
  tags: Tag[];
  createdAt: string;
  publishAt?: string;
}

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsPublic | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- загрузка ---------------- */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await api.get(`/news/${id}`);
        setNews(data);
      } catch {
        toast.error('Статья не найдена');
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  if (loading) return <p className="p-8 text-center">Загрузка…</p>;
  if (!news) return null;

  const {
    title,
    description,
    keywords,
    coverImageUrl,
    content,
    createdAt,
    tags,
  } = news;

  /* ---------------- render ---------------- */
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      {/* SEO-meta */}
      <Seo
        title={`${title} — NewsPortal`}
        description={description || undefined}
        keywords={keywords || undefined}
        image={coverImageUrl || undefined}
        canonical={`${window.location.origin}/news/${id}`}
      />

      {/* Категория + дата */}
      <div className="text-sm text-muted">
        <Link to={`/category/${news.category}`} className="hover:underline">
          {news.category}
        </Link>{' '}
        · {dayjs(createdAt).format('DD.MM.YYYY')}
      </div>

      <h1 className="text-3xl font-serif">{title}</h1>

      {/* Обложка */}
      {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt={title}
          className="w-full rounded object-cover"
        />
      )}

      {/* HTML-контент */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Теги */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4">
          {tags.map((t) => (
            <Link
              key={t.id}
              to={`/tag/${t.slug}`}
              className="rounded bg-accent px-2 py-0.5 text-xs text-white hover:bg-accent/80"
            >
              #{t.name}
            </Link>
          ))}
        </div>
      )}

      {/* Назад */}
      <Link to="/" className="mt-6 inline-block text-blue-600 hover:underline">
        ← На главную
      </Link>
    </article>
  );
}
