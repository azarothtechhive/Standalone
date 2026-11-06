import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useCMS } from '../../context/CMSContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  jsonLd?: object;
  robots?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath = '/',
  jsonLd,
  robots,
}) => {
  const { settings } = useCMS();
  const companyName = settings?.companyName || 'Azaroth Tech-Hive';

  let resolvedTitle = title || `${companyName} | Enterprise Software Engineering`;
  if (title && companyName !== 'Azaroth Tech-Hive') {
    resolvedTitle = title.replace(/Azaroth Tech-Hive/g, companyName);
  }

  const resolvedDescription =
    description ||
    settings?.metaDescription ||
    'Azaroth Tech-Hive engineers, evolves, and sustains intelligent software solutions, delivering end-to-end engineering excellence that empowers businesses to innovate, adapt, and scale with confidence.';

  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://azaroth-techhive.com';

  const canonicalUrl = `${origin}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
  const logoUrl = settings?.logoUrl || `${origin}/Logo.png`;

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      {robots && <meta name="robots" content={robots} />}
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={logoUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={logoUrl} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
