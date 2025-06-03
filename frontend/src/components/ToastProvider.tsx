/* ------------------------------------------------------------------
 *  frontend/src/components/ToastProvider.tsx
 * ------------------------------------------------------------------
 *  • Обёртка, внедряющая react-hot-toast во всё приложение.  *
 *  • Настраивает позицию, тему и базовые стили уведомлений.  *
 *  • Используйте:                                           *
 *        toast.success('Сохранено');                        *
 *        toast.error('Ошибка');                             *
 *        toast('Черновик сохранён', { icon: '💾' });        *
 * ------------------------------------------------------------------ */

import { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';

/** Цвета соответствуют Tailwind-палитре, указанной в tailwind.config.js */
const toasterOptions = {
  position: 'top-right' as const,
  reverseOrder: false,
  toastOptions: {
    style: {
      fontFamily: 'PT Sans, sans-serif',
      fontSize: '0.875rem',
      background: '#141308', // primary
      color: '#fff',
    },
    success: {
      style: { background: '#1e7b34' /* зеленоватый */ },
      iconTheme: { primary: '#fff', secondary: '#1e7b34' },
    },
    error: {
      style: { background: '#b91c1c' /* красный */ },
      iconTheme: { primary: '#fff', secondary: '#b91c1c' },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Provider                                                          */
/* ------------------------------------------------------------------ */
export default function ToastProvider({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      {/* Toaster рендерится один раз в корне */}
      <Toaster {...toasterOptions} />
    </>
  );
}
