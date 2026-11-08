import { access, readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { categories } from '../src/articles.js';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
const errors = [];
const requiredArticleFields = ['id', 'slug', 'title', 'description', 'seoDescription', 'category', 'type', 'tags', 'image', 'publishedAt', 'updatedAt', 'author', 'readTime', 'points', 'sections', 'sources'];
const slugs = new Set();

const exists = async (path) => access(path).then(() => true).catch(() => false);
const assetVariant = (image, ratio) => image.replace(/\.[^.]+$/, `-${ratio}.webp`);
const articles = JSON.parse(await readFile(join(dist, 'data', 'articles.json'), 'utf8'));

for (const article of articles) {
  for (const key of requiredArticleFields) {
    if (!article[key] || (Array.isArray(article[key]) && !article[key].length)) errors.push(`${article.slug || article.id}: missing ${key}`);
  }
  if (slugs.has(article.slug)) errors.push(`duplicate slug: ${article.slug}`);
  slugs.add(article.slug);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) errors.push(`${article.slug}: slug must use lowercase ASCII letters, numbers, and hyphens`);
  if (!categories.some((category) => category.slug === article.category)) errors.push(`${article.slug}: unknown category ${article.category}`);
  if (article.updatedAt < article.publishedAt) errors.push(`${article.slug}: updatedAt cannot be earlier than publishedAt`);
  if (article.description.length < 55 || article.description.length > 140) errors.push(`${article.slug}: description should be 55-140 characters`);
  if (article.seoDescription.length < 55 || article.seoDescription.length > 160) errors.push(`${article.slug}: seoDescription should be 55-160 characters`);
  if (article.points.length < 3) errors.push(`${article.slug}: at least three editorial points are required`);
  if (article.sections.length < 4) errors.push(`${article.slug}: at least four article sections are required`);
  const sectionHeadings = new Set();
  let articleBodyLength = 0;
  for (const section of article.sections) {
    if (!section.heading || !Array.isArray(section.body) || section.body.length < 2) errors.push(`${article.slug}: every section requires a heading and at least two paragraphs`);
    if (sectionHeadings.has(section.heading)) errors.push(`${article.slug}: duplicate section heading "${section.heading}"`);
    sectionHeadings.add(section.heading);
    articleBodyLength += (section.body || []).join('').length;
  }
  if (articleBodyLength < 800) errors.push(`${article.slug}: article body is too short (${articleBodyLength} characters; minimum 800)`);
  const isRemoteImage = /^https:\/\//.test(article.image);
  if (isRemoteImage && (!article.images?.wide || !article.images?.landscape || !article.images?.square)) errors.push(`${article.slug}: remote image requires images.wide, images.landscape, and images.square`);
  const imageSet = article.images || { wide: assetVariant(article.image, '16x9'), landscape: assetVariant(article.image, '4x3'), square: assetVariant(article.image, '1x1') };
  for (const asset of [article.image, imageSet.wide, imageSet.landscape, imageSet.square]) {
    if (asset.startsWith('/') && !await exists(join(root, 'public', asset))) errors.push(`${article.slug}: missing image ${asset}`);
    if (!asset.startsWith('/')) {
      try {
        const url = new URL(asset);
        if (url.protocol !== 'https:') errors.push(`${article.slug}: image URL must use HTTPS (${asset})`);
      } catch {
        errors.push(`${article.slug}: invalid image URL ${asset}`);
      }
    }
  }
  if (article.sources.length < 2) errors.push(`${article.slug}: at least two primary or authoritative sources are required`);
  for (const source of article.sources) if (!source.title || !source.publisher || !/^https:\/\//.test(source.url || '')) errors.push(`${article.slug}: invalid source entry`);
}

const requiredOutputs = [
  'index.html', 'search/index.html', 'sitemap.xml', 'news-sitemap.xml', 'robots.txt', 'feed.xml', 'ads.txt', '404.html',
  'editorial-policy/index.html', 'authors/editorial-team/index.html',
  'privacy/index.html', 'assets/publisher-logo.svg'
];
for (const path of requiredOutputs) if (!await exists(join(dist, path))) errors.push(`missing build output: ${path}`);
if (await exists(join(dist, 'about', 'index.html'))) errors.push('removed About page is still present in the build');
if (await exists(join(dist, 'contact', 'index.html'))) errors.push('removed Contact page is still present in the build');

async function walk(dir) {
  const output = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) output.push(...await walk(path));
    else output.push(path);
  }
  return output;
}

const htmlFiles = (await walk(dist)).filter((path) => path.endsWith('.html'));
const titles = new Map();
const canonicals = new Map();
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const page = relative(dist, file);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  if (!title) errors.push(`${page}: missing title`);
  if (!/<meta name="description" content="[^"]+"/i.test(html)) errors.push(`${page}: missing meta description`);
  if (!canonical) errors.push(`${page}: missing canonical`);
  if (!/<html lang="ja">/i.test(html)) errors.push(`${page}: missing Japanese language declaration`);
  if ((html.match(/<h1\b/gi) || []).length !== 1) errors.push(`${page}: expected exactly one h1`);
  if (!/<meta property="og:title"/i.test(html) || !/<meta name="twitter:title"/i.test(html)) errors.push(`${page}: incomplete social metadata`);
  if (!/<link rel="alternate" type="application\/atom\+xml"/i.test(html)) errors.push(`${page}: missing feed discovery link`);
  const adsenseScripts = html.match(/<script async src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-8439241871121285" crossorigin="anonymous"><\/script>/g) || [];
  if (adsenseScripts.length !== 1) errors.push(`${page}: expected exactly one configured AdSense script`);
  if (html.includes('デザイン用のサンプル')) errors.push(`${page}: sample-content marker remains`);
  if (html.includes('href="/contact/"')) errors.push(`${page}: removed Contact link remains`);
  if (title) titles.set(title, [...(titles.get(title) || []), page]);
  if (canonical) canonicals.set(canonical, [...(canonicals.get(canonical) || []), page]);
}
for (const [title, pages] of titles) if (pages.length > 1) errors.push(`duplicate title "${title}": ${pages.join(', ')}`);
for (const [canonical, pages] of canonicals) if (pages.length > 1) errors.push(`duplicate canonical "${canonical}": ${pages.join(', ')}`);

const home = await readFile(join(dist, 'index.html'), 'utf8').catch(() => '');
if (!home.includes('"@type":"WebSite"') || !home.includes('"@type":"Organization"')) errors.push('home: missing WebSite or Organization JSON-LD');
if (!home.includes('data-ad-slot="3015789884"') || !home.includes('data-ad-layout-key="-ha+d-1s-52+g5"')) errors.push('home: missing configured native in-feed ad');

for (const category of categories) {
  const html = await readFile(join(dist, 'category', category.slug, 'index.html'), 'utf8').catch(() => '');
  if (!html.includes('data-ad-slot="3015789884"')) errors.push(`${category.slug}: missing configured native in-feed ad`);
}

const siteScript = await readFile(join(dist, 'assets', 'site.js'), 'utf8').catch(() => '');
if (!siteScript.includes("const adsenseFeedSlot = '3015789884'")) errors.push('site.js: missing dynamic search in-feed ad slot');
if (!siteScript.includes("element.dataset.adStatus === 'filled'") || !siteScript.includes("attributeFilter: ['data-ad-status']")) errors.push('site.js: missing unfilled AdSense visibility guard');

for (const article of articles) {
  const html = await readFile(join(dist, 'articles', article.slug, 'index.html'), 'utf8').catch(() => '');
  if (!html.includes('"@type":"NewsArticle"')) errors.push(`${article.slug}: missing NewsArticle JSON-LD`);
  if (!html.includes('"@type":"BreadcrumbList"')) errors.push(`${article.slug}: missing breadcrumb JSON-LD`);
  if (!html.includes('/authors/editorial-team/')) errors.push(`${article.slug}: missing author URL`);
  const articleAds = html.match(/data-ad-slot="4818012051"/g) || [];
  if (articleAds.length !== 1) errors.push(`${article.slug}: expected exactly one configured in-article ad`);
  if (!html.includes('data-ad-layout="in-article"') || !html.includes('data-ad-format="fluid"')) errors.push(`${article.slug}: incomplete in-article ad configuration`);
  const schemaText = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)?.[1];
  try {
    const schema = JSON.parse(schemaText || '{}');
    const articleNode = schema['@graph']?.find((node) => node['@type'] === 'NewsArticle');
    if (!Array.isArray(articleNode?.image) || new Set(articleNode.image).size < 3) errors.push(`${article.slug}: structured data requires three distinct image aspect ratios`);
  } catch (error) {
    errors.push(`${article.slug}: invalid JSON-LD (${error.message})`);
  }
}

const search = await readFile(join(dist, 'search', 'index.html'), 'utf8').catch(() => '');
const notFound = await readFile(join(dist, '404.html'), 'utf8').catch(() => '');
if (!/<meta name="robots" content="noindex,follow">/i.test(search)) errors.push('search: must be noindex,follow');
if (!/<meta name="robots" content="noindex,follow">/i.test(notFound)) errors.push('404: must be noindex,follow');

const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8').catch(() => '');
if (sitemap.includes('/search/')) errors.push('sitemap: search page must not be included');
if (!sitemap.includes('<lastmod>')) errors.push('sitemap: missing lastmod values');
if (sitemap.includes('/about/')) errors.push('sitemap: removed About page must not be included');
if (sitemap.includes('/contact/')) errors.push('sitemap: removed Contact page must not be included');
for (const path of ['/editorial-policy/', '/authors/editorial-team/', '/privacy/']) if (!sitemap.includes(path)) errors.push(`sitemap: missing ${path}`);

const newsSitemap = await readFile(join(dist, 'news-sitemap.xml'), 'utf8').catch(() => '');
if (!newsSitemap.includes('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"')) errors.push('news sitemap: missing Google News namespace');
if (!newsSitemap.includes('<news:name>新聞・ニュース</news:name>') && newsSitemap.includes('<url>')) errors.push('news sitemap: publication name is inconsistent');

const robots = await readFile(join(dist, 'robots.txt'), 'utf8').catch(() => '');
const sitemapOrigin = sitemap.match(/<loc>(https:\/\/[^/]+)/)?.[1];
if (!sitemapOrigin || !robots.includes(`Sitemap: ${sitemapOrigin}/sitemap.xml`) || !robots.includes(`Sitemap: ${sitemapOrigin}/news-sitemap.xml`)) errors.push('robots.txt: missing sitemap declarations for the canonical origin');

const adsTxt = await readFile(join(dist, 'ads.txt'), 'utf8').catch(() => '');
if (adsTxt.trim() !== 'google.com, pub-8439241871121285, DIRECT, f08c47fec0942fa0') errors.push('ads.txt: invalid Google AdSense publisher declaration');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`SEO checks passed: ${articles.length} articles, ${categories.length} categories, ${htmlFiles.length} HTML pages.`);
