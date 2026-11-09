import type { APIRoute } from 'astro';
import { cities, cityBySlug, facetsFor } from '../lib/data';

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://washroomsnearme.pages.dev')).href.replace(/\/$/, '');
  const urls = ['/', '/washroom-near-me/', '/about/', '/privacy/', '/methodology/'];
  for (const c of cities) {
    urls.push(`/${c.slug}/`);
    const full = cityBySlug(c.slug);
    if (full) for (const f of facetsFor(full.facilities)) urls.push(`/${c.slug}/${f.key}/`);
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${base}${u}</loc><changefreq>weekly</changefreq><priority>${u === '/' ? '1.0' : '0.7'}</priority></url>`).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
