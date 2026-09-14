/**
 * Ritesh Singh — Developer Portfolio Client
 * Live synchronized with Node.js & SQLite REST API
 */

const state = {
  data: null,
  activeFilter: 'all',
  activeProject: null,
  audio: new Audio(),
  currentTrackIndex: 0,
  isPlaying: false
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ==========================================================================
   Data Fetching & Live Sync
   ========================================================================== */
async function fetchPortfolioData() {
  try {
    const res = await fetch('/api/portfolio');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.data = await res.json();
  } catch (err) {
    console.error('Failed to fetch from backend API:', err);
  }
}

/* ==========================================================================
   Theme Management
   ========================================================================== */
function initTheme() {
  let theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.dataset.theme = theme;
  const toggleBtn = $('#themeToggle');
  if (toggleBtn) {
    toggleBtn.textContent = theme === 'dark' ? '☼' : '☾';
    toggleBtn.addEventListener('click', () => {
      theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = theme;
      localStorage.setItem('theme', theme);
      toggleBtn.textContent = theme === 'dark' ? '☼' : '☾';
    });
  }
}

/* ==========================================================================
   DOM Renderers
   ========================================================================== */
function renderProfile() {
  if (!state.data?.profile) return;
  const p = state.data.profile;

  $$('.user-name').forEach(el => el.textContent = p.name);
  $$('.user-role').forEach(el => el.textContent = p.role);
  $$('.user-email').forEach(el => {
    el.textContent = p.email;
    if (el.tagName === 'A') el.href = `mailto:${p.email}`;
  });
  $$('.user-phone').forEach(el => {
    el.textContent = p.phone;
    if (el.tagName === 'A') el.href = `tel:${p.phone.replace(/[^0-9+]/g, '')}`;
  });

  const headline = $('#heroHeadline');
  if (headline && p.headline) headline.textContent = p.headline;

  const statusPill = $('#heroStatusPill');
  if (statusPill && p.status_badge) statusPill.textContent = p.status_badge;

  const bio = $('#aboutPrimaryBio');
  if (bio && p.bio) bio.textContent = p.bio;

  const subBio = $('#aboutSubBio');
  if (subBio && p.sub_bio) subBio.textContent = p.sub_bio;

  const githubLink = $('#githubProfileLink');
  if (githubLink && p.github) githubLink.href = p.github;
}

function renderSkills() {
  const grid = $('#skillsGrid');
  if (!grid || !state.data?.skills) return;

  const skills = state.data.skills;
  grid.innerHTML = skills.map(s => `
    <div class="skill-card">
      <div class="skill-top">
        <span class="skill-cat">${escapeHtml(s.category)}</span>
        <span class="skill-prof">${escapeHtml(s.proficiency || 'Advanced')}</span>
      </div>
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.description || '')}</p>
    </div>
  `).join('');
}

function matchesFilter(p, filter) {
  if (filter === 'all') return true;
  const cat = (p.category || '').toLowerCase();
  const tech = (p.tech || []).join(' ').toLowerCase();
  const title = (p.title || '').toLowerCase();

  if (filter === 'web') return cat.includes('web') || tech.includes('html') || tech.includes('react') || title.includes('webza');
  if (filter === 'agency') return cat.includes('agency') || cat.includes('startup') || cat.includes('marketing') || cat.includes('business');
  if (filter === 'apps') return cat.includes('mobile') || cat.includes('marketplace') || cat.includes('app') || cat.includes('fintech');
  if (filter === 'media') return cat.includes('media') || cat.includes('content') || cat.includes('video') || title.includes('youtube');
  return true;
}

function renderProjects() {
  const grid = $('#projectsGrid');
  if (!grid || !state.data?.projects) return;

  const filtered = state.data.projects.filter(p => matchesFilter(p, state.activeFilter));

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:40px;">No projects found in this category.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const statusType = escapeHtml(p.status_type || 'concept');
    const demo = p.demo_url ? `<a class="action-link" href="${escapeHtml(p.demo_url)}" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>` : '';
    const code = p.github_url ? `<a class="action-link" href="${escapeHtml(p.github_url)}" target="_blank" rel="noopener noreferrer">Code ↗</a>` : '';
    const download = p.download_url ? `<a class="action-link" href="${escapeHtml(p.download_url)}"${p.download_url.startsWith('assets/') ? ' download' : ' target="_blank" rel="noopener noreferrer"'}>${escapeHtml(p.download_label || 'Download')} ↓</a>` : '';
    const techPills = (p.tech || []).slice(0, 4).map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('');

    return `
      <article class="project-card">
        <div class="project-thumb">
          <img src="${escapeHtml(p.image || 'assets/images/webza.svg')}" alt="${escapeHtml(p.title)}" loading="lazy">
        </div>
        <div class="project-body">
          <div class="project-header-row">
            <h3>${escapeHtml(p.title)}</h3>
            <span class="status-pill ${statusType}">${escapeHtml(p.status)}</span>
          </div>
          <p class="project-desc">${escapeHtml(p.description)}</p>
          <div class="project-tech">${techPills}</div>
          <div class="project-actions">
            ${demo}
            ${code}
            ${download}
            <button class="action-link" type="button" onclick="openProjectModal('${escapeHtml(p.id)}')" style="margin-left:auto; color:var(--cyan);">Inspect ↗</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderResume() {
  if (!state.data?.resume) return;
  const r = state.data.resume;
  $$('.resume-download-link').forEach(link => {
    link.href = r.url;
    link.setAttribute('download', r.filename || 'Ritesh-Singh-Resume.pdf');
  });
  const updated = $('#resumeLastUpdated');
  if (updated) updated.textContent = r.last_updated || 'September 2026';
}

/* ==========================================================================
   Project Modal Dialog
   ========================================================================== */
function openProjectModal(id) {
  const project = state.data?.projects?.find(p => p.id === id);
  const modal = $('#projectModal');
  if (!project || !modal) return;

  $('#modalCategory').textContent = project.category;
  $('#modalTitle').textContent = project.title;
  $('#modalDescription').textContent = project.description;

  const media = $('#modalMedia');
  if (project.video_url) {
    media.innerHTML = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:6px;border:1px solid var(--border);"><iframe src="${escapeHtml(project.video_url)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
  } else {
    media.innerHTML = `<img src="${escapeHtml(project.image || 'assets/images/webza.svg')}" style="width:100%; max-height:380px; object-fit:cover; border-radius:6px; border:1px solid var(--border);" alt="Preview">`;
  }

  $('#modalTech').innerHTML = (project.tech || []).map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('');
  $('#modalFeatures').innerHTML = (project.features || []).map(f => `<li>${escapeHtml(f)}</li>`).join('');
  $('#modalAiRole').textContent = project.details || project.description;
  $('#modalImpact').textContent = project.learning_outcome || 'Real-world project engineering and system study.';

  const demo = $('#modalDemo');
  const code = $('#modalCode');
  const dl = $('#modalDl');

  if (project.demo_url) { demo.style.display = 'inline-flex'; demo.href = project.demo_url; }
  else { demo.style.display = 'none'; }

  if (project.github_url) { code.style.display = 'inline-flex'; code.href = project.github_url; }
  else { code.style.display = 'none'; }

  if (project.download_url) {
    dl.style.display = 'inline-flex';
    dl.href = project.download_url;
    dl.innerHTML = `${escapeHtml(project.download_label || 'Download')} ↓`;
    if (project.download_url.startsWith('assets/')) {
      dl.setAttribute('download', '');
      dl.removeAttribute('target');
    } else {
      dl.removeAttribute('download');
      dl.setAttribute('target', '_blank');
    }
  } else {
    dl.style.display = 'none';
  }

  if (typeof modal.showModal === 'function') modal.showModal();
  else modal.setAttribute('open', '');
  document.body.classList.add('modal-open');
}

function closeProjectModal() {
  const modal = $('#projectModal');
  if (!modal) return;
  if (typeof modal.close === 'function') modal.close();
  else modal.removeAttribute('open');
  document.body.classList.remove('modal-open');
}

/* ==========================================================================
   Music Player Controller
   ========================================================================== */
function initMusicPlayer() {
  const tracks = state.data?.music || [];
  if (!tracks.length) return;

  const audio = state.audio;
  const playBtn = $('#playBtn');
  const scrubberFill = $('#scrubberFill');
  const scrubberBar = $('#scrubberBar');
  const curTimeEl = $('#curTime');
  const durTimeEl = $('#durTime');
  const trackTitle = $('#playerTrackTitle');
  const trackArtist = $('#playerTrackArtist');
  const trackArtwork = $('#playerArtwork');
  const list = $('#trackList');

  function loadTrack(index) {
    if (!tracks[index]) return;
    state.currentTrackIndex = index;
    const t = tracks[index];
    audio.src = t.audio_url;
    if (trackTitle) trackTitle.textContent = t.title;
    if (trackArtist) trackArtist.textContent = `${t.artist} · ${t.genre}`;
    if (trackArtwork) trackArtwork.src = t.artwork || 'assets/images/track-chill.svg';
    if (durTimeEl) durTimeEl.textContent = t.duration || '0:10';
    if (scrubberFill) scrubberFill.style.width = '0%';
    if (curTimeEl) curTimeEl.textContent = '0:00';

    $$('.track-row').forEach((row, i) => {
      row.classList.toggle('active', i === index);
    });
  }

  function togglePlay() {
    if (!audio.src) loadTrack(state.currentTrackIndex);
    if (audio.paused) {
      audio.play().then(() => {
        state.isPlaying = true;
        if (playBtn) playBtn.textContent = '❚❚';
      }).catch(err => console.log('Audio autoplay prevented:', err));
    } else {
      audio.pause();
      state.isPlaying = false;
      if (playBtn) playBtn.textContent = '▶';
    }
  }

  function fmt(secs) {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (scrubberFill) scrubberFill.style.width = `${pct}%`;
    if (curTimeEl) curTimeEl.textContent = fmt(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    if (durTimeEl) durTimeEl.textContent = fmt(audio.duration);
  });

  audio.addEventListener('ended', () => {
    state.currentTrackIndex = (state.currentTrackIndex + 1) % tracks.length;
    loadTrack(state.currentTrackIndex);
    audio.play();
  });

  playBtn?.addEventListener('click', togglePlay);

  scrubberBar?.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = scrubberBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pos * audio.duration;
  });

  if (list) {
    list.innerHTML = tracks.map((t, i) => `
      <div class="track-row ${i === 0 ? 'active' : ''}" data-index="${i}">
        <div class="track-row-left">
          <span class="track-index">${String(i + 1).padStart(2, '0')}</span>
          <div>
            <h4 style="font-size:14.5px; font-weight:600;">${escapeHtml(t.title)}</h4>
            <span style="font-size:12px; color:var(--text-muted);">${escapeHtml(t.genre)}</span>
          </div>
        </div>
        <div style="font-family:var(--font-mono); font-size:12px; color:var(--text-dim);">
          ${escapeHtml(t.duration || '0:10')}
        </div>
      </div>
    `).join('');

    list.addEventListener('click', (e) => {
      const row = e.target.closest('.track-row');
      if (!row) return;
      const idx = Number(row.dataset.index);
      if (idx === state.currentTrackIndex) {
        togglePlay();
      } else {
        loadTrack(idx);
        audio.play().then(() => {
          state.isPlaying = true;
          if (playBtn) playBtn.textContent = '❚❚';
        });
      }
    });
  }

  loadTrack(0);
}

/* ==========================================================================
   Contact Form (Real Backend Integration)
   ========================================================================== */
function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const nameInput = $('#contactName');
  const emailInput = $('#contactEmail');
  const msgInput = $('#contactMessage');
  const submitBtn = $('#contactSubmitBtn');
  const alertBox = $('#contactSuccessAlert');
  const errorBox = $('#contactErrorAlert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (alertBox) alertBox.hidden = true;
    if (errorBox) errorBox.hidden = true;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Delivering message…';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          message: msgInput.value.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');

      form.reset();
      if (alertBox) {
        alertBox.textContent = 'Thank you! Your message has been saved to the database and sent to Ritesh.';
        alertBox.hidden = false;
      }
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message;
        errorBox.hidden = false;
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message →';
    }
  });
}

/* ==========================================================================
   Filter Buttons & Events
   ========================================================================== */
function initFilters() {
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeFilter = btn.dataset.filter;
      renderProjects();
    });
  });

  $('#modalClose')?.addEventListener('click', closeProjectModal);
  $('#projectModal')?.addEventListener('click', (e) => {
    if (e.target === $('#projectModal')) closeProjectModal();
  });
}

// Global Startup
async function init() {
  initTheme();
  await fetchPortfolioData();
  renderProfile();
  renderSkills();
  renderProjects();
  renderResume();
  initMusicPlayer();
  initContactForm();
  initFilters();

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', init);
