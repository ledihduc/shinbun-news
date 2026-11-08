# shinbun.news　新聞・NEWS

Static-first Japanese technology news website. It generates crawlable HTML for the homepage, category pages, article pages, and search page.

## Run locally

```bash
npm run build
npm run dev
```

Open `http://localhost:4173`.

## Update articles

Edit `src/articles.js`, then run `npm run build`. The same article data powers every page, search, sitemap, and Atom feed.

To build from a backend or headless CMS instead, set `CONTENT_API_URL` to an endpoint that returns either an article array or `{ "articles": [...] }` using the same fields:

```bash
CONTENT_API_URL=https://cms.example.com/api/articles npm run build
```

This is a build-time fetch: visitors still receive lightweight static HTML and the site keeps its SEO and performance advantages. Configure the CMS to trigger a deploy hook whenever content changes.

## Deployment

The deployable directory is `dist/`. It works on any static host. Set `SITE_URL` during build when moving to a custom domain so canonical URLs, sitemap, and structured data use the final origin.
