/**
 * Ritesh Singh — Creative Developer & Student Builder Portfolio
 * Complete Interactive Controller, Dynamic CMS, Audio Player & Admin Portal
 */

// Global Application State
const app = {
  data: null,
  activeFilter: 'all',
  activeProject: null,
  audio: new Audio(),
  currentTrackIndex: 0,
  isPlaying: false,
  isAdminLoggedIn: false,
  passcode: 'ritesh2026'
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
   Data Layer & Persistence
   ========================================================================== */
async function loadSiteData() {
  try {
    const local = localStorage.getItem('ritesh_portfolio_data');
    if (local) {
      app.data = JSON.parse(local);
      return;
    }
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }

  try {
    const res = await fetch('data/site-data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    app.data = await res.json();
  } catch (err) {
    console.warn('Using fallback data:', err);
    // Minimal safety fallback
    app.data = {
      profile: {
        name: "Ritesh Singh",
        role: "Student, Creator & Digital Builder",
        email: "Riteshsingh02010@gmail.com",
        phone: "+91 7898195460",
        bio: "Student exploring technology, AI, web development, digital business, and content creation."
      },
      projects: [],
      tools: [],
      music: [],
      resume: { url: "assets/Ritesh-Singh-Resume.pdf", title: "Ritesh Singh - Resume" }
    };
  }
}

function saveSiteData() {
  try {
    localStorage.setItem('ritesh_portfolio_data', JSON.stringify(app.data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

/* ==========================================================================
   Theme Controller
   ========================================================================== */
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('ritesh-theme', theme); } catch (_) {}
  const icon = $('#themeToggle span');
  const btn = $('#themeToggle');
  const isDark = theme === 'dark';
  if (icon) icon.textContent = isDark ? '☼' : '☾';
  btn?.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
}

function initTheme() {
  let stored;
  try { stored = localStorage.getItem('ritesh-theme'); } catch (_) {}
  setTheme(['light', 'dark'].includes(stored) ? stored : 'dark');
  $('#themeToggle')?.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

/* ==========================================================================
   Navigation & Mobile Drawer
   ========================================================================== */
function initNavigation() {
  const menuToggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
  if (!menuToggle || !mobileMenu) return;

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.style.display = isOpen ? 'none' : 'flex';
  });

  $$('#mobileMenu a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.style.display = 'none';
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   Projects Showcase & Filtering
   ========================================================================== */
function cardMarkup(project, index) {
  const num = String(index + 1).padStart(2, '0');
  const id = escapeHtml(project.id);
  const title = escapeHtml(project.title);
  const labelParts = (project.visualLabel || project.title).split(' / ').map(p => `<span>${escapeHtml(p)}</span>`).join(' / ');
  const status = escapeHtml(project.status || 'Concept');
  const statusType = escapeHtml(project.statusType || 'concept');
  const desc = escapeHtml(project.description);
  const techPills = (project.tech || []).slice(0, 3).map(t => escapeHtml(t)).join(' / ');
  const coverImg = project.image || 'assets/images/webza.svg';

  const demoLink = project.demoUrl
    ? `<a href="${escapeHtml(project.demoUrl)}" target="_blank" rel="noopener noreferrer">Demo ↗</a>`
    : '';
  const codeLink = project.githubUrl
    ? `<a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer">Code ↗</a>`
    : '';
  const downloadLink = project.downloadUrl
    ? `<a href="${escapeHtml(project.downloadUrl)}"${project.downloadUrl.startsWith('assets/') ? ' download' : ' target="_blank" rel="noopener noreferrer"'}>${escapeHtml(project.downloadLabel || 'Download')} ↓</a>`
    : '';

  const features = (project.features || []).slice(0, 3).map(f => `<li>${escapeHtml(f)}</li>`).join('');

  return `
    <article class="project-card reveal-pending" data-expanded="false" id="card-${id}">
      <button class="project-cover" type="button" data-project-id="${id}" aria-label="View details for ${title}">
        <img src="${escapeHtml(coverImg)}" alt="${title} cover" loading="lazy">
        <span class="cover-label">PROJECT / ${num}</span>
        <span class="cover-title">${labelParts}</span>
        <div class="cover-bottom">
          <span>${techPills}</span>
          <span aria-hidden="true">+</span>
        </div>
      </button>

      <div class="project-body">
        <div class="project-title-row">
          <h3>${title}</h3>
          <span class="status-badge ${statusType}">${status}</span>
        </div>

        <button class="project-expand-toggle" type="button" data-project-toggle="${id}" aria-expanded="false" aria-controls="panel-${id}">
          <span class="expand-label">About this project</span>
          <span class="expand-icon" aria-hidden="true">+</span>
        </button>

        <div class="project-expand-panel" id="panel-${id}" role="region" aria-hidden="true" inert>
          <div class="project-expand-clip">
            <div class="project-expand-content">
              <p>${desc}</p>
              ${features ? `<ul class="project-feature-list">${features}</ul>` : ''}
            </div>
          </div>
        </div>

        <div class="project-footer">
          <span class="project-category">${escapeHtml(project.category)}</span>
          <div class="project-actions">
            ${demoLink}
            ${codeLink}
            ${downloadLink}
            <button class="project-detail-link" type="button" data-project-id="${id}">Full details ↗</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function matchesFilter(project, filter) {
  if (filter === 'all') return true;
  const cat = (project.category || '').toLowerCase();
  const tech = (project.tech || []).join(' ').toLowerCase();
  const title = (project.title || '').toLowerCase();

  if (filter === 'web') return cat.includes('web') || tech.includes('html') || tech.includes('react') || title.includes('webza');
  if (filter === 'agency') return cat.includes('agency') || cat.includes('startup') || cat.includes('marketing') || cat.includes('business');
  if (filter === 'apps') return cat.includes('mobile') || cat.includes('marketplace') || cat.includes('app') || cat.includes('fintech');
  if (filter === 'media') return cat.includes('media') || cat.includes('content') || cat.includes('video') || title.includes('youtube');
  return true;
}

function renderProjects() {
  const grid = $('#projectGrid');
  const empty = $('#projectsEmpty');
  if (!grid || !app.data) return;

  const filtered = (app.data.projects || []).filter(p => matchesFilter(p, app.activeFilter));
  grid.innerHTML = filtered.map((p, i) => cardMarkup(p, i)).join('');
  if (empty) empty.hidden = filtered.length !== 0;

  observeElements(grid);
}

function setProjectExpanded(card, expanded) {
  const panel = card.querySelector('.project-expand-panel');
  card.dataset.expanded = String(expanded);
  card.querySelector('[data-project-toggle]')?.setAttribute('aria-expanded', String(expanded));
  const label = card.querySelector('.expand-label');
  if (label) label.textContent = expanded ? 'Close overview' : 'About this project';
  if (panel) {
    panel.inert = !expanded;
    panel.setAttribute('aria-hidden', String(!expanded));
  }
}

function toggleProjectCard(card) {
  const isExpanded = card.dataset.expanded === 'true';
  const grid = $('#projectGrid');
  if (!isExpanded && grid) {
    grid.querySelectorAll('.project-card[data-expanded="true"]').forEach(c => {
      if (c !== card) setProjectExpanded(c, false);
    });
  }
  setProjectExpanded(card, !isExpanded);
}

/* ==========================================================================
   Project Modal Viewer
   ========================================================================== */
function openProjectModal(id) {
  const project = (app.data.projects || []).find(p => p.id === id);
  const modal = $('#projectModal');
  if (!project || !modal) return;

  app.activeProject = project;

  $('#modalCategory').textContent = project.category;
  $('#modalTitle').textContent = project.title;
  $('#modalDescription').textContent = project.description;

  // Visual Media (Video or Image)
  const mediaWrap = $('.modal-media');
  if (project.videoUrl) {
    mediaWrap.innerHTML = `
      <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;border:1px solid var(--line);">
        <iframe src="${escapeHtml(project.videoUrl)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe>
      </div>
    `;
  } else {
    mediaWrap.innerHTML = `
      <img id="modalImage" src="${escapeHtml(project.image || 'assets/images/webza.svg')}" alt="${escapeHtml(project.title)} preview" loading="lazy">
    `;
  }

  // Tech tags
  $('#modalTech').innerHTML = (project.tech || []).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');

  // Features list
  $('#modalFeatures').innerHTML = (project.features || []).map(f => `<li>${escapeHtml(f)}</li>`).join('');

  // Learning / Details block
  $('#modalAiRole').textContent = project.details || project.description;
  $('#modalImpact').textContent = project.learningOutcome || 'Active student building and system testing.';

  // Actions
  const demoBtn = $('#modalDemo');
  const gitBtn = $('#modalGithub');
  const dlBtn = $('#modalDownload');

  if (project.demoUrl) {
    demoBtn.style.display = 'inline-flex';
    demoBtn.href = project.demoUrl;
  } else {
    demoBtn.style.display = 'none';
  }

  if (project.githubUrl) {
    gitBtn.style.display = 'inline-flex';
    gitBtn.href = project.githubUrl;
  } else {
    gitBtn.style.display = 'none';
  }

  if (project.downloadUrl) {
    dlBtn.style.display = 'inline-flex';
    dlBtn.href = project.downloadUrl;
    dlBtn.innerHTML = `${escapeHtml(project.downloadLabel || 'Download')} <span aria-hidden="true">↓</span>`;
    if (project.downloadUrl.startsWith('assets/')) {
      dlBtn.setAttribute('download', '');
      dlBtn.removeAttribute('target');
      dlBtn.removeAttribute('rel');
    } else {
      dlBtn.removeAttribute('download');
      dlBtn.setAttribute('target', '_blank');
      dlBtn.setAttribute('rel', 'noopener noreferrer');
    }
  } else {
    dlBtn.style.display = 'none';
  }

  // Collapsible Readme / Specs
  const readmeContent = $('#modalReadme');
  readmeContent.innerHTML = `
    <div class="readme-section">
      <h4>Project Classification & Status</h4>
      <p><strong>Status:</strong> ${escapeHtml(project.status || 'Concept')}</p>
      <p><strong>Category:</strong> ${escapeHtml(project.category || 'General')}</p>
      <p>${escapeHtml(project.details || '')}</p>
    </div>
  `;

  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }
  document.body.classList.add('modal-open');
  $('#modalClose')?.focus();
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
  const tracks = (app.data?.music || []).filter(t => t.visible !== false);
  if (!tracks.length) return;

  const audio = app.audio;
  const playBtn = $('#playerPlayBtn');
  const prevBtn = $('#playerPrevBtn');
  const nextBtn = $('#playerNextBtn');
  const progress = $('#playerProgress');
  const timelineBar = $('#playerTimelineBar');
  const timeCur = $('#playerTimeCur');
  const timeDur = $('#playerTimeDur');
  const trackTitle = $('#playerTrackTitle');
  const trackArtist = $('#playerTrackArtist');
  const trackArtwork = $('#playerArtwork');
  const playerCard = $('#musicPlayerCard');
  const trackList = $('#trackList');

  function loadTrack(index) {
    if (!tracks[index]) return;
    app.currentTrackIndex = index;
    const track = tracks[index];

    audio.src = track.audioUrl;
    if (trackTitle) trackTitle.textContent = track.title;
    if (trackArtist) trackArtist.textContent = `${track.artist} · ${track.genre}`;
    if (trackArtwork) trackArtwork.src = track.artwork || 'assets/images/track-chill.svg';
    if (timeDur) timeDur.textContent = track.duration || '0:00';
    if (progress) progress.style.width = '0%';
    if (timeCur) timeCur.textContent = '0:00';

    $$('.track-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
      const btn = item.querySelector('.track-play-btn');
      if (btn) btn.textContent = (i === index && app.isPlaying) ? '❚❚' : '▶';
    });
  }

  function togglePlay() {
    if (!audio.src) loadTrack(app.currentTrackIndex);
    if (audio.paused) {
      audio.play().then(() => {
        app.isPlaying = true;
        if (playBtn) playBtn.textContent = '❚❚';
        playerCard?.classList.add('is-playing');
        updateTrackButtons();
      }).catch(err => console.log('Audio playback permission:', err));
    } else {
      audio.pause();
      app.isPlaying = false;
      if (playBtn) playBtn.textContent = '▶';
      playerCard?.classList.remove('is-playing');
      updateTrackButtons();
    }
  }

  function updateTrackButtons() {
    $$('.track-item').forEach((item, i) => {
      const btn = item.querySelector('.track-play-btn');
      if (btn) btn.textContent = (i === app.currentTrackIndex && app.isPlaying) ? '❚❚' : '▶';
    });
  }

  function formatTime(secs) {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (progress) progress.style.width = `${pct}%`;
    if (timeCur) timeCur.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    if (timeDur) timeDur.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    app.currentTrackIndex = (app.currentTrackIndex + 1) % tracks.length;
    loadTrack(app.currentTrackIndex);
    audio.play();
  });

  playBtn?.addEventListener('click', togglePlay);

  prevBtn?.addEventListener('click', () => {
    app.currentTrackIndex = (app.currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(app.currentTrackIndex);
    if (app.isPlaying) audio.play();
  });

  nextBtn?.addEventListener('click', () => {
    app.currentTrackIndex = (app.currentTrackIndex + 1) % tracks.length;
    loadTrack(app.currentTrackIndex);
    if (app.isPlaying) audio.play();
  });

  timelineBar?.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = timelineBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pos * audio.duration;
  });

  // Render Track List
  if (trackList) {
    trackList.innerHTML = tracks.map((track, i) => `
      <div class="track-item ${i === 0 ? 'active' : ''}" data-track-index="${i}">
        <div class="track-info">
          <span class="track-num">${String(i + 1).padStart(2, '0')}</span>
          <div class="track-title-block">
            <h4>${escapeHtml(track.title)}</h4>
            <p>${escapeHtml(track.artist)} · <span style="color:var(--accent)">${escapeHtml(track.genre)}</span></p>
          </div>
        </div>
        <div class="track-side">
          <span>${escapeHtml(track.duration)}</span>
          <button class="track-play-btn" type="button" aria-label="Play ${escapeHtml(track.title)}">▶</button>
        </div>
      </div>
    `).join('');

    trackList.addEventListener('click', (e) => {
      const item = e.target.closest('.track-item');
      if (!item) return;
      const index = Number(item.dataset.trackIndex);
      if (index === app.currentTrackIndex) {
        togglePlay();
      } else {
        loadTrack(index);
        audio.play().then(() => {
          app.isPlaying = true;
          if (playBtn) playBtn.textContent = '❚❚';
          playerCard?.classList.add('is-playing');
          updateTrackButtons();
        });
      }
    });
  }

  // Initial load
  loadTrack(0);
}

/* ==========================================================================
   Motion & Ink Warp
   ========================================================================== */
function initMotion() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const warp = $('#warpMap');
  const word = $('.hero-word');
  const progress = $('.scroll-progress');

  if (progress) {
    let ticking = false;
    const paint = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(paint);
        ticking = true;
      }
    }, { passive: true });
    paint();
  }

  if (warp && word && !prefersReduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let frame = 0, current = 0, target = 0, lastTime = 0;
    let resetTimer;

    function animate(time) {
      if (time - lastTime > 30) {
        current += (target - current) * 0.16;
        warp.setAttribute('scale', current.toFixed(2));
        lastTime = time;
      }
      if (Math.abs(target - current) > 0.1) {
        frame = requestAnimationFrame(animate);
      } else {
        warp.setAttribute('scale', target);
        frame = 0;
      }
    }

    word.addEventListener('pointermove', (e) => {
      const box = word.getBoundingClientRect();
      target = 10 + 24 * Math.abs((e.clientX - box.left) / box.width - 0.5);
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        target = 0;
        if (!frame) frame = requestAnimationFrame(animate);
      }, 200);
      if (!frame) frame = requestAnimationFrame(animate);
    });

    word.addEventListener('pointerleave', () => {
      target = 0;
      if (!frame) frame = requestAnimationFrame(animate);
    });
  }
}

/* ==========================================================================
   Intersection Observer for Scroll Reveals
   ========================================================================== */
let revealObserver;
function observeElements(root = document) {
  if (!('IntersectionObserver' in window)) {
    root.querySelectorAll('.reveal-pending').forEach(el => el.classList.add('visible'));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
  }
  root.querySelectorAll('.reveal-pending').forEach(el => {
    if (!el.dataset.observed) {
      el.dataset.observed = 'true';
      revealObserver.observe(el);
    }
  });
}

/* ==========================================================================
   Contact Form Validation
   ========================================================================== */
function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const nameInput = $('#name');
  const emailInput = $('#email');
  const messageInput = $('#message');
  const alertBox = $('#formSuccess');

  function validate(input, errorId, msg) {
    const err = $(`#${errorId}`);
    const valid = input.checkValidity();
    input.setAttribute('aria-invalid', String(!valid));
    if (err) err.textContent = valid ? '' : msg;
    return valid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (alertBox) alertBox.hidden = true;

    const okName = validate(nameInput, 'nameError', 'Please enter your name.');
    const okEmail = validate(emailInput, 'emailError', 'Please enter a valid email address.');
    const okMsg = validate(messageInput, 'messageError', 'Please enter at least 10 characters.');

    if (!okName || !okEmail || !okMsg) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const orig = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending message…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error('Submission response error');
      form.reset();
      if (alertBox) {
        alertBox.textContent = 'Thank you, Ritesh has received your message and will respond soon!';
        alertBox.hidden = false;
      }
    } catch (_) {
      if (alertBox) {
        alertBox.textContent = 'Thank you! You can also reach Ritesh directly at Riteshsingh02010@gmail.com.';
        alertBox.hidden = false;
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = orig;
    }
  });
}

/* ==========================================================================
   Admin Management Portal
   ========================================================================== */
function initAdminPortal() {
  const adminModal = $('#adminModal');
  const adminBtns = $$('[data-admin-trigger]');
  const adminPasscodePrompt = $('#adminPasscodeSection');
  const adminDashboard = $('#adminDashboardSection');
  const passcodeForm = $('#adminPasscodeForm');
  const passcodeInput = $('#adminPasscode');
  const passcodeError = $('#adminPasscodeError');

  function openAdmin() {
    if (!adminModal) return;
    if (typeof adminModal.showModal === 'function') adminModal.showModal();
    else adminModal.setAttribute('open', '');
    document.body.classList.add('modal-open');

    if (app.isAdminLoggedIn) {
      adminPasscodePrompt.hidden = true;
      adminDashboard.hidden = false;
      renderAdminTables();
    } else {
      adminPasscodePrompt.hidden = false;
      adminDashboard.hidden = true;
      passcodeInput?.focus();
    }
  }

  function closeAdmin() {
    if (!adminModal) return;
    if (typeof adminModal.close === 'function') adminModal.close();
    else adminModal.removeAttribute('open');
    document.body.classList.remove('modal-open');
  }

  adminBtns.forEach(btn => btn.addEventListener('click', openAdmin));
  $('#adminClose')?.addEventListener('click', closeAdmin);

  // Hash shortcut #admin
  if (window.location.hash === '#admin') {
    setTimeout(openAdmin, 300);
  }

  // Keyboard shortcut Ctrl + Shift + A
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      openAdmin();
    }
  });

  // Passcode verification
  passcodeForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passcodeInput.value === app.passcode) {
      app.isAdminLoggedIn = true;
      adminPasscodePrompt.hidden = true;
      adminDashboard.hidden = false;
      renderAdminTables();
    } else {
      if (passcodeError) passcodeError.textContent = 'Invalid passcode. Default is ritesh2026.';
      passcodeInput.focus();
    }
  });

  // Tab Switching
  $$('.admin-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.admin-tab-btn').forEach(t => t.classList.remove('active'));
      $$('.admin-tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const targetPane = $(`#${tab.dataset.targetPane}`);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Export JSON
  $('#exportDataBtn')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(app.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ritesh-site-data.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import JSON
  $('#importDataInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        app.data = imported;
        saveSiteData();
        renderProjects();
        initMusicPlayer();
        renderAdminTables();
        alert('Site data imported successfully!');
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  });

  // Reset to Defaults
  $('#resetDataBtn')?.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all portfolio content to factory defaults?')) {
      localStorage.removeItem('ritesh_portfolio_data');
      await loadSiteData();
      renderProjects();
      initMusicPlayer();
      renderAdminTables();
      alert('Reset complete!');
    }
  });

  // Save Profile Form
  $('#adminProfileForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    app.data.profile.name = $('#editProfName').value;
    app.data.profile.role = $('#editProfRole').value;
    app.data.profile.email = $('#editProfEmail').value;
    app.data.profile.phone = $('#editProfPhone').value;
    app.data.profile.bio = $('#editProfBio').value;
    app.data.profile.github = $('#editProfGithub').value;
    saveSiteData();
    updateProfileUI();
    alert('Profile updated!');
  });

  // Save Resume Form / Upload
  $('#adminResumeFile')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      app.data.resume.url = evt.target.result;
      app.data.resume.filename = file.name;
      app.data.resume.lastUpdated = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      saveSiteData();
      updateResumeUI();
      alert(`Resume updated with ${file.name}!`);
    };
    reader.readAsDataURL(file);
  });

  // Add Project Form
  $('#adminAddProjectForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newP = {
      id: $('#newProjId').value.trim() || `proj-${Date.now()}`,
      title: $('#newProjTitle').value.trim(),
      category: $('#newProjCategory').value.trim(),
      status: $('#newProjStatus').value,
      statusType: $('#newProjStatusType').value,
      description: $('#newProjDesc').value.trim(),
      details: $('#newProjDetails').value.trim(),
      tech: $('#newProjTech').value.split(',').map(s => s.trim()).filter(Boolean),
      image: $('#newProjImage').value.trim() || 'assets/images/webza.svg',
      demoUrl: $('#newProjDemo').value.trim(),
      githubUrl: $('#newProjGithub').value.trim(),
      downloadUrl: $('#newProjDownload').value.trim(),
      downloadLabel: $('#newProjDownloadLabel').value.trim() || 'Download',
      features: $('#newProjFeatures').value.split('\n').map(s => s.trim()).filter(Boolean)
    };
    app.data.projects.unshift(newP);
    saveSiteData();
    renderProjects();
    renderAdminTables();
    e.target.reset();
    alert('Project added successfully!');
  });

  // Add Music Track Form
  $('#adminAddMusicForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTrack = {
      id: `track-${Date.now()}`,
      title: $('#newTrackTitle').value.trim(),
      artist: $('#newTrackArtist').value.trim() || app.data.profile.name,
      genre: $('#newTrackGenre').value.trim(),
      duration: $('#newTrackDuration').value.trim() || '0:10',
      audioUrl: $('#newTrackAudio').value.trim() || 'assets/audio/midnight-focus.wav',
      artwork: $('#newTrackArtwork').value.trim() || 'assets/images/track-chill.svg',
      visible: $('#newTrackVisible').checked
    };
    if (!app.data.music) app.data.music = [];
    app.data.music.push(newTrack);
    saveSiteData();
    initMusicPlayer();
    renderAdminTables();
    e.target.reset();
    alert('Track added successfully!');
  });
}

function renderAdminTables() {
  // Populate Profile Form fields
  if (app.data?.profile) {
    if ($('#editProfName')) $('#editProfName').value = app.data.profile.name || '';
    if ($('#editProfRole')) $('#editProfRole').value = app.data.profile.role || '';
    if ($('#editProfEmail')) $('#editProfEmail').value = app.data.profile.email || '';
    if ($('#editProfPhone')) $('#editProfPhone').value = app.data.profile.phone || '';
    if ($('#editProfBio')) $('#editProfBio').value = app.data.profile.bio || '';
    if ($('#editProfGithub')) $('#editProfGithub').value = app.data.profile.github || '';
  }

  // Projects table
  const projTbody = $('#adminProjectsTbody');
  if (projTbody && app.data) {
    projTbody.innerHTML = (app.data.projects || []).map((p, idx) => `
      <tr>
        <td><strong>${escapeHtml(p.title)}</strong></td>
        <td>${escapeHtml(p.category)}</td>
        <td><span class="status-badge ${p.statusType}">${escapeHtml(p.status)}</span></td>
        <td>
          <button class="btn btn-secondary" style="padding:4px 8px;font-size:11px;" onclick="window.adminDeleteProject(${idx})">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  // Music table
  const musicTbody = $('#adminMusicTbody');
  if (musicTbody && app.data) {
    musicTbody.innerHTML = (app.data.music || []).map((t, idx) => `
      <tr>
        <td><strong>${escapeHtml(t.title)}</strong></td>
        <td>${escapeHtml(t.genre)}</td>
        <td>${t.visible !== false ? 'Visible' : 'Hidden'}</td>
        <td>
          <button class="btn btn-secondary" style="padding:4px 8px;font-size:11px;" onclick="window.adminToggleMusicVisibility(${idx})">
            ${t.visible !== false ? 'Hide' : 'Show'}
          </button>
          <button class="btn btn-secondary" style="padding:4px 8px;font-size:11px;" onclick="window.adminDeleteMusic(${idx})">Delete</button>
        </td>
      </tr>
    `).join('');
  }
}

window.adminDeleteProject = function(index) {
  if (confirm(`Delete "${app.data.projects[index].title}"?`)) {
    app.data.projects.splice(index, 1);
    saveSiteData();
    renderProjects();
    renderAdminTables();
  }
};

window.adminDeleteMusic = function(index) {
  if (confirm(`Delete "${app.data.music[index].title}"?`)) {
    app.data.music.splice(index, 1);
    saveSiteData();
    initMusicPlayer();
    renderAdminTables();
  }
};

window.adminToggleMusicVisibility = function(index) {
  app.data.music[index].visible = !(app.data.music[index].visible !== false);
  saveSiteData();
  initMusicPlayer();
  renderAdminTables();
};

function updateProfileUI() {
  if (!app.data?.profile) return;
  const p = app.data.profile;
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
}

function updateResumeUI() {
  if (!app.data?.resume) return;
  const r = app.data.resume;
  $$('.resume-download-btn').forEach(btn => {
    btn.href = r.url;
    btn.setAttribute('download', r.filename || 'Ritesh-Singh-Resume.pdf');
  });
  const updatedSpan = $('#resumeLastUpdated');
  if (updatedSpan) updatedSpan.textContent = r.lastUpdated || '2026';
}

/* ==========================================================================
   Page Setup & Init
   ========================================================================== */
function initEvents() {
  // Project Grid click delegate
  const grid = $('#projectGrid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-project-toggle]');
      if (toggle) {
        toggleProjectCard(toggle.closest('.project-card'));
        return;
      }
      const openBtn = e.target.closest('[data-project-id]');
      if (openBtn) {
        openProjectModal(openBtn.dataset.projectId);
      }
    });
  }

  // Filter chips
  $$('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.filter-chip').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      app.activeFilter = chip.dataset.filter;
      renderProjects();
    });
  });

  // Modal close handlers
  $('#modalClose')?.addEventListener('click', closeProjectModal);
  $('#projectModal')?.addEventListener('click', (e) => {
    if (e.target === $('#projectModal')) closeProjectModal();
  });
  $('#projectModal')?.addEventListener('close', () => document.body.classList.remove('modal-open'));
}

async function init() {
  initTheme();
  initNavigation();
  await loadSiteData();
  updateProfileUI();
  updateResumeUI();
  renderProjects();
  initMusicPlayer();
  initEvents();
  initContactForm();
  initMotion();
  initAdminPortal();

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  observeElements();
}

document.addEventListener('DOMContentLoaded', init);
