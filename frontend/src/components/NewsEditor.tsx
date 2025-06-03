/* ------------------------------------------------------------------
 *  frontend/src/components/NewsEditor.tsx
 * ------------------------------------------------------------------
 *  • WYSIWYG-редактор на базе React Quill («snow» theme)  
 *  • Поддерживает: заголовки, шрифты, цвет, мульти-форматирование,  
 *    списки, котировки, изображения, видео, код-блоки.  
 *  • Вставка файлов: диалог <input type=file>, отправка на
 *    `POST /uploads`, получение `{url, previewUrl}`,
 *    авто-вставка <img>/<video>.  
 *  • Undo / Redo — через Quill history + hotkeys  
 *  • Высота редактора регулируется пропом `height` (по-умолчанию 400)
 * ------------------------------------------------------------------ */

import { useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import api from '../api/axios';
import 'react-quill/dist/quill.snow.css';

// ---------- Доп. модули Quill ----------
import ImageResize from 'quill-image-resize-module';
import Table from 'quill-better-table';
import 'quill-better-table/dist/quill-better-table.css';

// регистрируем модули, если ещё не
Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/better-table', Table);

type Props = {
  value: string;
  onChange: (html: string) => void;
  height?: number; // px
};

/* ------------------------------------------------------------------ */
/*  Основной компонент                                                */
/* ------------------------------------------------------------------ */
export default function NewsEditor({
  value,
  onChange,
  height = 400,
}: Props) {
  /* -------------------- Toolbar / Modules -------------------- */
  const { modules, formats } = useMemo(() => {
    const toolbar: any[] = [
      [{ header: [1, 2, 3, 4, 5, false] }],
      [{ font: [] }, { size: [] }],
      [{ color: [] }, { background: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image', 'video'],
      ['clean'],
    ];

    /* кастомный обработчик изображений/видео */
    const handler = {
      image: () => fileSelector('image'),
      video: () => fileSelector('video'),
    };

    /** выбор и загрузка файла */
    async function fileSelector(accept: 'image' | 'video') {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute(
        'accept',
        accept === 'image' ? 'image/*' : 'video/*',
      );
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        // 1. отправляем на сервер
        const form = new FormData();
        form.append('file', file);
        const { data } = await api.post('/uploads', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // 2. вставляем
        const quill = quillRef?.current?.getEditor();
        if (!quill) return;
        const range = quill.getSelection(true);

        const embedType = accept === 'image' ? 'image' : 'video';
        quill.insertEmbed(range.index, embedType, data.url, 'user');
        quill.setSelection(range.index + 1);
      };
    }

    return {
      modules: {
        toolbar: { container: toolbar, handlers: handler },
        history: { delay: 600, maxStack: 100, userOnly: true }, // undo/redo
        imageResize: { modules: ['Resize', 'DisplaySize'] },
        table: true,
      },
      formats: [
        'header',
        'font',
        'size',
        'color',
        'background',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'code',
        'list',
        'bullet',
        'link',
        'image',
        'video',
        'table',
      ],
    };
  }, []);

  /* ----------------------- ref to quill ---------------------- */
  const quillRef = useMemo(() => ({ current: null as ReactQuill | null }), []);

  return (
    <div className="relative">
      <ReactQuill
        ref={(node) => (quillRef.current = node)}
        theme="snow"
        value={value}
        onChange={onChange}
        formats={formats}
        modules={modules}
        style={{ height }}
      />
    </div>
  );
}
