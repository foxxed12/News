/* ------------------------------------------------------------------
 *  frontend/src/index.tsx
 * ------------------------------------------------------------------
 *  Точка входа React-приложения.                                      *
 *                                                                    *
 *  • Подключает глобальные стили (Tailwind + custom).                *
 *  • Оборачивает приложение в:                                       *
 *      – <HelmetProvider>   — SEO-теги (react-helmet-async)          *
 *      – <ToastProvider>    — глобальные toast-уведомления           *
 *      – <RouterProvider>   — маршруты (createBrowserRouter)         *
 *  • Использует React 18 root API.                                   *
 * ------------------------------------------------------------------ */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import './index.css';               // Tailwind базовые стили + overrides
import { router } from './router';  // создан в src/router/index.tsx
import ToastProvider from './components/ToastProvider';

/* ------------------------------------------------------------------ */
/*  Render                                                            */
/* ------------------------------------------------------------------ */
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
