/**
 * Collection - builds the chronological full collection page.
 * Merges every content source, sorts newest first and groups by year.
 */
(() => {
  'use strict';

  const SOURCES = [
    { url: '/data/talks.json?v=10', type: 'talks', label: 'Talk', normalise: normaliseTalk },
    { url: '/data/writing.json?v=15', type: 'writing', label: 'Writing', normalise: normaliseWriting },
    { url: '/data/courses.json', type: 'courses', label: 'Course', normalise: normaliseLearning },
    { url: '/data/series.json?v=3', type: 'series', label: 'Video series', normalise: normaliseLearning },
    { url: '/data/projects.json?v=7', type: 'projects', label: 'Project', normalise: normaliseProject },
    { url: '/data/press.json?v=7', type: 'accolades', label: 'Accolade', normalise: normalisePress }
  ];

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const headingText = value => escapeHtml(value).replace(/&amp;/g, '<span class="heading-amp">&amp;</span>');

  const isExternal = url => /^https?:\/\//.test(url || '');

  /** Fallback graphic shown when an entry has no video still or picture of its own. */
  const GLYPHS = {
    talks: '“ ”',
    writing: '¶',
    courses: '>_',
    series: '▶',
    projects: '{ }',
    accolades: '★'
  };

  function getYouTubeThumbnail(url) {
    const match = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/.exec(url || '');
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  }

  /** Accepts "2025", 2025, "2025-06" or "2025-06-04" and returns { year, month }. */
  function parseDate(value) {
    const match = /^(\d{4})(?:-(\d{2}))?/.exec(String(value ?? ''));
    if (!match) return null;
    return { year: Number(match[1]), month: match[2] ? Number(match[2]) : null };
  }

  function normaliseTalk(talk) {
    return {
      title: talk.title,
      url: talk.detailUrl || talk.videoUrl || talk.repoUrl,
      source: talk.event,
      description: talk.description,
      tags: talk.tags,
      date: talk.year,
      image: talk.image,
      imageFit: talk.imageFit,
      videoUrl: talk.videoUrl
    };
  }

  function normaliseWriting(post) {
    return {
      title: post.title,
      url: post.url,
      source: post.platform,
      description: post.excerpt,
      tags: post.tags,
      date: post.date,
      image: post.image,
      imageFit: post.imageFit
    };
  }

  function normaliseLearning(item) {
    return {
      title: item.title,
      url: item.url,
      source: item.meta,
      description: item.description,
      tags: item.tags,
      date: item.date,
      image: item.image,
      imageFit: item.imageFit,
      videoUrl: item.videoUrl
    };
  }

  function normaliseProject(project) {
    if (project.inCollection === false) return null;
    return {
      title: project.title,
      url: project.url,
      source: 'Code and resources',
      description: project.description,
      tags: project.tags,
      date: project.date,
      image: project.image,
      imageFit: project.imageFit
    };
  }

  function normalisePress(data) {
    const awards = (data.awards || []).map(award => ({
      title: award.title,
      url: award.url,
      source: award.organisation,
      label: 'Award',
      description: award.description,
      tags: null,
      date: award.year,
      image: award.image,
      imageFit: award.imageFit,
    }));

    const media = (data.media || []).map(item => ({
      title: item.title,
      url: item.url,
      source: item.outlet,
      label: item.type || 'Media',
      description: item.description,
      tags: null,
      date: item.date,
      image: item.image,
      imageFit: item.imageFit,
      videoUrl: item.videoUrl
    }));

    return [...awards, ...media];
  }

  function buildEntries(source, data) {
    const raw = Array.isArray(data) ? data.map(source.normalise) : source.normalise(data);
    return raw
      .filter(Boolean)
      .map(entry => {
        const parsed = parseDate(entry.date);
        if (!parsed) return null;
        return {
          ...entry,
          type: source.type,
          label: entry.label || source.label,
          year: parsed.year,
          month: parsed.month,
          sortKey: parsed.year * 100 + (parsed.month || 0)
        };
      })
      .filter(Boolean);
  }

  function renderThumbnail(entry) {
    const videoThumb = getYouTubeThumbnail(entry.videoUrl);
    const src = entry.image || videoThumb;
    const isVideo = Boolean(videoThumb) && !entry.image;
    const linkUrl = entry.videoUrl || entry.url;
    const external = isExternal(linkUrl);
    const linkAttrs = external ? ' target="_blank" rel="noopener"' : '';

    const inner = src
      ? `<img src="${escapeHtml(src)}" alt="" loading="lazy">${isVideo ? '<span class="collection-entry__play" aria-hidden="true">▶</span>' : ''}`
      : `<strong aria-hidden="true">${escapeHtml(GLYPHS[entry.type] || '•')}</strong>`;

    const classes = [
      'collection-entry__thumb',
      src ? '' : 'collection-entry__thumb--graphic',
      entry.imageFit?.startsWith('contain') ? 'collection-entry__thumb--contain' : '',
      entry.imageFit === 'contain-dark' ? 'collection-entry__thumb--dark' : ''
    ].filter(Boolean).join(' ');

    return linkUrl
      ? `<a class="${classes}" href="${escapeHtml(linkUrl)}"${linkAttrs} tabindex="-1" aria-hidden="true">${inner}</a>`
      : `<div class="${classes}" aria-hidden="true">${inner}</div>`;
  }

  function renderEntry(entry) {
    const when = entry.month ? `${MONTHS[entry.month - 1]} ${entry.year}` : String(entry.year);
    const external = isExternal(entry.url);
    const linkAttrs = external ? ' target="_blank" rel="noopener"' : '';
    const title = entry.type === 'accolades' && entry.source
      ? `${headingText(entry.title)} - ${escapeHtml(entry.source)}`
      : headingText(entry.title);

    return `
      <li class="collection-entry" data-type="${entry.type}">
        <div class="collection-entry__aside">
          <div class="collection-entry__meta">
            <span class="tag collection-entry__kind">${escapeHtml(entry.label)}</span>
            <span class="collection-entry__date">${escapeHtml(when)}</span>
          </div>
          ${renderThumbnail(entry)}
        </div>
        <div class="collection-entry__body">
          <h3 class="collection-entry__title">
            ${entry.url
              ? `<a href="${escapeHtml(entry.url)}"${linkAttrs}>${title}${external ? ' <span aria-hidden="true">↗</span>' : ''}</a>`
              : title}
          </h3>
          ${entry.source && entry.type !== 'accolades' ? `<p class="collection-entry__source">${escapeHtml(entry.source)}</p>` : ''}
          ${entry.description ? `<p class="collection-entry__description">${escapeHtml(entry.description)}</p>` : ''}
          ${(entry.tags || []).length
            ? `<div class="card__tags">${entry.tags.map(tag => `<span class="tag tag--secondary">${escapeHtml(tag)}</span>`).join('')}</div>`
            : ''}
        </div>
      </li>`;
  }

  function render(container, entries) {
    if (!entries.length) {
      container.innerHTML = '<div class="empty-state"><p>Nothing in this category yet.</p></div>';
      return;
    }

    const years = [...new Set(entries.map(entry => entry.year))];

    container.innerHTML = years.map(year => {
      const forYear = entries.filter(entry => entry.year === year);
      return `
        <section class="collection-year" aria-labelledby="year-${year}">
          <h2 class="collection-year__heading" id="year-${year}">
            ${year}
            <span class="collection-year__count">${forYear.length} ${forYear.length === 1 ? 'item' : 'items'}</span>
          </h2>
          <ul class="collection-list">${forYear.map(renderEntry).join('')}</ul>
        </section>`;
    }).join('');
  }

  function setupFilters(filters, container, entries, countEl) {
    filters.addEventListener('click', event => {
      const button = event.target.closest('.filter-btn');
      if (!button) return;

      filters.querySelectorAll('.filter-btn').forEach(candidate => {
        const isActive = candidate === button;
        candidate.classList.toggle('filter-btn--active', isActive);
        candidate.setAttribute('aria-pressed', String(isActive));
      });

      const filter = button.dataset.filter;
      const visible = filter === 'all' ? entries : entries.filter(entry => entry.type === filter);
      render(container, visible);
      updateCount(countEl, visible);
    });
  }

  function updateCount(countEl, entries) {
    if (!countEl) return;
    if (!entries.length) {
      countEl.textContent = 'No items in this category yet.';
      return;
    }
    const years = new Set(entries.map(entry => entry.year));
    const oldest = Math.min(...years);
    const newest = Math.max(...years);
    const span = oldest === newest ? `in ${newest}` : `between ${oldest} and ${newest}`;
    countEl.textContent = `${entries.length} ${entries.length === 1 ? 'item' : 'items'}, ${span}.`;
  }

  async function renderCollection() {
    const container = document.getElementById('collection-timeline');
    if (!container) return;

    const filters = document.getElementById('collection-filters');
    const countEl = document.getElementById('collection-count');

    try {
      const results = await Promise.all(SOURCES.map(async source => {
        const response = await fetch(source.url);
        if (!response.ok) throw new Error(`Failed to load ${source.url}`);
        return buildEntries(source, await response.json());
      }));

      const entries = results.flat().sort((a, b) => b.sortKey - a.sortKey || a.title.localeCompare(b.title));

      render(container, entries);
      updateCount(countEl, entries);
      if (filters) setupFilters(filters, container, entries, countEl);
    } catch (error) {
      console.error('Error loading the collection:', error);
      container.innerHTML = '<div class="empty-state"><p>Unable to load the full collection right now.</p></div>';
    }
  }

  document.addEventListener('partialsLoaded', renderCollection);
})();
