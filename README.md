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

An article can optionally include real references. They are rendered at the end of the article and validated during the SEO check:

```json
{
  "sources": [
    {
      "title": "Official document title",
      "publisher": "Publisher name",
      "url": "https://example.com/original-source"
    }
  ]
}
```

For images hosted by the CMS, provide three crawlable aspect ratios so article structured data and social previews remain valid:

```json
{
  "image": "https://cdn.example.com/article/hero-16x9.jpg",
  "images": {
    "wide": "https://cdn.example.com/article/hero-16x9.webp",
    "landscape": "https://cdn.example.com/article/hero-4x3.webp",
    "square": "https://cdn.example.com/article/hero-1x1.webp"
  }
}
```

Local images under `public/assets/` use the same `-16x9.webp`, `-4x3.webp`, and `-1x1.webp` naming convention.

## Publish CMS changes immediately

The site is static, so publishing in the CMS must trigger a new build. The recommended production flow is:

1. An admin publishes an article in the CMS.
2. The CMS sends a signed webhook to the deployment service or CI workflow.
3. The deployment job fetches the current API data and runs:

   ```bash
   CONTENT_API_URL=https://cms.example.com/api/articles \
   SITE_URL=https://news.example.com \
   npm run build
   npm run check
   ```

4. Only after both commands pass, the job atomically replaces the web server's current static directory with the new `dist/` directory.
5. The deployment job returns success to the CMS and optionally purges the CDN cache.

This normally updates the live site in seconds to a few minutes while preserving fully rendered HTML for SEO. Authenticate the webhook with a secret signature, allow only one deployment at a time, and keep the previous release available for rollback. Do not put the webhook secret or CMS token in browser code or the repository.

## Google AdSense

Every generated HTML page loads the asynchronous AdSense library for publisher `ca-pub-8439241871121285`. The build also emits `dist/ads.txt` with the matching Google seller declaration. The privacy page discloses Google AdSense and cookie usage.

This installs the site-level code required for AdSense and Auto ads. Native in-feed ad unit `3015789884` is inserted into the homepage article feed, category feeds, and dynamically rendered search results. The AdSense loader remains global and is emitted exactly once per HTML page. Google must be able to access the public production domain before it can review the site or verify `ads.txt`.

## Deployment

The deployable directory is `dist/`. It works on any static host. Set `SITE_URL` during build when moving to a custom domain so canonical URLs, sitemap, and structured data use the final origin.

Before making the production site public, build once with the final domain and verify that `dist/sitemap.xml`, canonical tags, Open Graph URLs, and structured data all use that same origin. The search page and 404 page intentionally use `noindex,follow`; neither is included in the sitemap.
