import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { articles as localArticles, categories } from '../src/articles.js';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, 'dist');
const siteUrl = (process.env.SITE_URL || 'https://shinbun.news').replace(/\/$/, '');
const siteName = '新聞・ニュース';
const editorialName = '新聞・ニュース編集部';
const assetVersion = '20261108-5';
const policyUpdatedAt = '2026-11-08';
const authorPath = '/authors/editorial-team/';
const defaultRobots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
const adsenseClient = 'ca-pub-8439241871121285';
const adsenseFeedSlot = '3015789884';
const adsenseFeedLayoutKey = '-ha+d-1s-52+g5';
const adsenseArticleSlot = '4818012051';

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
const absolute = (path) => /^https?:\/\//.test(path) ? path : `${siteUrl}${path}`;
const withTimeZone = (value) => value.includes('T') ? value : `${value}T09:00:00+09:00`;
const imageBase = (image) => image.replace(/\.[^.]+$/, '');
const imageVariants = (image, provided = {}) => ({
  square: provided.square || (/^https?:\/\//.test(image) ? image : `${imageBase(image)}-1x1.webp`),
  landscape: provided.landscape || (/^https?:\/\//.test(image) ? image : `${imageBase(image)}-4x3.webp`),
  wide: provided.wide || (/^https?:\/\//.test(image) ? image : `${imageBase(image)}-16x9.webp`)
});
const articleSeoDescription = (article) => article.seoDescription || `${article.description} ${article.points.slice(0, 2).join('、')}という観点から、実務で確認したい要点を紹介します。`;
const responsiveImage = (image, alt = '', attributes = '', provided = {}) => {
  const variants = imageVariants(image, provided);
  return `<picture><source srcset="${esc(variants.wide)}" type="image/webp"><img src="${esc(image)}" alt="${esc(alt)}" ${attributes}></picture>`;
};
const breadcrumbSchema = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: absolute(item.path) }))
});
const schemaGraph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes });

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
  <div class="utility"><div class="shell"><a href="/about/">${siteName}について</a><time datetime="${policyUpdatedAt}">${dateJP(policyUpdatedAt)}</time></div></div>
  <header class="site-header">
    <div class="shell header-main">
      <div class="header-discovery"><button class="menu-button" type="button" aria-label="メニューを開く" aria-controls="site-nav" aria-expanded="false">${icon('menu')}<span>メニュー</span></button><form class="header-search-form" action="/search/" role="search"><label class="sr-only" for="header-search">記事を検索</label><input id="header-search" name="q" type="search" placeholder="キーワードで記事を検索"><button type="submit" aria-label="検索">${icon('search')}</button></form></div>
      <a class="brand" href="/" aria-label="${siteName} トップ"><span class="brand-mark"></span><span class="brand-name">Shinbun.news</span><span class="brand-jp">新聞・ニュース</span></a>
      <div class="header-actions"><a class="header-quick-link" href="/search/"><span>NEW</span>新着記事</a><a class="header-quick-link" href="/#ranking"><span>RANKING</span>ランキング</a><a class="search-link" href="/search/" aria-label="記事を検索">${icon('search')}<span>検索</span></a></div>
    </div>
    <nav id="site-nav" class="nav" aria-label="主要メニュー"><div class="shell nav-inner">${links.map((link) => `<a ${active === link.slug ? 'aria-current="page"' : ''} href="${link.slug ? `/category/${link.slug}/` : '/'}">${esc(link.name)}</a>`).join('')}<a class="nav-keyword" href="/search/?q=${encodeURIComponent('AIエージェント')}">今週のキーワード「AIエージェント」</a></div></nav>
  </header>`;
}

function footer() {
  return `<footer class="footer"><div class="shell footer-grid"><div><a class="brand brand--footer" href="/"><span class="brand-mark"></span><span class="brand-name">新聞・ニュース</span></a><p>テクノロジーを、ビジネスの実践へ。<br>働く人の判断に役立つ知識を、わかりやすく届けます。</p></div><nav aria-label="フッターメニュー">${categories.map((c) => `<a href="/category/${c.slug}/">${esc(c.name)}</a>`).join('')}<a href="/search/">記事を検索</a><a href="/about/">サイトについて</a><a href="/editorial-policy/">編集方針</a><a href="${authorPath}">編集部</a><a href="/contact/">お問い合わせ</a><a href="/privacy/">プライバシー</a></nav></div><div class="shell footer-bottom"><span>© 2026 ${siteName}</span><span><a href="/editorial-policy/">編集方針と制作プロセス</a></span></div></footer>`;
}

function head({ title, description, path = '/', image = '/assets/data-center.jpg', schema = null, robots = defaultRobots, pageType = 'website', article = null }) {
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
  const canonical = `${siteUrl}${path}`;
  const socialImage = absolute(image);
  const articleMeta = article ? `<meta property="article:published_time" content="${withTimeZone(article.publishedAt)}"><meta property="article:modified_time" content="${withTimeZone(article.updatedAt || article.publishedAt)}"><meta property="article:section" content="${esc(categoryFor(article).name)}"><meta property="article:author" content="${absolute(authorPath)}">` : '';
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(fullTitle)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${robots}"><link rel="canonical" href="${canonical}"><link rel="alternate" type="application/atom+xml" title="${siteName} 最新記事" href="/feed.xml"><meta name="theme-color" content="#ffffff"><meta property="og:locale" content="ja_JP"><meta property="og:type" content="${pageType}"><meta property="og:site_name" content="${siteName}"><meta property="og:title" content="${esc(fullTitle)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${socialImage}"><meta property="og:image:width" content="1440"><meta property="og:image:height" content="810"><meta property="og:image:alt" content="${esc(title)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(fullTitle)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${socialImage}">${articleMeta}<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}" crossorigin="anonymous"></script><link rel="preload" href="/assets/styles.css?v=${assetVersion}" as="style"><link rel="stylesheet" href="/assets/styles.css?v=${assetVersion}">${schema ? `<script type="application/ld+json">${json(schema)}</script>` : ''}</head><body>`;
}

function page({ title, description, path, active = '', image, schema, content, bodyClass = '', robots, pageType, article }) {
  return `${head({ title, description, path, image, schema, robots, pageType, article })}<div class="${bodyClass}">${header(active)}<main id="main">${content}</main>${footer()}</div><div id="toast" class="toast" role="status" aria-live="polite"></div><script src="/assets/site.js?v=${assetVersion}" defer></script></body></html>`;
}

function meta(article, showCategory = false) {
  const category = categoryFor(article);
  return `<div class="meta">${showCategory ? `<a href="/category/${category.slug}/">${esc(category.name)}</a>` : ''}<time datetime="${article.publishedAt}">${dateJP(article.publishedAt)}</time><span>${article.readTime}分で読める</span></div>`;
}

function articleCard(article, variant = '') {
  const category = categoryFor(article);
  return `<article class="article-card ${variant}" data-article data-category="${article.category}" data-type="${article.type}" data-date="${article.publishedAt}"><a class="card-image" href="/articles/${article.slug}/">${responsiveImage(article.image, '', 'loading="lazy" width="720" height="405"', article.images)}</a><div class="card-body"><div class="eyebrow"><a href="/category/${category.slug}/">${esc(category.name)}</a><span>・${esc(article.type)}</span></div><h3><a href="/articles/${article.slug}/">${esc(article.title)}</a></h3><p>${esc(article.description)}</p>${meta(article)}</div></article>`;
}

function listItem(article) {
  const category = categoryFor(article);
  return `<article class="list-item" data-article data-category="${article.category}" data-type="${article.type}" data-date="${article.publishedAt}"><a class="list-thumb" href="/articles/${article.slug}/">${responsiveImage(article.image, '', 'loading="lazy" width="320" height="180"', article.images)}</a><div><div class="eyebrow"><a href="/category/${category.slug}/">${esc(category.name)}</a><span>・${esc(article.type)}</span></div><h3><a href="/articles/${article.slug}/">${esc(article.title)}</a></h3><p>${esc(article.description)}</p>${meta(article)}</div></article>`;
}

function inFeedAd() {
  return `<div class="feed-ad" data-feed-ad aria-label="広告"><span class="feed-ad-label">広告</span><ins class="adsbygoogle" style="display:block" data-ad-format="fluid" data-ad-layout-key="${adsenseFeedLayoutKey}" data-ad-client="${adsenseClient}" data-ad-slot="${adsenseFeedSlot}"></ins></div>`;
}

function inArticleAd() {
  return `<div class="article-ad" data-article-ad aria-label="広告"><span class="feed-ad-label">広告</span><ins class="adsbygoogle" style="display:block;text-align:center" data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="${adsenseClient}" data-ad-slot="${adsenseArticleSlot}"></ins></div>`;
}

function renderFeed(items, renderer, insertAfter = 3) {
  const output = items.map(renderer);
  if (insertAfter > 0 && output.length > insertAfter) output.splice(insertAfter, 0, inFeedAd());
  return output.join('');
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
  const schema = schemaGraph(
    { '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: '新聞・ニュース', alternateName: 'Shinbun.news', url: `${siteUrl}/`, inLanguage: 'ja-JP', publisher: { '@id': `${siteUrl}/#organization` }, potentialAction: { '@type': 'SearchAction', target: `${siteUrl}/search/?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
    { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: '新聞・ニュース', alternateName: 'Shinbun.news', url: `${siteUrl}/`, logo: { '@type': 'ImageObject', url: `${siteUrl}/assets/publisher-logo.svg`, width: 512, height: 512 }, sameAs: ['https://github.com/ledihduc/shinbun-news'] }
  );
  const content = `<section class="topic-strip"><div class="shell"><strong>注目のキーワード</strong><div>${['生成AI', 'AIエージェント', 'ゼロトラスト', 'クラウド', '業務改革'].map((t) => `<a href="/search/?q=${encodeURIComponent(t)}">${t}</a>`).join('')}</div></div></section>
  <section class="shell section must-read"><div class="xtech-section-head"><div><h1>今日の必読</h1><span>Today's Picks</span></div></div><div class="must-read-layout"><div class="must-read-main"><article class="lead-news"><div class="lead-news-copy"><div class="eyebrow"><a href="/category/${categoryFor(lead).slug}/">${esc(categoryFor(lead).name)}</a><span>・${esc(lead.type)}</span></div><h2><a href="/articles/${lead.slug}/">${esc(lead.title)}</a></h2><p>${esc(lead.description)}</p>${meta(lead)}</div><a class="lead-news-image" href="/articles/${lead.slug}/">${responsiveImage(lead.image, '', 'width="720" height="405" fetchpriority="high"', lead.images)}</a></article><section class="related-ribbon"><h2>関連記事</h2><div>${leadRelated.map((item) => `<a href="/articles/${item.slug}/">${esc(item.title)}</a>`).join('')}</div></section><div class="must-read-grid">${[second, third, fourth].map((item) => articleCard(item, 'article-card--must')).join('')}</div></div><aside class="home-sidebar"><section class="notice-panel panel"><h2>編集部からのお知らせ</h2><a href="/editorial-policy/">編集方針と制作プロセス</a><a href="/articles/primary-sources-for-tech-news/">技術ニュースを読み解く、一次情報の確かめ方</a><a href="/articles/data-governance-first-role/">データ活用の判断軸を、実務から考える</a></section><div id="ranking">${ranking(popular)}</div></aside></div></section>
  <section class="shell section home-content"><div class="latest"><div class="section-head section-head--line"><h2>新着記事 <small>Latest Articles</small></h2><a href="/search/">新着記事の一覧 ${icon('arrow')}</a></div><div id="latest-list">${renderFeed(latest, listItem, 3)}</div><button class="button button--outline" type="button" data-load-more data-target="#latest-list" data-step="3">もっと見る</button></div><aside><div class="editor-note panel"><span>SHINBUN.NEWS EDITORIAL</span><h2>テクノロジーを、ビジネスの実践へ。</h2><p>話題性だけでなく、仕組みと実務への影響を丁寧に読み解きます。</p><a href="/search/">記事を検索する ${icon('arrow')}</a></div><div class="keyword-panel panel"><h2>注目のテーマ</h2><div>${['生成AI','DX','セキュリティ','クラウド','ロボティクス'].map((t) => `<a href="/search/?q=${encodeURIComponent(t)}">${t}</a>`).join('')}</div></div></aside></section>
  <section class="category-bands">${groups.map(({ category, items }, groupIndex) => `<div class="shell category-band"><div class="category-band-head"><div><span>0${groupIndex + 1}</span><h2>${esc(category.name)}</h2><p>${esc(category.description)}</p></div><a href="/category/${category.slug}/">すべて見る ${icon('arrow')}</a></div><div class="card-grid">${items.map((a) => articleCard(a)).join('')}</div></div>`).join('')}</section>`;
  return page({ title: siteName, description: 'AI、DX、セキュリティ、クラウド、製造・ロボティクスの知識を、実務の判断と行動につなげる日本語テクノロジーメディアです。', path: '/', schema, content, bodyClass: 'home-page' });
}

function categoryPage(category) {
  const items = byDate.filter((article) => article.category === category.slug);
  const feature = items.find((article) => article.featured) || items[0];
  const rest = items.filter((article) => article.id !== feature.id);
  const popular = [...articles].filter((a) => a.popular).sort((a, b) => a.popular - b.popular).slice(0, 5);
  const path = `/category/${category.slug}/`;
  const description = `${category.description} ${category.name}に関するニュース、技術解説、導入事例を編集部が実務目線で紹介します。`;
  const schema = schemaGraph(
    { '@type': 'CollectionPage', '@id': `${absolute(path)}#collection`, url: absolute(path), name: category.name, description, inLanguage: 'ja-JP', isPartOf: { '@id': `${siteUrl}/#website` }, mainEntity: { '@id': `${absolute(path)}#articles` } },
    { '@type': 'ItemList', '@id': `${absolute(path)}#articles`, itemListElement: items.map((article, index) => ({ '@type': 'ListItem', position: index + 1, url: absolute(`/articles/${article.slug}/`), name: article.title })) },
    breadcrumbSchema([{ name: 'トップ', path: '/' }, { name: category.name, path }])
  );
  const content = `<div class="shell breadcrumb"><a href="/">トップ</a><span>/</span><span>${esc(category.name)}</span></div>
  <section class="shell category-hero"><div><span class="section-kicker">CATEGORY</span><h1>${esc(category.name)}</h1><p>${esc(category.description)}</p></div><div class="category-index">${String(categories.findIndex((c) => c.slug === category.slug) + 1).padStart(2, '0')}</div></section>
  <section class="shell category-feature">${articleCard(feature, 'article-card--feature')}</section>
  <div class="shell filter-row" data-filter-root><div class="filter-tabs" role="group" aria-label="記事タイプ"><button class="is-active" data-filter-type="all">すべて</button>${['ニュース', '技術解説', '導入事例'].map((type) => `<button data-filter-type="${type}">${type}</button>`).join('')}</div><label>並び順<select data-sort><option value="new">新しい順</option><option value="old">古い順</option></select></label></div>
  <section class="shell category-layout"><div><div class="category-card-grid" id="category-list">${renderFeed(rest, articleCard, Math.min(2, rest.length - 1))}</div><div class="empty-state" data-empty hidden><h2>記事が見つかりませんでした。</h2><p>別の種類を選んでください。</p></div><button class="button button--outline" type="button" data-load-more data-target="#category-list" data-step="4">もっと見る</button></div><aside><div class="panel keyword-panel"><h2>この分野のキーワード</h2><div>${[...new Set(items.flatMap((a) => a.tags))].slice(0, 7).map((t) => `<a href="/search/?q=${encodeURIComponent(t)}">${esc(t)}</a>`).join('')}</div></div>${ranking(popular)}</aside></section>`;
  return page({ title: category.name, description, path, active: category.slug, image: feature.image, schema, content, bodyClass: 'category-page' });
}

function articlePage(article) {
  const category = categoryFor(article);
  const related = byDate.filter((item) => item.category === article.category && item.id !== article.id).slice(0, 3);
  const path = `/articles/${article.slug}/`;
  const seoDescription = articleSeoDescription(article);
  const variants = imageVariants(article.image, article.images);
  const articleSchema = schemaGraph(
    { '@type': 'NewsArticle', '@id': `${absolute(path)}#article`, headline: article.title, description: seoDescription, image: [absolute(variants.square), absolute(variants.landscape), absolute(variants.wide)], datePublished: withTimeZone(article.publishedAt), dateModified: withTimeZone(article.updatedAt || article.publishedAt), author: { '@type': 'Organization', '@id': `${absolute(authorPath)}#editorial-team`, name: article.author, url: absolute(authorPath) }, publisher: { '@id': `${siteUrl}/#organization` }, mainEntityOfPage: { '@type': 'WebPage', '@id': absolute(path) }, articleSection: category.name, keywords: article.tags.join(', '), inLanguage: 'ja-JP', isAccessibleForFree: true },
    { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: '新聞・ニュース', alternateName: 'Shinbun.news', url: `${siteUrl}/`, logo: { '@type': 'ImageObject', url: `${siteUrl}/assets/publisher-logo.svg`, width: 512, height: 512 } },
    breadcrumbSchema([{ name: 'トップ', path: '/' }, { name: category.name, path: `/category/${category.slug}/` }, { name: article.title, path }])
  );
  const sourceBox = article.sources?.length
    ? `<section class="source-box"><h2>出典・参考資料</h2><ul>${article.sources.map((source) => `<li><a href="${esc(source.url)}" rel="noopener noreferrer">${esc(source.title)}</a>${source.publisher ? ` — ${esc(source.publisher)}` : ''}</li>`).join('')}</ul></section>`
    : `<section class="source-box"><h2>編集・情報源について</h2><p>本記事は、編集部が一般的な実務原則を整理した解説です。個別の製品・制度・契約に関する判断では、提供元の公式情報と自社の規程をご確認ください。制作プロセスは<a href="/editorial-policy/">編集方針</a>で公開しています。</p></section>`;
  const content = `<div class="shell breadcrumb"><a href="/">トップ</a><span>/</span><a href="/category/${category.slug}/">${esc(category.name)}</a><span>/</span><span>記事</span></div>
  <article class="article-shell"><header class="article-header"><div class="eyebrow"><a href="/category/${category.slug}/">${esc(category.name)}</a><span>・${esc(article.type)}</span></div><h1>${esc(article.title)}</h1><p class="dek">${esc(article.description)}</p><div class="article-byline"><div><strong><a href="${authorPath}" rel="author">${esc(article.author)}</a></strong><div class="meta"><time datetime="${withTimeZone(article.publishedAt)}">公開 ${dateJP(article.publishedAt)}</time>${article.updatedAt && article.updatedAt !== article.publishedAt ? `<time datetime="${withTimeZone(article.updatedAt)}">更新 ${dateJP(article.updatedAt)}</time>` : ''}<span>${article.readTime}分で読める</span></div></div><button class="share-button" type="button" data-copy-url>${icon('link')}<span>リンクをコピー</span></button></div></header>
  <figure class="article-hero">${responsiveImage(article.image, `${article.title}のイメージ`, 'width="1440" height="810" fetchpriority="high"', article.images)}<figcaption>${editorialName}によるイメージ</figcaption></figure>
  <div class="article-layout"><div class="article-body"><section class="points"><h2>この記事のポイント</h2><ul>${article.points.map((point) => `<li>${esc(point)}</li>`).join('')}</ul></section><details class="mobile-toc"><summary>目次</summary><ol>${article.sections.map((section, index) => `<li><a href="#section-${index + 1}">${esc(section.heading)}</a></li>`).join('')}</ol></details>${article.sections.map((section, index) => `<section id="section-${index + 1}" class="prose-section"><span class="section-number">0${index + 1}</span><h2>${esc(section.heading)}</h2>${section.body.map((p) => `<p>${esc(p)}</p>`).join('')}${section.list ? `<ul>${section.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}${index === 1 ? `<figure class="article-inline-image">${responsiveImage(article.image, '', 'loading="lazy" width="900" height="506"', article.images)}</figure>` : ''}</section>${index === 0 ? inArticleAd() : ''}`).join('')}${sourceBox}</div><aside class="article-aside"><nav class="toc panel" aria-label="目次"><span>CONTENTS</span><h2>目次</h2><ol>${article.sections.map((section, index) => `<li><a href="#section-${index + 1}"><span>0${index + 1}</span>${esc(section.heading)}</a></li>`).join('')}</ol></nav></aside></div>
  <section class="related"><div class="shell"><div class="section-head section-head--line"><h2>関連記事</h2><a href="/category/${category.slug}/">${esc(category.name)}をもっと見る ${icon('arrow')}</a></div><div class="card-grid">${related.map((item) => articleCard(item)).join('')}</div></div></section></article>`;
  return page({ title: article.title, description: seoDescription, path, active: article.category, image: article.image, schema: articleSchema, content, bodyClass: 'article-page', pageType: 'article', article });
}

function searchPage() {
  const filterRow = (name, label, options) => `<div class="filter-group" role="group" aria-labelledby="filter-${name}-label"><span class="filter-label" id="filter-${name}-label">${label}</span><div class="filter-options">${options.map(({ value, text }, index) => `<button type="button" data-search-filter="${name}" data-filter-value="${value}" aria-pressed="${index === 0 ? 'true' : 'false'}">${text}</button>`).join('')}</div></div>`;
  const categoryOptions = [{ value: '', text: 'すべて' }, ...categories.map((category) => ({ value: category.slug, text: esc(category.name) }))];
  const typeOptions = [{ value: '', text: 'すべて' }, ...['ニュース', '技術解説', '導入事例'].map((value) => ({ value, text: value }))];
  const periodOptions = [{ value: '', text: 'すべて' }, { value: '30', text: '過去30日' }, { value: '90', text: '過去90日' }];
  const content = `<div class="shell breadcrumb"><a href="/">トップ</a><span>/</span><span>記事を検索</span></div><section class="shell search-hero"><span class="section-kicker">SEARCH</span><h1>記事を検索</h1><form class="search-form" role="search" data-search-form><label class="sr-only" for="search-input">キーワード</label><input id="search-input" type="search" name="q" placeholder="キーワード・技術名で検索" autocomplete="off"><button class="button" type="submit">${icon('search')}検索</button></form></section><section class="shell search-layout"><aside id="search-filters" class="search-filters panel" data-search-filters><div class="filter-heading"><h2>絞り込み</h2><div class="filter-heading-actions"><button class="text-button" type="button" data-clear-filters>条件をクリア</button><button class="filter-close" type="button" data-filter-close aria-label="絞り込みを閉じる">${icon('close')}</button></div></div><div class="filter-fields">${filterRow('category', 'カテゴリー', categoryOptions)}${filterRow('type', '記事タイプ', typeOptions)}${filterRow('period', '公開時期', periodOptions)}</div></aside><button class="filter-scrim" type="button" data-filter-scrim aria-label="絞り込みを閉じる" hidden></button><div class="search-results"><div class="results-head"><div><span>検索結果</span><h2 data-result-title>すべての記事</h2></div><div class="results-head-actions"><button class="filter-drawer-trigger" type="button" data-filter-open aria-controls="search-filters" aria-expanded="false">${icon('menu')}絞り込み</button><strong data-result-count>${articles.length}件</strong></div></div><div data-search-results><div class="search-placeholder"><p>キーワードを入力するか、条件を選んでください。</p></div></div><div class="empty-state" data-search-empty hidden><h2>該当する記事が見つかりませんでした。</h2><p>キーワードを短くするか、絞り込み条件を外してお試しください。</p></div><button class="button button--outline" type="button" data-search-more hidden>もっと見る</button></div></section><script id="article-data" type="application/json">${json(byDate.map((a) => ({ ...a, sections: undefined, points: undefined, categoryName: categoryFor(a).name })))}</script>`;
  return page({ title: '記事を検索', description: `${siteName}の記事をキーワード、カテゴリー、記事タイプから検索できます。`, path: '/search/', content, bodyClass: 'search-page', robots: 'noindex,follow' });
}

function notFoundPage() {
  return page({ title: 'ページが見つかりません', description: 'お探しのページは見つかりませんでした。', path: '/404.html', content: `<section class="not-found shell"><span>404</span><h1>ページが見つかりませんでした。</h1><p>URLが変更されたか、ページが削除された可能性があります。</p><div><a class="button" href="/">トップへ戻る</a><a class="button button--outline" href="/search/">記事を検索する</a></div></section>`, robots: 'noindex,follow' });
}

function informationPage({ path, title, description, kicker, sections, schema }) {
  const content = `<div class="shell breadcrumb"><a href="/">トップ</a><span>/</span><span>${esc(title)}</span></div><article class="shell static-page"><header class="static-page-header"><span class="section-kicker">${esc(kicker)}</span><h1>${esc(title)}</h1><p>${esc(description)}</p></header><div class="static-page-body">${sections.map((section) => `<section><h2>${esc(section.heading)}</h2>${section.body.map((paragraph) => `<p>${paragraph}</p>`).join('')}${section.list ? `<ul>${section.list.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}</section>`).join('')}</div></article>`;
  return page({ title, description, path, content, schema: schema || schemaGraph({ '@type': 'WebPage', '@id': absolute(path), url: absolute(path), name: title, description, inLanguage: 'ja-JP', isPartOf: { '@id': `${siteUrl}/#website` }, dateModified: withTimeZone(policyUpdatedAt) }, breadcrumbSchema([{ name: 'トップ', path: '/' }, { name: title, path }])), bodyClass: 'information-page' });
}

const informationPages = [
  {
    path: '/about/', title: '新聞・ニュースについて', kicker: 'ABOUT',
    description: '新聞・ニュースは、テクノロジーの仕組みと実務への影響を、働く人の判断に役立つ形で伝える日本語メディアです。',
    sections: [
      { heading: '私たちの目的', body: ['新聞・ニュースは、AI、DX、セキュリティ、クラウド、製造・ロボティクスを中心に、話題の大きさだけでなく、現場で何を確認し、どう判断するかを整理して届けます。'] },
      { heading: '扱うテーマ', body: ['技術の基本、導入時の論点、運用上のリスク、データや権限の設計など、業務で再利用できる知識を重点的に扱います。'], list: ['AI・生成AIとデータ活用', 'DXと業務改善', 'セキュリティとガバナンス', 'クラウド運用とコスト', '製造現場とロボティクス'] },
      { heading: '透明性について', body: ['記事の制作基準、AIツールの利用、訂正の考え方は<a href="/editorial-policy/">編集方針</a>で公開しています。記事の執筆主体については<a href="/authors/editorial-team/">編集部プロフィール</a>をご覧ください。'] }
    ]
  },
  {
    path: '/editorial-policy/', title: '編集方針', kicker: 'EDITORIAL POLICY',
    description: '新聞・ニュースの記事制作、情報源の扱い、AIツールの利用、訂正と更新に関する基本方針です。',
    sections: [
      { heading: '読者の判断を助ける', body: ['検索順位や話題性だけを目的にせず、読者がテーマを理解し、次の確認や行動へ進める記事を目指します。見出しでは内容を正確に表し、過度な断定や不安をあおる表現を避けます。'] },
      { heading: '情報源と事実確認', body: ['製品仕様、制度、数値、企業発表を扱う場合は、公式文書、一次資料、規格や公的機関の情報を優先します。参照した資料がある記事では、記事末尾にタイトルとリンクを表示できるデータ構造を使用します。'] },
      { heading: 'AIツールの利用', body: ['調査補助、構成案、要約、表記確認などにAIツールを利用する場合があります。AIの出力をそのまま事実として扱わず、公開時には内容、出典、著作権、個人情報、誤解を招く表現を確認する運用を基本とします。'] },
      { heading: '訂正と更新', body: ['公開後に重要な誤りが判明した場合は、内容を修正し、記事の更新日を記録します。お問い合わせは<a href="/contact/">お問い合わせページ</a>からお寄せください。'] }
    ]
  },
  {
    path: authorPath, title: '新聞・ニュース編集部', kicker: 'AUTHOR',
    description: '新聞・ニュース編集部は、テクノロジーを業務の判断と実践につなげるための解説記事を企画・制作しています。',
    sections: [
      { heading: '編集部について', body: ['新聞・ニュース編集部は、AI、データ活用、セキュリティ、クラウド、製造DXを中心に、技術の仕組みと実務上の論点を整理します。個人の専門家を装うプロフィールは作らず、編集主体を組織として明示します。'] },
      { heading: '制作の考え方', body: ['読者が前提条件、リスク、確認事項を把握できる構成を重視します。詳しい制作プロセスとAI利用の考え方は<a href="/editorial-policy/">編集方針</a>をご確認ください。'] }
    ],
    schema: schemaGraph({ '@type': 'ProfilePage', '@id': `${absolute(authorPath)}#profile`, url: absolute(authorPath), name: editorialName, dateModified: withTimeZone(policyUpdatedAt), mainEntity: { '@type': 'Organization', '@id': `${absolute(authorPath)}#editorial-team`, name: editorialName, url: absolute(authorPath), parentOrganization: { '@id': `${siteUrl}/#organization` }, description: 'テクノロジーを業務の判断と実践につなげる解説記事を企画・制作する編集チームです。' } }, breadcrumbSchema([{ name: 'トップ', path: '/' }, { name: editorialName, path: authorPath }]))
  },
  {
    path: '/privacy/', title: 'プライバシーポリシー', kicker: 'PRIVACY',
    description: '新聞・ニュースにおける広告、Cookie、アクセス情報、外部リンク、お問い合わせ情報の取り扱いについて説明します。',
    sections: [
      { heading: '広告とCookie', body: ['当サイトは、第三者配信の広告サービス「Google AdSense」を利用します。Googleなどの第三者配信事業者は、Cookieを使用して、利用者が当サイトや他のウェブサイトへ過去にアクセスした情報に基づく広告を配信する場合があります。広告で使用される情報と設定については、<a href="https://policies.google.com/technologies/ads?hl=ja" rel="noopener noreferrer">Googleの広告に関するポリシー</a>をご確認ください。'] },
      { heading: 'アクセス情報', body: ['ホスティング事業者や広告配信事業者が、セキュリティ、安定運用、広告配信のためにIPアドレス、端末情報、Cookie、リクエスト情報などを処理する場合があります。'] },
      { heading: '外部サイトへのリンク', body: ['当サイトから移動した外部サイトでは、各運営者のプライバシーポリシーが適用されます。'] },
      { heading: 'お問い合わせ', body: ['お問い合わせ時に提供された情報は、内容の確認と返信のために利用します。本方針の重要な変更は、このページの更新日とともに公開します。'] }
    ]
  },
  {
    path: '/contact/', title: 'お問い合わせ', kicker: 'CONTACT',
    description: '記事内容の訂正依頼、サイトに関するご意見、技術的な不具合についてのお問い合わせ窓口です。',
    sections: [
      { heading: '記事の訂正・更新', body: ['記事のURL、該当箇所、確認できる一次資料を添えてお知らせください。内容を確認し、必要に応じて記事を修正して更新日を記録します。'] },
      { heading: 'お問い合わせ方法', body: ['現在は、公開リポジトリの<a href="https://github.com/ledihduc/shinbun-news/issues" rel="noopener noreferrer">GitHub Issues</a>で技術的な不具合と記事の指摘を受け付けています。個人情報や機密情報は投稿しないでください。'] }
    ]
  }
];

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
for (const info of informationPages) await emit(`${info.path.slice(1)}index.html`, informationPage(info));
await emit('search/index.html', searchPage());
await emit('404.html', notFoundPage());
await emit('data/articles.json', `${JSON.stringify(articles, null, 2)}\n`);
const latestArticleDate = byDate.reduce((latest, article) => (article.updatedAt || article.publishedAt) > latest ? (article.updatedAt || article.publishedAt) : latest, '');
const sitemapEntries = [
  { path: '/', lastmod: latestArticleDate },
  ...informationPages.map((info) => ({ path: info.path, lastmod: policyUpdatedAt })),
  ...categories.map((category) => ({ path: `/category/${category.slug}/`, lastmod: byDate.find((article) => article.category === category.slug)?.updatedAt || byDate.find((article) => article.category === category.slug)?.publishedAt || latestArticleDate })),
  ...articles.map((article) => ({ path: `/articles/${article.slug}/`, lastmod: article.updatedAt || article.publishedAt }))
];
await emit('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries.map(({ path, lastmod }) => `<url><loc>${siteUrl}${path}</loc><lastmod>${lastmod}</lastmod></url>`).join('')}</urlset>`);
await emit('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
await emit('ads.txt', `google.com, pub-8439241871121285, DIRECT, f08c47fec0942fa0\n`);
await emit('feed.xml', `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${siteName}</title><id>${siteUrl}/</id><link href="${siteUrl}/feed.xml" rel="self"/><link href="${siteUrl}/"/><updated>${withTimeZone(latestArticleDate)}</updated><author><name>${editorialName}</name><uri>${absolute(authorPath)}</uri></author>${byDate.slice(0, 10).map((a) => `<entry><title>${esc(a.title)}</title><id>${siteUrl}/articles/${a.slug}/</id><link href="${siteUrl}/articles/${a.slug}/"/><published>${withTimeZone(a.publishedAt)}</published><updated>${withTimeZone(a.updatedAt || a.publishedAt)}</updated><author><name>${esc(a.author)}</name><uri>${absolute(authorPath)}</uri></author><summary>${esc(a.description)}</summary></entry>`).join('')}</feed>`);
console.log(`Built ${articles.length} articles, ${categories.length} categories -> ${out}`);
