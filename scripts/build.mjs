import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { articles as localArticles, categories } from '../src/articles.js';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, 'dist');
const siteUrl = (process.env.SITE_URL || 'https://tech-insight-jp-20261025.ducswan36.chatgpt.site').replace(/\/$/, '');
const siteName = 'shinbun.news　新聞・NEWS';
const editorialName = 'shinbun.news 編集部';

async function loadArticles() {
  if (!process.env.CONTENT_API_URL) return localArticles;
  const response = await fetch(process.env.CONTENT_API_URL, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`Content API failed: ${response.status}`);
  const payload = await response.json();
  const data = Array.isArray(payload) ? payload : payload.articles;
  if (!Array.isArray(data) || !data.length) throw new Error('Content API must return an article array');
  return data;
}

const articles = await loadArticles();
const byDate = [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
const categoryMap = Object.fromEntries(categories.map((item) => [item.slug, item]));
const esc = (value = '') => String(value).replace(/[&<>\"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[char]));
const dateJP = (value) => value.replaceAll('-', '.');
const categoryFor = (article) => categoryMap[article.category] || { slug: article.category, name: article.category };
const json = (data) => JSON.stringify(data).replaceAll('<', '\\u003c');

function icon(name) {
  const paths = {
    search: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"></path>',
    close: '<path d="m6 6 12 12M18 6 6 18"></path>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"></path>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1"></path><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1"></path>'
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
}

function header(active = '') {
  const links = [{ slug: '', name: 'トップ' }, ...categories];
  return `<a class="skip-link" href="#main">本文へ移動</a>
  <div class="utility"><div class="shell"><span>${siteName}について</span><time datetime="2026-10-25">2026.10.25</time></div></div>
  <header class="site-header">
    <div class="shell header-main">
      <div class="header-discovery"><button class="menu-button" type="button" aria-label="メニューを開く" aria-controls="site-nav" aria-expanded="false">${icon('menu')}<span>メニュー</span></button><form class="header-search-form" action="/search/" role="search"><label class="sr-only" for="header-search">記事を検索</label><input id="header-search" name="q" type="search" placeholder="キーワードで記事を検索"><button type="submit" aria-label="検索">${icon('search')}</button></form></div>
      <a class="brand" href="/" aria-label="${siteName} トップ"><span class="brand-mark"></span><span class="brand-name">shinbun.news</span><span class="brand-jp">新聞・NEWS</span></a>
      <div class="header-actions"><a class="header-quick-link" href="/search/"><span>NEW</span>新着記事</a><a class="header-quick-link" href="/#ranking"><span>RANKING</span>ランキング</a><a class="search-link" href="/search/" aria-label="記事を検索">${icon('search')}<span>検索</span></a></div>
    </div>
    <nav id="site-nav" class="nav" aria-label="主要メニュー"><div class="shell nav-inner">${links.map((link) => `<a ${active === link.slug ? 'aria-current="page"' : ''} href="${link.slug ? `/category/${link.slug}/` : '/'}">${esc(link.name)}</a>`).join('')}<a class="nav-keyword" href="/search/?q=${encodeURIComponent('AIエージェント')}">今週のキーワード「AIエージェント」</a></div></nav>
  </header>`;
}

function footer() {
  return `<footer class="footer"><div class="shell footer-grid"><div><a class="brand brand--footer" href="/"><span class="brand-mark"></span><span class="brand-name">shinbun.news</span><span class="brand-jp">新聞・NEWS</span></a><p>テクノロジーを、ビジネスの実践へ。<br>働く人の判断に役立つ知識を、わかりやすく届けます。</p></div><nav aria-label="フッターメニュー">${categories.map((c) => `<a href="/category/${c.slug}/">${esc(c.name)}</a>`).join('')}<a href="/search/">記事を検索</a></nav></div><div class="shell footer-bottom"><span>© 2026 ${siteName}</span><span>掲載内容はデザイン用のサンプルです。</span></div></footer>`;
}

function head({ title, description, path = '/', image = '/assets/data-center.jpg', schema = null }) {
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
  const canonical = `${siteUrl}${path}`;
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(fullTitle)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}"><meta name="theme-color" content="#ffffff"><meta property="og:type" content="${schema?.['@type'] === 'NewsArticle' ? 'article' : 'website'}"><meta property="og:site_name" content="${siteName}"><meta property="og:title" content="${esc(fullTitle)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${siteUrl}${image}"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="/assets/styles.css" as="style"><link rel="stylesheet" href="/assets/styles.css">${schema ? `<script type="application/ld+json">${json(schema)}</script>` : ''}</head><body>`;
}

function page({ title, description, path, active = '', image, schema, content, bodyClass = '' }) {
  return `${head({ title, description, path, image, schema })}<div class="${bodyClass}">${header(active)}<main id="main">${content}</main>${footer()}</div><div id="toast" class="toast" role="status" aria-live="polite"></div><script src="/assets/site.js" defer></script></body></html>`;
}

function meta(article, showCategory = false) {
  const category = categoryFor(article);
  return `<div class="meta">${showCategory ? `<a href="/category/${category.slug}/">${esc(category.name)}</a>` : ''}<time datetime="${article.publishedAt}">${dateJP(article.publishedAt)}</time><span>${article.readTime}分で読める</span></div>`;
}

function articleCard(article, variant = '') {
  const category = categoryFor(article);
  return `<article class="article-card ${variant}" data-article data-category="${article.category}" data-type="${article.type}" data-date="${article.publishedAt}"><a class="card-image" href="/articles/${article.slug}/"><img src="${article.image}" alt="" loading="lazy" width="720" height="480"></a><div class="card-body"><div class="eyebrow"><a href="/category/${category.slug}/">${esc(category.name)}</a><span>・${esc(article.type)}</span></div><h3><a href="/articles/${article.slug}/">${esc(article.title)}</a></h3><p>${esc(article.description)}</p>${meta(article)}</div></article>`;
}

function listItem(article) {
  const category = categoryFor(article);
  return `<article class="list-item" data-article data-category="${article.category}" data-type="${article.type}" data-date="${article.publishedAt}"><a class="list-thumb" href="/articles/${article.slug}/"><img src="${article.image}" alt="" loading="lazy" width="320" height="210"></a><div><div class="eyebrow"><a href="/category/${category.slug}/">${esc(category.name)}</a><span>・${esc(article.type)}</span></div><h3><a href="/articles/${article.slug}/">${esc(article.title)}</a></h3><p>${esc(article.description)}</p>${meta(article)}</div></article>`;
}

function ranking(items) {
  return `<section class="ranking panel"><h2>よく読まれている記事</h2><ol>${items.map((article, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><a href="/articles/${article.slug}/">${esc(article.title)}</a></li>`).join('')}</ol></section>`;
}

function homePage() {
  const [lead, second, third] = [articles.find((a) => a.slug === 'ai-agent-data-and-permissions'), articles.find((a) => a.slug === 'manufacturing-dx-data-to-improvement'), articles.find((a) => a.slug === 'zero-trust-basics')];
  const fourth = articles.find((a) => a.slug === 'cloud-cost-first-step');
  const leadRelated = byDate.filter((a) => a.id !== lead.id).slice(0, 3);
  const latest = byDate.filter((a) => ![lead.id, second.id, third.id].includes(a.id)).slice(0, 7);
  const popular = [...articles].filter((a) => a.popular).sort((a, b) => a.popular - b.popular).slice(0, 5);
  const groups = ['ai', 'security', 'cloud'].map((slug) => ({ category: categoryMap[slug], items: byDate.filter((a) => a.category === slug).slice(0, 3) }));
  const schema = { '@context': 'https://schema.org', '@type': 'WebSite', name: siteName, url: `${siteUrl}/`, description: 'テクノロジーを、ビジネスの実践へ。', potentialAction: { '@type': 'SearchAction', target: `${siteUrl}/search/?q={search_term_string}`, 'query-input': 'required name=search_term_string' } };
  const content = `<section class="topic-strip"><div class="shell"><strong>注目のキーワード</strong><div>${['生成AI', 'AIエージェント', 'ゼロトラスト', 'クラウド', '業務改革'].map((t) => `<a href="/search/?q=${encodeURIComponent(t)}">${t}</a>`).join('')}</div></div></section>
  <section class="shell section must-read"><div class="xtech-section-head"><div><h1>今日の必読</h1><span>Today's Picks</span></div></div><div class="must-read-layout"><div class="must-read-main"><article class="lead-news"><div class="lead-news-copy"><div class="eyebrow"><a href="/category/${categoryFor(lead).slug}/">${esc(categoryFor(lead).name)}</a><span>・${esc(lead.type)}</span></div><h2><a href="/articles/${lead.slug}/">${esc(lead.title)}</a></h2><p>${esc(lead.description)}</p>${meta(lead)}</div><a class="lead-news-image" href="/articles/${lead.slug}/"><img src="${lead.image}" alt="" width="720" height="480"></a></article><section class="related-ribbon"><h2>関連記事</h2><div>${leadRelated.map((item) => `<a href="/articles/${item.slug}/">${esc(item.title)}</a>`).join('')}</div></section><div class="must-read-grid">${[second, third, fourth].map((item) => articleCard(item, 'article-card--must')).join('')}</div></div><aside class="home-sidebar"><section class="notice-panel panel"><h2>編集部からのお知らせ</h2><a href="/articles/primary-sources-for-tech-news/">技術ニュースを読み解く、一次情報の確かめ方</a><a href="/articles/data-governance-first-role/">データ活用の判断軸を、実務から考える</a><a href="/search/">すべての記事を検索する</a></section><div id="ranking">${ranking(popular)}</div></aside></div></section>
  <section class="shell section home-content"><div class="latest"><div class="section-head section-head--line"><h2>新着記事 <small>Latest Articles</small></h2><a href="/search/">新着記事の一覧 ${icon('arrow')}</a></div><div id="latest-list">${latest.map(listItem).join('')}</div><button class="button button--outline" type="button" data-load-more data-target="#latest-list" data-step="3">もっと見る</button></div><aside><div class="editor-note panel"><span>SHINBUN.NEWS EDITORIAL</span><h2>テクノロジーを、ビジネスの実践へ。</h2><p>話題性だけでなく、仕組みと実務への影響を丁寧に読み解きます。</p><a href="/search/">記事を検索する ${icon('arrow')}</a></div><div class="keyword-panel panel"><h2>注目のテーマ</h2><div>${['生成AI','DX','セキュリティ','クラウド','ロボティクス'].map((t) => `<a href="/search/?q=${encodeURIComponent(t)}">${t}</a>`).join('')}</div></div></aside></section>
  <section class="category-bands">${groups.map(({ category, items }, groupIndex) => `<div class="shell category-band"><div class="category-band-head"><div><span>0${groupIndex + 1}</span><h2>${esc(category.name)}</h2><p>${esc(category.description)}</p></div><a href="/category/${category.slug}/">すべて見る ${icon('arrow')}</a></div><div class="card-grid">${items.map((a) => articleCard(a)).join('')}</div></div>`).join('')}</section>`;
  return page({ title: siteName, description: 'AI、DX、セキュリティ、クラウド、製造・ロボティクスの知識を、ビジネスの実践へつなげるテクノロジーメディア。', path: '/', schema, content, bodyClass: 'home-page' });
}

function categoryPage(category) {
  const items = byDate.filter((article) => article.category === category.slug);
  const feature = items.find((article) => article.featured) || items[0];
  const rest = items.filter((article) => article.id !== feature.id);
  const popular = [...articles].filter((a) => a.popular).sort((a, b) => a.popular - b.popular).slice(0, 5);
  const content = `<div class="shell breadcrumb"><a href="/">トップ</a><span>/</span><span>${esc(category.name)}</span></div>
  <section class="shell category-hero"><div><span class="section-kicker">CATEGORY</span><h1>${esc(category.name)}</h1><p>${esc(category.description)}</p></div><div class="category-index">${String(categories.findIndex((c) => c.slug === category.slug) + 1).padStart(2, '0')}</div></section>
  <section class="shell category-feature">${articleCard(feature, 'article-card--feature')}</section>
  <div class="shell filter-row" data-filter-root><div class="filter-tabs" role="group" aria-label="記事タイプ"><button class="is-active" data-filter-type="all">すべて</button>${['ニュース', '技術解説', '導入事例'].map((type) => `<button data-filter-type="${type}">${type}</button>`).join('')}</div><label>並び順<select data-sort><option value="new">新しい順</option><option value="old">古い順</option></select></label></div>
  <section class="shell category-layout"><div><div class="category-card-grid" id="category-list">${rest.map((a) => articleCard(a)).join('')}</div><div class="empty-state" data-empty hidden><h2>記事が見つかりませんでした。</h2><p>別の種類を選んでください。</p></div><button class="button button--outline" type="button" data-load-more data-target="#category-list" data-step="4">もっと見る</button></div><aside><div class="panel keyword-panel"><h2>この分野のキーワード</h2><div>${[...new Set(items.flatMap((a) => a.tags))].slice(0, 7).map((t) => `<a href="/search/?q=${encodeURIComponent(t)}">${esc(t)}</a>`).join('')}</div></div>${ranking(popular)}</aside></section>`;
  return page({ title: category.name, description: category.description, path: `/category/${category.slug}/`, active: category.slug, image: feature.image, content, bodyClass: 'category-page' });
}

function articlePage(article) {
  const category = categoryFor(article);
  const related = byDate.filter((item) => item.category === article.category && item.id !== article.id).slice(0, 3);
  const articleSchema = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: article.title, description: article.description, image: `${siteUrl}${article.image}`, datePublished: article.publishedAt, dateModified: article.updatedAt || article.publishedAt, author: { '@type': 'Organization', name: article.author }, publisher: { '@type': 'Organization', name: siteName, logo: { '@type': 'ImageObject', url: `${siteUrl}/assets/favicon.svg` } }, mainEntityOfPage: `${siteUrl}/articles/${article.slug}/` };
  const content = `<div class="shell breadcrumb"><a href="/">トップ</a><span>/</span><a href="/category/${category.slug}/">${esc(category.name)}</a><span>/</span><span>記事</span></div>
  <article class="article-shell"><header class="article-header"><div class="eyebrow"><a href="/category/${category.slug}/">${esc(category.name)}</a><span>・${esc(article.type)}</span></div><h1>${esc(article.title)}</h1><p class="dek">${esc(article.description)}</p><div class="article-byline"><div><strong>${esc(article.author)}</strong><div class="meta"><time datetime="${article.publishedAt}">公開 ${dateJP(article.publishedAt)}</time>${article.updatedAt && article.updatedAt !== article.publishedAt ? `<time datetime="${article.updatedAt}">更新 ${dateJP(article.updatedAt)}</time>` : ''}<span>${article.readTime}分で読める</span></div></div><button class="share-button" type="button" data-copy-url>${icon('link')}<span>リンクをコピー</span></button></div></header>
  <figure class="article-hero"><img src="${article.image}" alt="${esc(article.title)}のイメージ" width="1200" height="720"><figcaption>${editorialName}によるイメージ</figcaption></figure>
  <div class="article-layout"><div class="article-body"><section class="points"><h2>この記事のポイント</h2><ul>${article.points.map((point) => `<li>${esc(point)}</li>`).join('')}</ul></section><details class="mobile-toc"><summary>目次</summary><ol>${article.sections.map((section, index) => `<li><a href="#section-${index + 1}">${esc(section.heading)}</a></li>`).join('')}</ol></details>${article.sections.map((section, index) => `<section id="section-${index + 1}" class="prose-section"><span class="section-number">0${index + 1}</span><h2>${esc(section.heading)}</h2>${section.body.map((p) => `<p>${esc(p)}</p>`).join('')}${section.list ? `<ul>${section.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}${index === 1 ? `<figure class="article-inline-image"><img src="${article.image}" alt="" loading="lazy" width="900" height="540"></figure>` : ''}</section>`).join('')}<section class="source-box"><h2>出典・参考資料</h2><p>本記事はデザイン用のサンプルコンテンツです。実在する企業・調査・発表を出典として引用していません。</p></section></div><aside class="article-aside"><nav class="toc panel" aria-label="目次"><span>CONTENTS</span><h2>目次</h2><ol>${article.sections.map((section, index) => `<li><a href="#section-${index + 1}"><span>0${index + 1}</span>${esc(section.heading)}</a></li>`).join('')}</ol></nav></aside></div>
  <section class="related"><div class="shell"><div class="section-head section-head--line"><h2>関連記事</h2><a href="/category/${category.slug}/">${esc(category.name)}をもっと見る ${icon('arrow')}</a></div><div class="card-grid">${related.map((item) => articleCard(item)).join('')}</div></div></section></article>`;
  return page({ title: article.title, description: article.description, path: `/articles/${article.slug}/`, active: article.category, image: article.image, schema: articleSchema, content, bodyClass: 'article-page' });
}

function searchPage() {
  const content = `<div class="shell breadcrumb"><a href="/">トップ</a><span>/</span><span>記事を検索</span></div><section class="shell search-hero"><span class="section-kicker">SEARCH</span><h1>記事を検索</h1><form class="search-form" role="search" data-search-form><label class="sr-only" for="search-input">キーワード</label><input id="search-input" type="search" name="q" placeholder="キーワード・技術名で検索" autocomplete="off"><button class="button" type="submit">${icon('search')}検索</button></form></section><section class="shell search-layout"><aside class="search-filters panel" data-search-filters><div class="filter-heading"><h2>絞り込み</h2></div><div class="filter-fields"><label>カテゴリー<select name="category"><option value="">すべて</option>${categories.map((c) => `<option value="${c.slug}">${esc(c.name)}</option>`).join('')}</select></label><label>記事タイプ<select name="type"><option value="">すべて</option><option>ニュース</option><option>技術解説</option><option>導入事例</option></select></label><label>公開時期<select name="period"><option value="">すべて</option><option value="30">過去30日</option><option value="90">過去90日</option></select></label><button class="text-button" type="button" data-clear-filters>条件をクリア</button></div></aside><div class="search-results"><div class="results-head"><div><span>検索結果</span><h2 data-result-title>すべての記事</h2></div><strong data-result-count>${articles.length}件</strong></div><div data-search-results><div class="search-placeholder"><p>キーワードを入力するか、条件を選んでください。</p></div></div><div class="empty-state" data-search-empty hidden><h2>該当する記事が見つかりませんでした。</h2><p>キーワードを短くするか、絞り込み条件を外してお試しください。</p></div><button class="button button--outline" type="button" data-search-more hidden>もっと見る</button></div></section><script id="article-data" type="application/json">${json(byDate.map((a) => ({ ...a, sections: undefined, points: undefined, categoryName: categoryFor(a).name })))}</script>`;
  return page({ title: '記事を検索', description: `${siteName}の記事をキーワード、カテゴリー、記事タイプから検索できます。`, path: '/search/', content, bodyClass: 'search-page' });
}

function notFoundPage() {
  return page({ title: 'ページが見つかりません', description: 'お探しのページは見つかりませんでした。', path: '/404.html', content: `<section class="not-found shell"><span>404</span><h1>ページが見つかりませんでした。</h1><p>URLが変更されたか、ページが削除された可能性があります。</p><div><a class="button" href="/">トップへ戻る</a><a class="button button--outline" href="/search/">記事を検索する</a></div></section>` });
}

async function emit(path, content) {
  const target = join(out, path);
  await mkdir(target.endsWith('.html') || target.endsWith('.xml') || target.endsWith('.txt') || target.endsWith('.json') ? target.slice(0, target.lastIndexOf('/')) : target, { recursive: true });
  await writeFile(target, content);
}

await rm(out, { recursive: true, force: true });
await mkdir(join(out, 'assets'), { recursive: true });
await cp(join(root, 'public', 'assets'), join(out, 'assets'), { recursive: true });
await emit('index.html', homePage());
for (const category of categories) await emit(`category/${category.slug}/index.html`, categoryPage(category));
for (const article of articles) await emit(`articles/${article.slug}/index.html`, articlePage(article));
await emit('search/index.html', searchPage());
await emit('404.html', notFoundPage());
await emit('data/articles.json', `${JSON.stringify(articles, null, 2)}\n`);
const sitemapPaths = ['/', '/search/', ...categories.map((c) => `/category/${c.slug}/`), ...articles.map((a) => `/articles/${a.slug}/`)];
await emit('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapPaths.map((path) => `<url><loc>${siteUrl}${path}</loc></url>`).join('')}</urlset>`);
await emit('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
await emit('feed.xml', `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${siteName}</title><id>${siteUrl}/</id><updated>${new Date().toISOString()}</updated>${byDate.slice(0, 10).map((a) => `<entry><title>${esc(a.title)}</title><id>${siteUrl}/articles/${a.slug}/</id><link href="${siteUrl}/articles/${a.slug}/"/><updated>${a.publishedAt}T00:00:00+09:00</updated><summary>${esc(a.description)}</summary></entry>`).join('')}</feed>`);
console.log(`Built ${articles.length} articles, ${categories.length} categories -> ${out}`);
