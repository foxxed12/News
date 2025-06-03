/* ------------------------------------------------------------------
 *  frontend/src/styles/themes.ts
 * ------------------------------------------------------------------
 *  • Набор цветовых тем (по категориям сайта).                *
 *  • Каждый theme → CSS-переменные, применяемые к :root.       *
 *  • Функция applyTheme() — переключает палитру «на лету».     *
 *  • ThemeWrapper (компонент) читает URL/props и вызывает её.  *
 * ------------------------------------------------------------------ */

export type ThemeKey = 'default' | 'economy' | 'society' | 'science' | 'military';

interface ThemeVars {
  /** CSS custom property → значение */
  [cssVar: `--${string}`]: string;
}

/* ------------------------------------------------------------------ */
/*  Темы (цвета подобраны в духе Meduza, но с разной акцентной гаммой)*/
/* ------------------------------------------------------------------ */
export const themes: Record<ThemeKey, ThemeVars> = {
  /** Базовая «тёмная» тема (используется на главной) */
  default: {
    '--color-bg': '#141308',
    '--color-text': '#f5f5f4',
    '--color-accent': '#ad8059',
    '--color-muted': '#8d8c8a',
    '--color-link': '#3b82f6',
  },

  /** Экономика — глубокий зелёный + мятный акцент */
  economy: {
    '--color-bg': '#f3faf7',
    '--color-text': '#0a4d3c',
    '--color-accent': '#1abc9c',
    '--color-muted': '#6b9080',
    '--color-link': '#0f766e',
  },

  /** Общество — бежево-оранжевый */
  society: {
    '--color-bg': '#fffaf4',
    '--color-text': '#5a2e0c',
    '--color-accent': '#ff9f43',
    '--color-muted': '#9c6644',
    '--color-link': '#d97706',
  },

  /** Наука — тёмно-синий фон + голубой акцент */
  science: {
    '--color-bg': '#f2f8ff',
    '--color-text': '#0d3b66',
    '--color-accent': '#5dade2',
    '--color-muted': '#6c8ebf',
    '--color-link': '#2563eb',
  },

  /** Армия — оливковый / хаки */
  military: {
    '--color-bg': '#f6f8f3',
    '--color-text': '#3d4f2f',
    '--color-accent': '#7d8f5d',
    '--color-muted': '#6e7358',
    '--color-link': '#4d7c0f',
  },
};

/* ------------------------------------------------------------------ */
/*  Применить тему к :root                                            */
/* ------------------------------------------------------------------ */
export function applyTheme(key: ThemeKey = 'default') {
  const vars = themes[key] ?? themes.default;
  const root = document.documentElement;

  Object.entries(vars).forEach(([cssVar, value]) => {
    root.style.setProperty(cssVar, value);
  });
}

/* ------------------------------------------------------------------
 *  Tailwind интеграция
 * ------------------------------------------------------------------
 *  В tailwind.config.js можно добавить кастомные colors, читающие
 *  CSS-переменные, чтобы классы bg-[...] / text-[...] уважали тему:
 *
 *  theme: {
 *    extend: {
 *      colors: {
 *        bg: 'var(--color-bg)',
 *        text: 'var(--color-text)',
 *        accent: 'var(--color-accent)',
 *        muted: 'var(--color-muted)',
 *        link: 'var(--color-link)',
 *      },
 *    },
 *  }
 * ------------------------------------------------------------------ */
