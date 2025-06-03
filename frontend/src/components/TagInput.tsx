/* ------------------------------------------------------------------
 *  frontend/src/components/TagInput.tsx
 * ------------------------------------------------------------------
 *  • Компонент «chips-input» для тегов.                        *
 *  • Добавление по Enter / Comma / Blur.                       *
 *  • Удаление кликом по ❌ или клавишей Backspace на пустом     *
 *    поле ввода.                                               *
 *  • Ограничение по количеству (prop maxTags).                 *
 *  • Валидация: 1–32 символа, буквы/цифры/«-», регистр  — любой *
 *  • Tailwind-стили для чипсов.                                *
 * ------------------------------------------------------------------ */

import { useState, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import classNames from 'classnames';

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
};

/** Регэкс для «допустимого» тега */
const VALID_TAG = /^[\p{L}\d_-]{1,32}$/u;

export default function TagInput({
  value,
  onChange,
  placeholder = 'Введите тег и нажмите Enter',
  maxTags = 10,
}: Props) {
  const [input, setInput] = useState('');

  /* ------------------------------------------------------------
   *  helpers
   * ---------------------------------------------------------- */
  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (!VALID_TAG.test(tag)) return; // невалидный
    if (value.includes(tag)) return;  // уже есть
    if (value.length >= maxTags) return;

    onChange([...value, tag]);
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  /* ------------------------------------------------------------
   *  handlers
   * ---------------------------------------------------------- */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Enter или , завершают ввод
    if (['Enter', ','].includes(e.key)) {
      e.preventDefault();
      addTag(input);
    }
    // Backspace на пустом поле — удалить последний тег
    if (e.key === 'Backspace' && !input) {
      removeTag(value[value.length - 1]);
    }
  };

  const handleBlur = () => addTag(input);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setInput(e.target.value);

  /* ------------------------------------------------------------
   *  рендер
   * ---------------------------------------------------------- */
  return (
    <div
      className={classNames(
        'flex flex-wrap items-center gap-2 rounded border border-gray-300 p-2',
        { 'opacity-60 pointer-events-none': value.length >= maxTags },
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded bg-accent px-2 py-0.5 text-xs font-medium text-white"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-1 text-white/80 hover:text-white"
          >
            &times;
          </button>
        </span>
      ))}

      {/* Input скрывается, когда достигнут лимит тегов */}
      {value.length < maxTags && (
        <input
          type="text"
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 min-w-[6rem] border-none bg-transparent p-0 text-sm focus:ring-0"
        />
      )}
    </div>
  );
}
