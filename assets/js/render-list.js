/**
 * Render List - Client-side rendering for JSON data
 * Renders talks, writing, projects, and press from JSON files
 */

function formatHeadingText(text) {
  return String(text).replace(/&/g, '<span class="heading-amp">&amp;</span>');
}

function renderRelatedLinks(links) {
  return (links || []).map(link => {
    const isExternal = /^https?:\/\//.test(link.url);
    const attributes = isExternal ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${link.url}"${attributes} class="btn btn--outline">${link.label} ${isExternal ? '↗' : '→'}</a>`;
  }).join('');
}

function renderCompactRelatedLinks(links, className) {
  return (links || []).map(link => {
    const isExternal = /^https?:\/\//.test(link.url);
    const attributes = isExternal ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${link.url}"${attributes} class="${className}">${link.label} ${isExternal ? '↗' : '→'}</a>`;
  }).join('');
}

/**
 * Render talks from data/talks.json
 */
async function renderTalks() {
  const grid = document.getElementById('talks-grid');
  const filters = document.getElementById('talk-filters');
  
  if (!grid) return;
  
  try {
    const response = await fetch('/data/talks.json?v=10');
    const talks = await response.json();
    
    // Sort by year descending
    talks.sort((a, b) => b.year - a.year);
    
    // Initial render
    renderTalkCards(grid, talks);
    
    // Setup filters
    if (filters) {
      filters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
          // Update active state
          filters.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('filter-btn--active');
            btn.setAttribute('aria-pressed', 'false');
          });
          e.target.classList.add('filter-btn--active');
          e.target.setAttribute('aria-pressed', 'true');
          
          const filter = e.target.dataset.filter;
          const filterTags = (e.target.dataset.tags || '').split(',').filter(Boolean);
          const filtered = filter === 'all'
            ? talks
            : talks.filter(talk => (talk.tags || []).some(tag => filterTags.includes(tag)));
          
          renderTalkCards(grid, filtered);
        }
      });
    }
  } catch (error) {
    console.error('Error loading talks:', error);
    grid.innerHTML = '<p class="text-center text-muted" style="grid-column: 1 / -1;">Unable to load talks.</p>';
  }
}

/**
 * Extract YouTube video ID from various URL formats
 */
function getYouTubeVideoId(url) {
  if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) return null;
  
  // Match various YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Get YouTube thumbnail URL from video ID
 */
function getYouTubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function renderTalkCards(container, talks) {
  if (talks.length === 0) {
    container.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;"><p>No talks found.</p></div>';
    return;
  }
  
  container.innerHTML = talks.map(talk => {
    const videoId = getYouTubeVideoId(talk.videoUrl);
    const thumbnail = videoId ? getYouTubeThumbnail(videoId) : null;
    
    return `
    <div class="card card--media talk-card">
      ${thumbnail ? `
        <a href="${talk.videoUrl}" target="_blank" rel="noopener" class="card__thumbnail">
          <img src="${thumbnail}" alt="${talk.title}" loading="lazy">
          <span class="card__play-icon">▶</span>
        </a>
      ` : ''}
      <div class="card__body talk-card__body">
        <div class="card__meta">
          <span class="tag">${talk.year}</span>
          <span>${talk.event}</span>
        </div>
        <h3 class="card__title">
          ${talk.detailUrl
            ? `<a href="${talk.detailUrl}">${formatHeadingText(talk.title)}</a>`
            : talk.videoUrl
              ? `<a href="${talk.videoUrl}" target="_blank" rel="noopener">${formatHeadingText(talk.title)}</a>`
              : formatHeadingText(talk.title)}
        </h3>
        <p class="card__excerpt">${talk.description || ''}</p>
        <div class="card__tags">
          ${(talk.tags || []).map(tag => `<span class="tag tag--secondary">${tag}</span>`).join('')}
        </div>
        ${(talk.videoUrl || talk.eventUrl || talk.repoUrl || talk.blogUrl) ? `
          <div class="talk-card__actions">
            ${(talk.eventUrl || talk.repoUrl || talk.blogUrl) ? `
              <div class="talk-card__resources">
                <span class="talk-card__resources-label">Related resources</span>
                <div class="talk-card__resource-links">
                  ${talk.eventUrl ? `<a href="${talk.eventUrl}" target="_blank" rel="noopener" class="talk-card__resource-link">Event page ↗</a>` : ''}
                  ${talk.repoUrl ? `<a href="${talk.repoUrl}" target="_blank" rel="noopener" class="talk-card__resource-link">Project ↗</a>` : ''}
                  ${talk.blogUrl ? `<a href="${talk.blogUrl}" target="_blank" rel="noopener" class="talk-card__resource-link">Article ↗</a>` : ''}
                </div>
              </div>
            ` : ''}
            ${talk.videoUrl ? `
              <a href="${talk.videoUrl}" target="_blank" rel="noopener" class="btn btn--primary talk-card__watch">
                <span aria-hidden="true">▶</span> Watch recording
              </a>
            ` : ''}
          </div>
        ` : ''}
      </div>
    </div>
  `}).join('');
}

/**
 * Render writing from data/writing.json
 */
async function renderWriting() {
  const grid = document.getElementById('writing-grid');
  const filters = document.getElementById('writing-filters');
  
  if (!grid) return;
  
  try {
    const response = await fetch('/data/writing.json?v=16');
    const articles = await response.json();
    
    // Sort by date descending
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Initial render
    renderWritingCards(grid, articles);
    
    // Setup filters
    if (filters) {
      filters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
          filters.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('filter-btn--active');
            btn.setAttribute('aria-pressed', 'false');
          });
          e.target.classList.add('filter-btn--active');
          e.target.setAttribute('aria-pressed', 'true');
          
          const filter = e.target.dataset.filter;
          const filterTags = (e.target.dataset.tags || '').split(',').filter(Boolean);
          const filtered = filter === 'all'
            ? articles
            : articles.filter(article => (article.tags || []).some(tag => filterTags.includes(tag)));
          
          renderWritingCards(grid, filtered);
        }
      });
    }
  } catch (error) {
    console.error('Error loading writing:', error);
    grid.innerHTML = '<p class="text-center text-muted" style="grid-column: 1 / -1;">Unable to load articles.</p>';
  }
}

function renderWritingCards(container, articles) {
  if (articles.length === 0) {
    container.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;"><p>No articles found.</p></div>';
    return;
  }
  
  container.innerHTML = articles.map(article => {
    const date = new Date(article.date);
    const dateStr = date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' });
    const platformClass = article.platform === 'dev.to' ? 'tag--secondary' : 
                          article.platform === 'Medium' ? 'tag--accent' : 'tag';
    
    return `
      <div class="card${article.image ? ' card--media' : ''}">
        ${article.image ? `
          <a href="${article.url}" target="_blank" rel="noopener" class="card__thumbnail${article.imageFit?.startsWith('contain') ? ' card__thumbnail--contain' : ''}${article.imageFit === 'contain-dark' ? ' card__thumbnail--dark' : ''}">
            <img src="${article.image}" alt="${article.imageAlt || ''}" loading="lazy">
          </a>
          ${article.imageCredit && article.imageCreditUrl
            ? `<p class="card__image-credit">Image by <a href="${article.imageCreditUrl}" target="_blank" rel="noopener">${article.imageCredit}</a> on Pixabay</p>`
            : ''}
        ` : ''}
        <div class="card__body">
          <div class="card__meta">
            <span class="tag ${platformClass}">${article.platform}</span>
            <span>${dateStr}</span>
          </div>
          <h3 class="card__title">
            <a href="${article.url}" target="_blank" rel="noopener">${formatHeadingText(article.title)}</a>
          </h3>
          ${article.excerpt ? `<p class="card__excerpt">${article.excerpt}</p>` : ''}
          <div class="card__tags">
            ${(article.tags || []).map(tag => `<span class="tag tag--secondary">${tag}</span>`).join('')}
          </div>
          ${article.relatedLinks?.length ? `
            <div class="flex flex-wrap gap-3 mt-4">
              ${renderRelatedLinks(article.relatedLinks)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render projects from data/projects.json
 */
async function renderProjects() {
  const grid = document.getElementById('projects-grid');
  
  if (!grid) return;
  
  try {
    const response = await fetch('/data/projects.json?v=7');
    const projects = await response.json();
    
    if (projects.length === 0) {
      grid.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;"><p>No projects found.</p></div>';
      return;
    }
    
    grid.innerHTML = projects.map(project => `
      <div class="card project-card${project.image ? ' card--media' : ''}">
        ${project.image ? `
          <a href="${project.url}" ${project.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} class="card__thumbnail${project.imageFit?.startsWith('contain') ? ' card__thumbnail--contain' : ''}${project.imageFit === 'contain-dark' ? ' card__thumbnail--dark' : ''}">
            <img src="${project.image}" alt="${project.title} project on GitHub" loading="lazy">
          </a>
        ` : ''}
        <div class="card__body project-card__body">
          <h3 class="card__title">
            <a href="${project.url}" target="_blank" rel="noopener">${formatHeadingText(project.title)}</a>
          </h3>
          <p class="card__excerpt">${project.description}</p>
          <div class="project-guidance">
            <div>
              <span class="project-guidance__label">For</span>
              <span class="tag tag--accent">${project.audience}</span>
            </div>
            <div>
              <span class="project-guidance__label">Skills</span>
              <div class="card__tags">
                ${(project.skills || []).map(skill => `<span class="tag tag--secondary">${skill}</span>`).join('')}
              </div>
            </div>
            <p><strong>Before you start:</strong> ${project.prerequisites}</p>
          </div>
          <div class="project-card__actions">
            ${(project.videoUrl || project.relatedLinks?.length) ? `
              <div class="project-card__resources">
                <span class="project-card__resources-label">Related resources</span>
                <div class="project-card__resource-links">
                  ${project.videoUrl ? `<a href="${project.videoUrl}" target="_blank" rel="noopener" class="project-card__resource-link">Recording ↗</a>` : ''}
                  ${renderCompactRelatedLinks(project.relatedLinks, 'project-card__resource-link')}
                </div>
              </div>
            ` : ''}
            <a href="${project.url}" ${project.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} class="btn btn--primary project-card__primary">${project.linkLabel || 'View project'} ${project.url.startsWith('http') ? '↗' : '→'}</a>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading projects:', error);
    grid.innerHTML = '<p class="text-center text-muted" style="grid-column: 1 / -1;">Unable to load projects.</p>';
  }
}

/**
 * Render press/awards from data/press.json
 */
async function renderPress() {
  const awardsGrid = document.getElementById('awards-grid');
  const mediaGrid = document.getElementById('media-grid');
  
  try {
    const response = await fetch('/data/press.json?v=7');
    const data = await response.json();
    
    // Render awards
    if (awardsGrid && data.awards) {
      awardsGrid.innerHTML = data.awards.map(award => `
        <div class="card${award.image ? ' card--media' : ''}">
          ${award.image ? `
            ${award.url ? `<a href="${award.url}" target="_blank" rel="noopener" class="card__thumbnail${award.imageFit?.startsWith('contain') ? ' card__thumbnail--contain' : ''}${award.imageFit === 'contain-dark' ? ' card__thumbnail--dark' : ''}">` : '<div class="card__thumbnail">'}
              <img src="${award.image}" alt="${award.imageAlt || award.title}" loading="lazy">
            ${award.url ? '</a>' : '</div>'}
          ` : ''}
          <div class="card__body">
            <span class="badge">${award.year}</span>
            <h3 class="card__title mt-4">${formatHeadingText(award.title)} - ${formatHeadingText(award.organisation)}</h3>
            ${award.description ? `<p class="card__excerpt mt-4">${award.description}</p>` : ''}
            ${award.url ? `<a href="${award.url}" target="_blank" rel="noopener" class="btn btn--ghost mt-4">Learn More →</a>` : ''}
          </div>
        </div>
      `).join('');
    }
    
    // Render media
    if (mediaGrid && data.media) {
      mediaGrid.innerHTML = data.media.map(item => `
        <div class="card${item.image ? ' card--media' : ''}">
          ${item.image ? `
            ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener" class="card__thumbnail${item.imageFit?.startsWith('contain') ? ' card__thumbnail--contain' : ''}${item.imageFit === 'contain-dark' ? ' card__thumbnail--dark' : ''}">` : '<div class="card__thumbnail">'}
              <img src="${item.image}" alt="${item.imageAlt || item.title}" loading="lazy">
            ${item.url ? '</a>' : '</div>'}
          ` : ''}
          <div class="card__body">
            <span class="tag">${item.type}</span>
            <h3 class="card__title mt-4">
              ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener">${formatHeadingText(item.title)} - ${formatHeadingText(item.outlet)}</a>` : `${formatHeadingText(item.title)} - ${formatHeadingText(item.outlet)}`}
            </h3>
            ${item.date ? `<p class="text-muted">${item.date}</p>` : ''}
            ${item.description ? `<p class="card__excerpt mt-4">${item.description}</p>` : ''}
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading press:', error);
    if (awardsGrid) awardsGrid.innerHTML = '<p class="text-center text-muted" style="grid-column: 1 / -1;">Unable to load awards.</p>';
    if (mediaGrid) mediaGrid.innerHTML = '<p class="text-center text-muted" style="grid-column: 1 / -1;">Unable to load media.</p>';
  }
}
