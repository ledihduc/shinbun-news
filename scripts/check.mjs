import { access, readFile } from 'node:fs/promises';
import { articles, categories } from '../src/articles.js';

const errors = [];
const required = ['id', 'slug', 'title', 'description', 'category', 'type', 'tags', 'image', 'publishedAt', 'author', 'readTime', 'sections'];
const slugs = new Set();
for (const article of articles) {
  for (const key of required) if (!article[key] || (Array.isArray(article[key]) && !article[key].length)) errors.push(`${article.slug || article.id}: missing ${key}`);
  if (slugs.has(article.slug)) errors.push(`duplicate slug: ${article.slug}`);
  slugs.add(article.slug);
  if (!categories.some((category) => category.slug === article.category)) errors.push(`${article.slug}: unknown category ${article.category}`);
  try { await access(new URL(`../public${article.image}`, import.meta.url)); } catch { errors.push(`${article.slug}: missing image ${article.image}`); }
}
for (const path of ['index.html', 'search/index.html', 'sitemap.xml', 'robots.txt', '404.html']) {
  try { await access(new URL(`../dist/${path}`, import.meta.url)); } catch { errors.push(`missing build output: ${path}`); }
}
const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8').catch(() => '');
if (!home.includes('application/ld+json')) errors.push('home: missing JSON-LD');
if (!home.includes('rel="canonical"')) errors.push('home: missing canonical');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Checks passed: ${articles.length} articles, ${categories.length} categories, SEO metadata present.`);
