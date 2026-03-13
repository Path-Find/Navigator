import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: string;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
}) => {
    const siteTitle = 'Navigator';
    const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | Smart Career & Resume Tools`;
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const defaultDescription = 'Elevate your career with AI-powered resume tailoring, job analysis, and professional growth tools. Built for the modern job seeker.';
    const defaultOgImage = '/images/og-image.png';

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            {canonical && <link rel="canonical" href={canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={ogTitle || fullTitle} />
            <meta property="og:description" content={ogDescription || description || defaultDescription} />
            <meta property="og:image" content={ogImage || defaultOgImage} />
            <meta property="og:url" content={canonical ? (canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`) : siteUrl} />

            {/* Twitter */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={ogTitle || fullTitle} />
            <meta name="twitter:description" content={ogDescription || description || defaultDescription} />
            <meta name="twitter:image" content={ogImage || defaultOgImage} />
        </Helmet>
    );
};
