/* ------------------------------------------------------------------
 *  frontend/src/pages/Preview.tsx
 * ------------------------------------------------------------------
 *  • Read-only «превью» статьи, доступное только автору/админу.      *
 *  • Берёт данные с GET /news/preview/:id (не /news/:id !).         *
 *  • Показывает все поля: cover, title, meta, теги, HTML-контент.   *
 *  • Добавляет <Seo> для коректного заголовка и OG-тегов            *
 *    (но НЕ индексируется, потому что статус ещё не published).     *
 * ------------------------------------------------------------------ */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import dayjs from 'dayjs';
import Seo from '../components/Seo';
import { toast } from 'react-hot-toast';

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface PreviewNews {
  id: number;
  title: string;
  content: string;
  category: string;
  status: string;
  coverImageUrl?: string;
  description?: string;
  keywords?: string;
  tags: Tag[];
  publishAt?: string;
  createdAt: string;
}

export default function Preview() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<PreviewNews | null>(null);
  const [loading, setLoading] = useState(true);

  /* -------- загрузка -------- */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await api.get(`/news/preview/${id}`);
        setNews(data);
      } catch {
        toast.error('Не удалось загрузить статью');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="p-8 text-center">Загрузка…</p>;
  if (!news) return null;

  const {
    title,
    coverImageUrl,
    content,
    description,
    keywords,
    tags,
    status,
    publishAt,
    createdAt,
  } = news;

  /* -------- meta noindex для черновиков -------- */
  const metaRobots =
    status !== 'published' ? <meta name="robots" content="noindex" /> : null;

  /* -------- jsx -------- */
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* SEO */}
      <Seo
        title={`${title} — Preview`}
        description={description || undefined}
        keywords={keywords || undefined}
        image={coverImageUrl || undefined}
      />

      {metaRobots}

      {/* статус бейдж */}
      <span
        className="rounded bg-yellow-500 px-2 py-0.5 text-xs text-white"
        title="Эта статья ещё не опубликована"
      >
        PREVIEW ({status})
      </span>

      <h1 className="text-3xl font-serif">{title}</h1>

      <div className="text-sm text-muted">
        Создано: {dayjs(createdAt).format('DD.MM.YYYY HH:mm')}
        {status === 'scheduled' && publishAt && (
          <> · Запланировано: {dayjs(publishAt).format('DD.MM.YYYY HH:mm')}</>
        )}
      </div>

      {/* обложка */}
      {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt="cover"
          className="w-full rounded object-cover"
        />
      )}

      {/* контент из Quill (HTML) */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* теги */}
      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4">
          {tags.map((t) => (
            <span
              key={t.id}
              className="rounded bg-accent px-2 py-0.5 text-xs text-white"
            >
              #{t.name}
            </span>
          ))}
        </div>
      )}

      {/* link back */}
      <Link
        to={`/admin/edit/${id}`}
        className="mt-6 inline-block text-blue-600 hover:underline"
      >
        ← Вернуться к редактированию
      </Link>
    </article>
  );
}
