# SEO Setup Guide for Next.js Ecommerce Website

## Overview
Your tech stack (Next.js + Node.js + Supabase) is ideal for SEO. This guide covers on-page, technical, and content SEO strategies.

---

## 1. NEXT.JS FUNDAMENTALS

### 1.1 Install SEO Dependencies
```bash
npm install next-seo next-sitemap
npm install -D @next/bundle-analyzer
```

### 1.2 Configure next-seo

Create `next-seo.config.js`:
```javascript
export default {
  titleTemplate: '%s | Your Store',
  defaultTitle: 'Your Ecommerce Store - Best Products',
  description: 'Shop quality products at best prices',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    siteName: 'Your Store',
    images: [
      {
        url: 'https://yourdomain.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Your Store',
      },
    ],
  },
  twitter: {
    handle: '@yourhandle',
    site: '@yourhandle',
    cardType: 'summary_large_image',
  },
};
```

### 1.3 Setup in pages/_app.jsx or app layout (App Router)

For **App Router** (`app/layout.jsx`):
```javascript
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <DefaultSeo {...SEO} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 2. PRODUCT PAGES & DYNAMIC SEO

### 2.1 Product Page with Schema (App Router)

Create `app/products/[slug]/page.jsx`:

```javascript
import { NextSeo, ProductJsonLd } from 'next-seo';
import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }) {
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!product) return {};

  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.description.substring(0, 160),
    openGraph: {
      title: product.meta_title || product.name,
      description: product.meta_description || product.description.substring(0, 160),
      type: 'og:product',
      url: `https://yourdomain.com/products/${product.slug}`,
      images: [
        {
          url: product.image_url,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    alternates: {
      canonical: `https://yourdomain.com/products/${product.slug}`,
    },
  };
}

async function getProduct(slug) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  return data;
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);

  if (!product) {
    return <div>Product not found</div>;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image_url,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `https://yourdomain.com/products/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price,
      availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.review_count,
    } : undefined,
  };

  return (
    <>
      <NextSeo
        title={product.meta_title || product.name}
        description={product.meta_description}
        canonical={`https://yourdomain.com/products/${product.slug}`}
        openGraph={{
          type: 'og:product',
          url: `https://yourdomain.com/products/${product.slug}`,
          title: product.name,
          description: product.meta_description,
          images: [{ url: product.image_url }],
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full"
          />
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl text-green-600 mb-4">${product.price}</p>
            <p className="text-gray-600 mb-6">{product.description}</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export async function generateStaticParams() {
  const { data: products } = await supabase
    .from('products')
    .select('slug');

  return products.map((product) => ({
    slug: product.slug,
  }));
}
```

---

## 3. SITEMAP & ROBOTS.TXT

### 3.1 Generate Sitemap with next-sitemap

Create `next-sitemap.config.js`:

```javascript
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://yourdomain.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/cart', '/checkout'],
      },
    ],
    additionalSitemaps: ['https://yourdomain.com/sitemap-products.xml'],
  },
  exclude: ['/admin', '/cart', '/checkout', '404', '500'],
  changefreq: 'daily',
  priority: 0.7,
};
```

### 3.2 Add to package.json

```json
{
  "scripts": {
    "postbuild": "next-sitemap"
  }
}
```

### 3.3 Dynamic Sitemap (Manual)

Create `app/sitemap.js`:

```javascript
import { supabase } from '@/lib/supabase';

export default async function sitemap() {
  const baseUrl = 'https://yourdomain.com';

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false });

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productUrls,
  ];
}
```

---

## 4. STRUCTURED DATA / SCHEMA MARKUP

### 4.1 Organization Schema

Create `components/OrgSchema.jsx`:

```javascript
export function OrgSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Your Store',
    url: 'https://yourdomain.com',
    logo: 'https://yourdomain.com/logo.png',
    description: 'Your store description',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX',
      contactType: 'Customer Support',
    },
    sameAs: [
      'https://www.facebook.com/yourstore',
      'https://twitter.com/yourstore',
      'https://instagram.com/yourstore',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### 4.2 Breadcrumb Schema

```javascript
export function BreadcrumbSchema({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

---

## 5. PERFORMANCE OPTIMIZATION (Core Web Vitals)

### 5.1 Image Optimization

```javascript
import Image from 'next/image';

export function ProductImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={500}
      height={500}
      priority={true} // For above-fold images
      sizes="(max-width: 768px) 100vw, 500px"
      className="w-full"
    />
  );
}
```

### 5.2 next.config.js Optimization

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['yourdomain.com', 'supabase-bucket.supabaseusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  productionBrowserSourceMaps: false,
};

export default nextConfig;
```

### 5.3 Font Optimization

In `app/layout.jsx`:

```javascript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent layout shift
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 6. NODE.JS BACKEND SEO CONSIDERATIONS

### 6.1 API Response Headers

```javascript
// middleware.js (Express/Node)
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});
```

### 6.2 Robots.txt Endpoint (if needed)

```javascript
// api/robots.js or Node.js route
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /cart
Disallow: /checkout
Sitemap: https://yourdomain.com/sitemap.xml`);
});
```

### 6.3 Structured Data API Endpoints

```javascript
// Node.js: Return product data optimized for SEO
app.get('/api/products/:slug', async (req, res) => {
  const product = await supabase
    .from('products')
    .select('*')
    .eq('slug', req.params.slug)
    .single();

  // Include meta fields for SEO
  res.json({
    ...product,
    canonical_url: `https://yourdomain.com/products/${product.slug}`,
    structured_data: {
      '@type': 'Product',
      // ... schema markup
    }
  });
});
```

---

## 7. SUPABASE DATABASE SCHEMA

Ensure your products table has these fields:

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  description TEXT,
  meta_title VARCHAR,
  meta_description VARCHAR(160),
  price DECIMAL,
  image_url VARCHAR,
  brand VARCHAR,
  stock INTEGER,
  rating DECIMAL,
  review_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  category_id BIGINT REFERENCES categories(id)
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
```

---

## 8. ON-PAGE SEO BEST PRACTICES

### 8.1 Meta Tags Guidelines

- **Title**: 50-60 characters, include primary keyword
- **Meta Description**: 150-160 characters, compelling CTA
- **H1**: One per page, descriptive
- **Keywords**: Use naturally in first 100 words

### 8.2 URL Structure

✅ **Good**: `/products/nike-running-shoes-blue`
❌ **Bad**: `/products/123` or `/products/shoe-1-2-3`

### 8.3 Internal Linking

```javascript
// components/RelatedProducts.jsx
export function RelatedProducts({ products }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <a
          key={product.id}
          href={`/products/${product.slug}`}
          title={product.meta_title || product.name}
          className="text-blue-600 hover:underline"
        >
          {product.name}
        </a>
      ))}
    </div>
  );
}
```

---

## 9. MONITORING & TOOLS

### 9.1 Setup Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (domain)
3. Verify with DNS record or HTML file
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`
5. Monitor:
   - Click-through rate (CTR)
   - Impressions
   - Coverage (errors & warnings)
   - Core Web Vitals

### 9.2 Google Analytics 4

```javascript
// app/layout.jsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_ID');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 9.3 Tools to Monitor

- **PageSpeed Insights**: https://pagespeed.web.dev
- **Lighthouse**: Built into Chrome DevTools
- **SEMrush**: Comprehensive SEO audit
- **Ahrefs**: Backlink analysis
- **Screaming Frog**: Crawl your site for issues

---

## 10. MOBILE & RESPONSIVE SEO

### 10.1 Viewport Meta Tag (Usually auto in Next.js)

```javascript
// app/layout.jsx metadata
export const metadata = {
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};
```

### 10.2 Mobile-First Tailwind

```javascript
// Always use Tailwind's mobile-first approach
<div className="text-sm md:text-base lg:text-lg">
  Responsive text size
</div>
```

---

## 11. CANONICAL TAGS & DUPLICATE CONTENT

### 11.1 Set Canonical in Metadata

```javascript
export const metadata = {
  alternates: {
    canonical: 'https://yourdomain.com/products/product-name',
  },
};
```

### 11.2 Handle Query Parameters

For filters/pagination, set canonical to base URL:
```javascript
// /products?category=shoes&sort=price should have:
<link rel="canonical" href="https://yourdomain.com/products" />
```

---

## 12. DEPLOYMENT CHECKLIST

- [ ] Remove `noindex` tags
- [ ] Enable compression in next.config.js
- [ ] Setup HTTPS/SSL
- [ ] Configure CDN for static assets
- [ ] Add security headers (X-Frame-Options, etc.)
- [ ] Setup sitemap generation
- [ ] Submit sitemap to Google Search Console
- [ ] Verify mobile-friendliness
- [ ] Test Core Web Vitals
- [ ] Setup 404 redirect to homepage
- [ ] Configure proper 301 redirects

---

## 13. QUICK START COMMAND

```bash
npm install next-seo next-sitemap
npm install -D @next/bundle-analyzer

# Update package.json with postbuild script
npm run build
npm run start
```

Then navigate to:
- Sitemap: `https://yourdomain.com/sitemap.xml`
- Robots.txt: `https://yourdomain.com/robots.txt`
