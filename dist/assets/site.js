(() => {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const toast = (message) => {
    const element = qs('#toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('is-visible');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => element.classList.remove('is-visible'), 2600);
  };

  const menuButton = qs('.menu-button');
  const nav = qs('#site-nav');
  if (menuButton && nav) {
    const setMenuOpen = (open) => {
      nav.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      menuButton.innerHTML = open
        ? '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"></path></svg><span>閉じる</span>'
        : '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"></path></svg><span>メニュー</span>';
    };
    menuButton.addEventListener('click', () => setMenuOpen(!nav.classList.contains('is-open')));
    qsa('a', nav).forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    });
  }

  qsa('[data-copy-url]').forEach((button) => button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      toast('リンクをコピーしました。');
    } catch {
      const input = document.createElement('textarea');
      input.value = location.href;
      document.body.append(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      toast('リンクをコピーしました。');
    }
  }));

  function setupLoadMore(button) {
    const target = qs(button.dataset.target);
    if (!target) return;
    const step = Number(button.dataset.step || 4);
    let shown = step;
    const update = () => {
      const items = qsa('[data-article]', target).filter((item) => !item.dataset.filteredOut);
      items.forEach((item, index) => { item.hidden = index >= shown; });
      button.hidden = shown >= items.length;
    };
    button.addEventListener('click', () => { shown += step; update(); });
    button._update = () => { shown = step; update(); };
    update();
  }
  qsa('[data-load-more]').forEach(setupLoadMore);

  const filterRoot = qs('[data-filter-root]');
  const categoryList = qs('#category-list');
  if (filterRoot && categoryList) {
    let activeType = 'all';
    const sort = qs('[data-sort]', filterRoot);
    const apply = () => {
      const items = qsa('[data-article]', categoryList);
      items.sort((a, b) => sort.value === 'old' ? a.dataset.date.localeCompare(b.dataset.date) : b.dataset.date.localeCompare(a.dataset.date));
      items.forEach((item) => {
        item.dataset.filteredOut = activeType !== 'all' && item.dataset.type !== activeType ? 'true' : '';
        item.hidden = Boolean(item.dataset.filteredOut);
        categoryList.append(item);
      });
      const visible = items.filter((item) => !item.dataset.filteredOut);
      qs('[data-empty]').hidden = visible.length > 0;
      qs('[data-load-more]')?._update?.();
    };
    qsa('[data-filter-type]', filterRoot).forEach((button) => button.addEventListener('click', () => {
      activeType = button.dataset.filterType;
      qsa('[data-filter-type]', filterRoot).forEach((item) => item.classList.toggle('is-active', item === button));
      apply();
    }));
    sort.addEventListener('change', apply);
  }

  const searchData = qs('#article-data');
  if (searchData) {
    const articles = JSON.parse(searchData.textContent);
    const form = qs('[data-search-form]');
    const input = qs('input[name="q"]', form);
    const filters = qs('[data-search-filters]');
    const results = qs('[data-search-results]');
    const empty = qs('[data-search-empty]');
    const more = qs('[data-search-more]');
    const filterOpen = qs('[data-filter-open]');
    const filterClose = qs('[data-filter-close]');
    const filterScrim = qs('[data-filter-scrim]');
    let current = [];
    let visibleCount = 6;

    const setFilterDrawer = (open) => {
      filters.classList.toggle('is-open', open);
      filterOpen?.setAttribute('aria-expanded', String(open));
      if (filterScrim) filterScrim.hidden = !open;
      document.body.classList.toggle('filter-drawer-open', open);
    };
    filterOpen?.addEventListener('click', () => setFilterDrawer(true));
    filterClose?.addEventListener('click', () => setFilterDrawer(false));
    filterScrim?.addEventListener('click', () => setFilterDrawer(false));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setFilterDrawer(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) setFilterDrawer(false);
    });

    const normalize = (value) => String(value || '').toLocaleLowerCase('ja-JP').normalize('NFKC');
    const card = (article) => {
      const webp = article.images?.wide || (/^https?:\/\//.test(article.image) ? article.image : article.image.replace(/\.[^.]+$/, '-16x9.webp'));
      return `<article class="list-item search-result"><a class="list-thumb" href="/articles/${article.slug}/"><picture><source srcset="${escapeHTML(webp)}" type="image/webp"><img src="${escapeHTML(article.image)}" alt="" width="320" height="180" loading="lazy"></picture></a><div><div class="eyebrow"><a href="/category/${article.category}/">${escapeHTML(article.categoryName)}</a><span>・${escapeHTML(article.type)}</span></div><h3><a href="/articles/${article.slug}/">${escapeHTML(article.title)}</a></h3><p>${escapeHTML(article.description)}</p><div class="meta"><time datetime="${escapeHTML(article.publishedAt)}">${escapeHTML(article.publishedAt.replaceAll('-', '.'))}</time><span>${Number(article.readTime)}分で読める</span></div></div></article>`;
    };
    const render = () => {
      results.innerHTML = current.slice(0, visibleCount).map(card).join('');
      empty.hidden = current.length > 0;
      more.hidden = visibleCount >= current.length;
      qs('[data-result-count]').textContent = `${current.length}件`;
    };
    const selectedFilter = (name) => qs(`[data-search-filter="${name}"][aria-pressed="true"]`, filters)?.dataset.filterValue || '';
    const selectFilter = (name, value) => {
      qsa(`[data-search-filter="${name}"]`, filters).forEach((button) => {
        const active = button.dataset.filterValue === value;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('is-active', active);
      });
    };
    const run = (push = false) => {
      const category = selectedFilter('category');
      const type = selectedFilter('type');
      const period = selectedFilter('period');
      const query = input.value.trim();
      const needle = normalize(query);
      const now = new Date('2026-10-25T00:00:00+09:00');
      current = articles.filter((article) => {
        const haystack = normalize([article.title, article.description, article.categoryName, article.type, ...(article.tags || [])].join(' '));
        const inPeriod = !period || (now - new Date(`${article.publishedAt}T00:00:00+09:00`)) / 86400000 <= Number(period);
        return (!needle || haystack.includes(needle)) && (!category || article.category === category) && (!type || article.type === type) && inPeriod;
      });
      visibleCount = 6;
      qs('[data-result-title]').textContent = query ? `「${query}」の記事` : 'すべての記事';
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (category) params.set('category', category);
      if (type) params.set('type', type);
      if (period) params.set('period', period);
      const url = `${location.pathname}${params.size ? `?${params}` : ''}`;
      history[push ? 'pushState' : 'replaceState']({ search: true }, '', url);
      render();
    };
    const syncFromUrl = () => {
      const params = new URLSearchParams(location.search);
      input.value = params.get('q') || '';
      selectFilter('category', params.get('category') || '');
      selectFilter('type', params.get('type') || '');
      selectFilter('period', params.get('period') || '');
      run(false);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); run(true); });
    qsa('[data-search-filter]', filters).forEach((button) => button.addEventListener('click', () => {
      selectFilter(button.dataset.searchFilter, button.dataset.filterValue);
      run(true);
    }));
    qs('[data-clear-filters]').addEventListener('click', () => {
      ['category', 'type', 'period'].forEach((name) => selectFilter(name, ''));
      input.value = '';
      run(true);
    });
    more.addEventListener('click', () => { visibleCount += 6; render(); });
    window.addEventListener('popstate', syncFromUrl);
    syncFromUrl();
  }

  const tocLinks = qsa('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const sections = tocLinks.map((link) => qs(link.hash)).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) tocLinks.forEach((link) => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`));
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach((section) => observer.observe(section));
  }
})();
