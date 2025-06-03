/* ------------------------------------------------------------------
 *  frontend/src/components/Seo.tsx
 * ------------------------------------------------------------------
 *  Универсальный компонент для установки <title>, <meta>,  *
 *  Open Graph-и Twitter-карт.                               *
 *                                                           *
 *  Пример:                                                  *
 *    <Seo                                                   *
 *       title="Заголовок — NewsPortal"                      *
 *       description="Короткое описание заметки"            *
 *       image="/uploads/cover.jpg"                          *
 *       keywords={['ai', 'robotics']}                       *
 *    />                                                     *
 * ------------------------------------------------------------------ */

import { Helmet } from 'react-helmet-async';

type Props = {
  /** <title>. Если не передать — возьмётся из env VITE_DEFAULT_TITLE */
  title?: string;
  /** <meta name="description"> */
  description?: string | null;
  /** Array → "tag1, tag2" */
  keywords?: string[] | string | null;
  /** URL OpenGraph-изображения */
  image?: string | null;
  /** Канонический URL (если нужен) */
  canonical?: string | null;
};

export default function Seo({
  title,
  description,
  keywords,
  image,
  canonical,
}: Props) {
  const defTitle =
    import.meta.env.VITE_DEFAULT_TITLE || 'NewsPortal — свежие новости';
  const fullTitle = title ? title : defTitle;

  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:3000';
  const ogImage =
    image && !image.startsWith('http') ? `${siteUrl}${image}` : image;

  return (
    <Helmet>
      <title>{fullTitle}</title>

      {/* canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Meta */}
      {description && (
        <meta name="description" content={description.slice(0, 300)} />
      )}
      {keywords && (
        <meta
          name="keywords"
          content={
            Array.isArray(keywords) ? keywords.join(', ') : keywords || undefined
          }
        />
      )}

      {/* Open Graph */}
      <meta property="og:site_name" content="NewsPortal" />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="article" />
      {canonical && <meta property="og:url" content={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
