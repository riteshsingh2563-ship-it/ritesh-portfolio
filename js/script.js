/**
 * Ritesh Singh — Creative Developer Portfolio
 * Fluid In-Place Accordion, Kinetic Motion, and SQLite/Vercel Dual Support
 */

const API_BASE = window.__API_BASE__ || '';

const state = {
  projects: [
    {
      id: "webza",
      name: "WEBZA",
      visualLabel: "WEBZA / STUDIO",
      category: "Web Brand",
      statusLabel: "Active Studio",
      description: "A web-focused personal and agency brand creating modern websites, performant digital experiences, and brand identities for businesses and creators.",
      tech: ["HTML5", "CSS3", "JavaScript", "Design Systems"],
      demoUrl: "https://github.com/riteshsingh02010",
      githubUrl: "https://github.com/riteshsingh02010",
      features: [
        "Component-driven responsive layouts and typography",
        "Performance optimization achieving high Lighthouse scores",
        "Tailored visual branding and digital art direction"
      ],
      details: "WEBZA represents a hands-on digital agency concept focusing on clean execution, modern layout systems, and developer-first web craft.",
      learningOutcome: "Mastering client-facing web architecture, modular component design, and responsive styling."
    },
    {
      id: "aura-app",
      name: "Aura Music — Open Source Player",
      visualLabel: "AURA MUSIC // OPEN SOURCE",
      category: "Open Source Android App",
      statusLabel: "Release APK (26 MB)",
      description: "An open-source Android music streaming and downloading application. Stream, discover, and download high-quality music completely ad-free with background playback and offline caching.",
      tech: ["Open Source", "Android APK", "Music Streaming", "Ad-Free", "Offline Download", "Background Audio"],
      downloadUrl: "assets/Aura-Music.apk",
      downloadLabel: "Download Aura Music APK (26 MB)",
      githubUrl: "https://github.com/riteshsingh2563-ship-it/ritesh-portfolio",
      features: [
        "100% Ad-free streaming and uninterrupted playback",
        "Direct high-quality music download for offline listening",
        "Background audio playback with lock screen media controls",
        "Open-source codebase with lightweight, battery-efficient design",
        "Clean dark-mode mobile interface with instant search"
      ],
      details: "Aura Music is an open-source, ad-free music application built for music lovers who value privacy, speed, and offline access. It enables users to search, stream, and directly download high-fidelity audio tracks without interruptions, paywalls, or intrusive advertisements.",
      learningOutcome: "Engineered native Android media services, offline audio caching, and ad-free open-source app architecture."
    },
    {
      id: "rk-fitness",
      name: "RK Fitness Platform",
      visualLabel: "RK / FITNESS PLATFORM",
      category: "Web System",
      statusLabel: "Downloadable ZIP",
      description: "Comprehensive fitness training website featuring workout schedules, trainer profiles, and membership tiers packaged as a complete source ZIP.",
      tech: ["HTML5", "CSS Grid", "Responsive UI", "Source ZIP"],
      downloadUrl: "assets/RK-Fitness-Final-Website.zip",
      downloadLabel: "Download Source (6.9 MB ZIP)",
      githubUrl: "https://github.com/riteshsingh02010",
      features: [
        "Interactive schedule table and membership tier cards",
        "Complete self-contained source ZIP ready for hosting",
        "Mobile-first responsive layout with fast load times"
      ],
      details: "Engineered to explore multi-page gym booking systems, table styling, and complete site bundle packaging.",
      learningOutcome: "End-to-end multi-page web packaging, form layouts, and asset structuring."
    },
    {
      id: "nexvix-media",
      name: "NEXVIX MEDIA",
      visualLabel: "NEXVIX / MEDIA AGENCY",
      category: "AI & Agency",
      statusLabel: "Agency Concept",
      description: "A digital and AI marketing agency concept focused on scaling businesses through influencer marketing, viral short-form video, and automated social systems.",
      tech: ["AI Workflows", "Social Strategy", "Influencer Systems", "Automation"],
      githubUrl: "https://github.com/riteshsingh02010",
      features: [
        "Influencer campaign discovery and reach-out workflows",
        "AI-assisted short-form content repurposing pipeline",
        "Audience retention analytics and growth strategies"
      ],
      details: "NEXVIX MEDIA explores the intersection of generative AI workflows with modern social media distribution algorithms.",
      learningOutcome: "Understanding digital agency business mechanics and automated media workflows."
    },
    {
      id: "boostmybrand",
      name: "BoostMyBrand.ai",
      visualLabel: "BOOSTMYBRAND / AI TOOL",
      category: "AI Product",
      statusLabel: "AI Micro-SaaS",
      description: "An AI tool concept designed to generate high-converting social captions, marketing hooks, and brand copy for Indian small businesses and creators.",
      tech: ["Gemini API", "Prompt Engineering", "Node.js", "Express"],
      githubUrl: "https://github.com/riteshsingh02010",
      features: [
        "Instant marketing hook and copy generation",
        "Customized tone calibrated for localized Indian audiences",
        "One-click clipboard copy and template categorization"
      ],
      details: "Designed as an AI micro-SaaS connecting small business owners to structured prompt engineering without complexity.",
      learningOutcome: "Integrating generative AI prompts into tangible user applications."
    },
    {
      id: "payment-gateway",
      name: "Razorpay Payment System",
      visualLabel: "RAZORPAY / GATEWAY SYSTEM",
      category: "Fintech",
      statusLabel: "System Study",
      description: "A practical exploration of digital payment processing, webhooks, cryptographic HMAC verification, and checkout workflows.",
      tech: ["Razorpay API", "Webhooks", "HMAC SHA256", "Node.js"],
      githubUrl: "https://github.com/riteshsingh02010",
      features: [
        "Dynamic order generation and checkout modal integration",
        "Cryptographic HMAC SHA256 signature verification",
        "Idempotent webhook transaction handling"
      ],
      details: "An architectural deep-dive into how modern e-commerce stores handle payment handshakes, signature verification, and receipt logging.",
      learningOutcome: "Mastering security rules, webhooks, and idempotent server-to-server calls."
    }
  ],
  music: [
    { id: "track-1", title: "Midnight Focus", artist: "Ritesh Singh", genre: "Lo-Fi Coding Beats", duration: "0:10", artwork: "assets/images/track-chill.svg", audio_url: "assets/audio/midnight-focus.wav" },
    { id: "track-2", title: "Deep Residue", artist: "Ritesh Singh", genre: "Ambient Synthwave", duration: "0:12", artwork: "assets/images/track-ambient.svg", audio_url: "assets/audio/deep-residue.wav" },
    { id: "track-3", title: "Synthesis 2026", artist: "Ritesh Singh", genre: "Cyber Beats", duration: "0:08", artwork: "assets/images/track-cyber.svg", audio_url: "assets/audio/synthesis-2026.wav" }
  ],
  activeFilter: 'all',
  activeProject: null,
  audio: new Audio(),
  currentTrackIndex: 0,
  isPlaying: false
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const projectGrid = $('#projectGrid');
const projectsEmpty = $('#projectsEmpty');
const modal = $('#projectModal');
const modalImage = $('#modalImage');

function escapeHtml(value) {
  if (!value) return '';
  return String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ==========================================================================
   Theme Management
   ========================================================================== */
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('theme', theme); } catch (_) {}
  const icon = $('#themeToggle span');
  const next = theme === 'dark' ? 'light' : 'dark';
  if (icon) icon.textContent = theme === 'dark' ? '☼' : '☾';
}

function initTheme() {
  let stored = 'dark';
  try { stored = localStorage.getItem('theme') || 'dark'; } catch (_) {}
  setTheme(stored);
  $('#themeToggle')?.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  // Mobile navigation toggle
  const menuToggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
  menuToggle?.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    mobileMenu.hidden = expanded;
    menuToggle.textContent = expanded ? '☰' : '✕';
  });

  // Scroll Progress Bar
  const progressBar = $('.scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollMax > 0 ? window.scrollY / scrollMax : 0;
      progressBar.style.transform = `scaleX(${progress})`;
    }, { passive: true });
  }
}

/* ==========================================================================
   Project Card Markup & In-Place Accordion Engine
   ========================================================================== */
function cardMarkup(project, index) {
  const number = String(index + 1).padStart(2, '0');
  const id = escapeHtml(project.id);
  const name = escapeHtml(project.name || project.title);
  const visualLabel = project.visualLabel || project.title || name;
  const titleParts = visualLabel.split(' / ').map(part => `<span>${escapeHtml(part)}</span>`).join('');
  
  const demo = project.demoUrl || project.demo_url ? `<a href="${escapeHtml(project.demoUrl || project.demo_url)}" target="_blank" rel="noopener noreferrer">Live site ↗</a>` : '';
  const github = project.githubUrl || project.github_url ? `<a href="${escapeHtml(project.githubUrl || project.github_url)}" target="_blank" rel="noopener noreferrer">Code ↗</a>` : '';
  
  const dlUrl = project.downloadUrl || project.download_url;
  const dlLabel = project.downloadLabel || project.download_label || 'Download';
  const download = dlUrl ? `<a href="${escapeHtml(dlUrl)}"${dlUrl.startsWith('assets/') ? ' download' : ' target="_blank" rel="noopener noreferrer"'}>${escapeHtml(dlLabel)} ↓</a>` : '';

  const features = (project.features || []).slice(0, 3).map(f => `<li>${escapeHtml(f)}</li>`).join('');
  const techStr = (project.tech || []).slice(0, 3).join(' / ');

  return `
    <article class="project-card" data-expanded="false" id="card-${id}">
      <button class="project-cover cover-${id}" type="button" data-project-toggle="${id}" aria-expanded="false" aria-controls="project-panel-${id}" aria-label="Toggle details for ${name}">
        <span class="cover-label">PROJECT / ${number}</span>
        <span class="cover-title" aria-hidden="true">${titleParts}</span>
        <span class="cover-bottom">
          <span>${escapeHtml(techStr)}</span>
          <span class="cover-arrow" aria-hidden="true">+</span>
        </span>
      </button>

      <div class="project-body">
        <div class="project-title-row">
          <h3 id="project-title-${id}">${name}</h3>
          <span class="status">${escapeHtml(project.statusLabel || project.status || 'Active')}</span>
        </div>

        <button class="project-expand-toggle" type="button" data-project-toggle="${id}" aria-expanded="false" aria-controls="project-panel-${id}">
          <span class="expand-label">About this project</span>
          <span class="expand-icon" aria-hidden="true">+</span>
        </button>

        <div class="project-expand-panel" id="project-panel-${id}" role="region" aria-labelledby="project-title-${id}" aria-hidden="true" inert>
          <div class="project-expand-clip">
            <div class="project-expand-content">
              <p class="project-description">${escapeHtml(project.description)}</p>
              <ul class="project-feature-list">${features}</ul>
              <div class="project-footer">
                <span class="project-category">${escapeHtml(project.category)}</span>
                <div class="project-actions">
                  ${demo}
                  ${github}
                  ${download}
                  <button class="project-detail-link" type="button" data-project-id="${id}">Full details ↗</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

function setProjectExpanded(card, expanded) {
  const panel = card.querySelector('.project-expand-panel');
  if (!panel) return;
  card.dataset.expanded = String(expanded);
  card.querySelectorAll('[data-project-toggle]').forEach(btn => btn.setAttribute('aria-expanded', String(expanded)));
  const label = card.querySelector('.expand-label');
  if (label) label.textContent = expanded ? 'Close overview' : 'About this project';
  panel.inert = !expanded;
  panel.setAttribute('aria-hidden', String(!expanded));
}

function toggleProjectCard(card) {
  const isExpanded = card.dataset.expanded === 'true';
  // Keep one open at a time for clean scanning
  if (!isExpanded) {
    projectGrid.querySelectorAll('.project-card[data-expanded="true"]').forEach(other => {
      if (other !== card) setProjectExpanded(other, false);
    });
  }
  setProjectExpanded(card, !isExpanded);
}

function matchesFilter(p, filter) {
  if (filter === 'all') return true;
  const cat = (p.category || '').toLowerCase();
  const tech = (p.tech || []).join(' ').toLowerCase();
  const title = (p.name || p.title || '').toLowerCase();

  if (filter === 'web') return cat.includes('web') || tech.includes('html') || title.includes('webza') || title.includes('rk');
  if (filter === 'agency') return cat.includes('agency') || cat.includes('marketing') || title.includes('nexvix') || title.includes('boost');
  if (filter === 'apps') return cat.includes('mobile') || cat.includes('fintech') || title.includes('aura') || title.includes('payment');
  if (filter === 'media') return cat.includes('media') || title.includes('shorts') || title.includes('video');
  return true;
}

function renderProjects() {
  if (!projectGrid) return;
  const filtered = state.projects.filter(p => matchesFilter(p, state.activeFilter));

  if (filtered.length === 0) {
    projectGrid.innerHTML = '';
    if (projectsEmpty) projectsEmpty.hidden = false;
    return;
  }

  if (projectsEmpty) projectsEmpty.hidden = true;
  projectGrid.innerHTML = filtered.map((p, i) => cardMarkup(p, i)).join('');

  // Update count badge
  const countEl = $('#workCountDisplay');
  if (countEl) countEl.textContent = `01—${String(state.projects.length).padStart(2, '0')}`;
}

/* ==========================================================================
   Project Inspection Modal
   ========================================================================== */
function openModal(project) {
  if (!project || !modal) return;
  state.activeProject = project;

  $('#modalCategory').textContent = project.category;
  $('#modalTitle').textContent = project.name || project.title;
  $('#modalDescription').textContent = project.description;
  if (modalImage) modalImage.src = project.image || 'assets/images/webza.svg';

  $('#modalTech').innerHTML = (project.tech || []).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');
  $('#modalFeatures').innerHTML = (project.features || []).map(f => `<li>${escapeHtml(f)}</li>`).join('');
  $('#modalAiRole').textContent = project.details || project.description;
  $('#modalImpact').textContent = project.learningOutcome || project.learning_outcome || 'Real-world project engineering and experimentation.';

  const demo = $('#modalDemo');
  const gh = $('#modalGithub');
  const dl = $('#modalDownload');

  const demoUrl = project.demoUrl || project.demo_url;
  if (demoUrl) { demo.style.display = 'inline-flex'; demo.href = demoUrl; }
  else { demo.style.display = 'none'; }

  const ghUrl = project.githubUrl || project.github_url;
  if (ghUrl) { gh.style.display = 'inline-flex'; gh.href = ghUrl; }
  else { gh.style.display = 'none'; }

  const dlUrl = project.downloadUrl || project.download_url;
  if (dlUrl) {
    dl.style.display = 'inline-flex';
    dl.href = dlUrl;
    dl.innerHTML = `${escapeHtml(project.downloadLabel || project.download_label || 'Download')} ↓`;
    if (dlUrl.startsWith('assets/')) {
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

function closeModal() {
  if (!modal) return;
  if (typeof modal.close === 'function') modal.close();
  else modal.removeAttribute('open');
  document.body.classList.remove('modal-open');
}

/* ==========================================================================
   Soundscapes Audio Engine
   ========================================================================== */
function initAudio() {
  const playBtn = $('#audioPlayToggleBtn');
  if (!playBtn) return;
  const tracks = state.music;
  if (!tracks || !tracks.length) return;

  const audio = state.audio;
  const scrubberFill = $('#audioScrubberFill');
  const scrubberBar = $('#audioScrubberBar');
  const curTime = $('#audioCurTime');
  const durTime = $('#audioDurTime');
  const title = $('#audioPlayerTitle');
  const artist = $('#audioPlayerArtist');
  const artwork = $('#audioPlayerArtwork');
  const playlistWrap = $('#audioPlaylistWrap');

  function loadTrack(index) {
    if (!tracks[index]) return;
    state.currentTrackIndex = index;
    const t = tracks[index];
    audio.src = t.audio_url;

    if (title) title.textContent = t.title;
    if (artist) artist.textContent = `${t.artist} • ${t.genre}`;
    if (artwork) artwork.src = t.artwork || 'assets/images/track-chill.svg';
    if (durTime) durTime.textContent = t.duration || '0:10';
    if (scrubberFill) scrubberFill.style.width = '0%';
    if (curTime) curTime.textContent = '0:00';

    $$('.audio-playlist-row').forEach((row, i) => {
      row.style.borderColor = i === index ? 'var(--blue)' : 'var(--line)';
    });
  }

  function togglePlay() {
    if (!audio.src) loadTrack(state.currentTrackIndex);
    if (audio.paused) {
      audio.play().then(() => {
        state.isPlaying = true;
        if (playBtn) playBtn.innerHTML = `Pause Soundscape <span aria-hidden="true">❚❚</span>`;
      }).catch(err => console.log('Autoplay prevented:', err));
    } else {
      audio.pause();
      state.isPlaying = false;
      if (playBtn) playBtn.innerHTML = `Play Soundscape <span aria-hidden="true">▶</span>`;
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
    if (curTime) curTime.textContent = fmt(audio.currentTime);
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

  if (playlistWrap) {
    playlistWrap.innerHTML = tracks.map((t, i) => `
      <div class="audio-playlist-row" data-idx="${i}" style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:var(--bg); border:1px solid var(--line); border-radius:6px; cursor:pointer;">
        <div>
          <span style="font-weight:600; font-size:14px;">${escapeHtml(t.title)}</span>
          <span style="font-size:12px; color:var(--muted); margin-left:8px;">${escapeHtml(t.genre)}</span>
        </div>
        <span style="font-family:var(--mono); font-size:12px; color:var(--muted);">${escapeHtml(t.duration || '0:10')}</span>
      </div>
    `).join('');

    playlistWrap.addEventListener('click', (e) => {
      const row = e.target.closest('.audio-playlist-row');
      if (!row) return;
      const idx = Number(row.dataset.idx);
      if (idx === state.currentTrackIndex) {
        togglePlay();
      } else {
        loadTrack(idx);
        audio.play().then(() => {
          state.isPlaying = true;
          if (playBtn) playBtn.innerHTML = `Pause Soundscape <span aria-hidden="true">❚❚</span>`;
        });
      }
    });
  }

  loadTrack(0);
}

/* ==========================================================================
   Contact Form Submission (Connected to SQLite)
   ========================================================================== */
function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const nameInput = $('#contactName');
  const emailInput = $('#contactEmail');
  const msgInput = $('#contactMessage');
  const submitBtn = $('#contactSubmitBtn');
  const successMsg = $('#formSuccess');
  const errorMsg = $('#formError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (successMsg) successMsg.hidden = true;
    if (errorMsg) errorMsg.hidden = true;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `Sending message… <span aria-hidden="true">⏳</span>`;

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
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
      if (successMsg) {
        successMsg.hidden = false;
        successMsg.textContent = "Thanks for reaching out! Your message has been safely saved and delivered to Ritesh.";
      }
    } catch (err) {
      if (errorMsg) {
        errorMsg.hidden = false;
        errorMsg.textContent = err.message || "Failed to deliver message. Please email directly.";
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Send message <span aria-hidden="true">→</span>`;
    }
  });
}

/* ==========================================================================
   Scroll Reveal Observer
   ========================================================================== */
function initScrollReveal() {
  const revealEls = $$('.reveal');
  revealEls.forEach(el => el.classList.add('reveal-pending'));

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* ==========================================================================
   Live API Fetching (Sync with SQLite)
   ========================================================================== */
async function fetchPortfolioData() {
  try {
    const res = await fetch(`${API_BASE}/api/portfolio`);
    if (!res.ok) return;
    const data = await res.json();
    if (data && Array.isArray(data.projects) && data.projects.length) {
      state.projects = data.projects.map(p => ({
        ...p,
        name: p.title,
        visualLabel: p.visual_label || `${p.title.toUpperCase()} / PROJECT`,
        statusLabel: p.status || 'Active',
        demoUrl: p.demo_url,
        githubUrl: p.github_url,
        downloadUrl: p.download_url,
        downloadLabel: p.download_label,
        learningOutcome: p.learning_outcome,
        features: Array.isArray(p.features) ? p.features : (p.features ? JSON.parse(p.features) : []),
        tech: Array.isArray(p.tech) ? p.tech : (p.tech ? JSON.parse(p.tech) : [])
      }));
    }
    if (data && data.profile) {
      const p = data.profile;
      $$('.user-email').forEach(el => {
        el.textContent = p.email;
        if (el.tagName === 'A') el.href = `mailto:${p.email}`;
      });
      $$('.user-phone').forEach(el => {
        el.textContent = p.phone;
        if (el.tagName === 'A') el.href = `tel:${p.phone.replace(/[^0-9+]/g, '')}`;
      });
      const primaryBio = $('#aboutPrimaryBio');
      if (primaryBio && p.bio) primaryBio.textContent = p.bio;
      const subBio = $('#aboutSubBio');
      if (subBio && p.sub_bio) subBio.textContent = p.sub_bio;
    }
    if (data && Array.isArray(data.music) && data.music.length) {
      state.music = data.music;
    }
    if (data && data.resume) {
      $$('.resume-download-link').forEach(link => {
        link.href = data.resume.url;
        link.setAttribute('download', data.resume.filename || 'Ritesh-Singh-Resume.pdf');
      });
    }
  } catch (err) {
    console.log('Using resilient seed data:', err);
  }
}

/* ==========================================================================
   Event Listeners
   ========================================================================== */
function initEvents() {
  // Filter chips
  $$('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeFilter = chip.dataset.filter;
      renderProjects();
    });
  });

  // Project Grid Clicks (Delegation for Accordion & Modal)
  projectGrid?.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('[data-project-toggle]');
    if (toggleBtn) {
      const card = toggleBtn.closest('.project-card');
      if (card) toggleProjectCard(card);
      return;
    }

    const detailBtn = e.target.closest('[data-project-id]');
    if (detailBtn) {
      const id = detailBtn.dataset.projectId;
      const proj = state.projects.find(p => p.id === id);
      if (proj) openModal(proj);
    }
  });

  // Modal close
  $('#modalClose')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// Global Startup
async function init() {
  initTheme();
  await fetchPortfolioData();
  renderProjects();
  initAudio();
  initContactForm();
  initScrollReveal();
  initEvents();

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', init);
