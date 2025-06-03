/* ------------------------------------------------------------------
 *  frontend/src/pages/AdminEditor.tsx
 * ------------------------------------------------------------------
 *  • Создание / редактирование новости.                                *
 *  • Поля: title, category, tags, coverImage, SEO-meta, WYSIWYG-body.  *
 *  • Publish-mode: draft / now / schedule.                             *
 *  • Autosave черновика (debounce 1 сек).                              *
 *  • Toast-уведомления, TagInput, NewsEditor.                          *
 * ------------------------------------------------------------------ */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dayjs from 'dayjs';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

import NewsEditor from '../components/NewsEditor';
import TagInput from '../components/TagInput';
import { useDebouncedCallback } from '../hooks/useDebounce';

type FormValues = {
  title: string;
  category: 'economy' | 'society' | 'science' | 'military';
  coverImageUrl?: string;
  description?: string;
  keywords?: string;
  tags: string[];
  content: string;
  publishMode: 'draft' | 'now' | 'schedule';
  publishAt?: string;
};

const schema = yup
  .object({
    title: yup.string().min(3).required(),
    category: yup
      .mixed<'economy' | 'society' | 'science' | 'military'>()
      .oneOf(['economy', 'society', 'science', 'military'])
      .required(),
    content: yup.string().min(10).required(),
    publishMode: yup.mixed<'draft' | 'now' | 'schedule'>().required(),
    publishAt: yup.string().when('publishMode', {
      is: 'schedule',
      then: (schema) => schema.required('Укажите дату публикации'),
      otherwise: (schema) => schema.notRequired(),
    }),
  })
  .required();

export default function AdminEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      category: 'economy',
      tags: [],
      content: '',
      publishMode: 'draft',
    },
  });

  const content = watch('content');
  const title = watch('title');

  /* ---------- загрузка статьи при edit ---------- */
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await api.get(`/news/preview/${id}`);
      setValue('title', data.title);
      setValue('category', data.category);
      setValue('tags', data.tags?.map((t: any) => t.name) || []);
      setValue('content', data.content);
      setValue('coverImageUrl', data.coverImageUrl || '');
      setValue('description', data.description || '');
      setValue('keywords', data.keywords || '');
      if (data.status === 'scheduled') {
        setValue('publishMode', 'schedule');
        setValue('publishAt', dayjs(data.publishAt).format('YYYY-MM-DDTHH:mm'));
      } else if (data.status === 'published') {
        setValue('publishMode', 'now');
      } else {
        setValue('publishMode', 'draft');
      }
    })();
  }, [id, setValue]);

  /* ---------- autosave draft (1 сек) ----------- */
  const [autosave] = useDebouncedCallback(async (html: string) => {
    if (!id) return;
    await api.patch(`/news/${id}/autosave`, { content: html });
    toast.success('Черновик сохранён', { icon: '💾' });
  }, 1000);

  useEffect(() => {
    if (id) autosave(content);
  }, [content, id, autosave]);

  /* ---------- обложка upload ---------- */
  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/uploads', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setValue('coverImageUrl', data.url);
  };

  /* ---------- submit ---------- */
  const onSubmit = async (form: FormValues) => {
    const dto: any = {
      ...form,
      tags: form.tags,
      status:
        form.publishMode === 'draft'
          ? 'draft'
          : form.publishMode === 'now'
          ? 'published'
          : 'scheduled',
      publishAt:
        form.publishMode === 'schedule'
          ? dayjs(form.publishAt).toISOString()
          : undefined,
    };

    try {
      if (id) {
        await api.patch(`/news/${id}`, dto);
        toast.success('Изменения сохранены');
      } else {
        const { data } = await api.post('/news', dto);
        toast.success('Статья создана');
        navigate(`/admin/edit/${data.id}`, { replace: true });
      }
    } catch {
      toast.error('Ошибка сохранения');
    }
  };

  /* ---------- UI ---------- */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Заголовок + категория */}
      <div className="flex flex-col gap-2">
        <input
          {...register('title')}
          placeholder="Заголовок"
          className="w-full rounded border p-2 text-xl font-semibold"
        />
        {errors.title && <p className="text-red-600">{errors.title.message}</p>}

        <select
          {...register('category')}
          className="w-40 rounded border p-1 text-sm"
        >
          <option value="economy">Экономика</option>
          <option value="society">Общество</option>
          <option value="science">Наука и технологии</option>
          <option value="military">Армия</option>
        </select>
      </div>

      {/* Теги */}
      <label className="block text-sm font-medium">Теги</label>
      <TagInput
        value={watch('tags')}
        onChange={(t) => setValue('tags', t, { shouldDirty: true })}
      />

      {/* Обложка */}
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={uploadCover}
          className="block"
        />
        {watch('coverImageUrl') && (
          <img
            src={watch('coverImageUrl')}
            alt="cover"
            className="h-20 rounded object-cover"
          />
        )}
      </div>

      {/* SEO */}
      <details className="rounded border p-3">
        <summary className="cursor-pointer select-none font-medium">
          SEO-мета
        </summary>
        <div className="mt-3 flex flex-col gap-2">
          <input
            {...register('description')}
            placeholder="meta description"
            className="rounded border p-1"
          />
          <input
            {...register('keywords')}
            placeholder="meta keywords (ai,robotics)"
            className="rounded border p-1"
          />
        </div>
      </details>

      {/* Редактор */}
      <NewsEditor
        value={content}
        onChange={(html) => setValue('content', html, { shouldDirty: true })}
        height={500}
      />
      {errors.content && (
        <p className="text-red-600">{errors.content.message}</p>
      )}

      {/* Публикация */}
      <fieldset className="flex flex-col gap-2">
        <legend className="font-medium">Публикация</legend>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="draft"
            {...register('publishMode')}
            className="accent-accent"
          />
          Черновик
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="now"
            {...register('publishMode')}
            className="accent-accent"
          />
          Опубликовать сейчас
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="schedule"
            {...register('publishMode')}
            className="accent-accent"
          />
          Запланировать
        </label>

        {watch('publishMode') === 'schedule' && (
          <input
            type="datetime-local"
            {...register('publishAt')}
            className="w-60 rounded border p-1"
          />
        )}

        {errors.publishAt && (
          <p className="text-red-600">{errors.publishAt.message}</p>
        )}
      </fieldset>

      {/* Кнопки */}
      <div className="flex gap-4">
        <button type="submit" className="btn">
          {id ? 'Сохранить изменения' : 'Создать статью'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate('/admin')}
        >
          Назад
        </button>
      </div>

      {/* Autosave badge */}
      {id && isDirty && (
        <span className="text-xs text-muted">Черновик авто-сохранится…</span>
      )}
    </form>
  );
}
