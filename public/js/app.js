/**
 * Ritesh Singh — Developer Portfolio Client
 * Optimized for Vercel (Frontend) & Firebase / Node.js (Backend)
 * Includes 21st.dev Spotlight Glow & Dynamic Equalizer Engine
 */

const API_BASE = window.__API_BASE__ || '';

// Fallback initial data in case frontend is previewed statically or backend is loading
const FALLBACK_DATA = {
  profile: {
    name: "Ritesh Singh",
    role: "Student, Web Developer & Creative Builder",
    headline: "Building Modern Web Products, AI Systems & Digital Ventures.",
    bio: "Ritesh is a student passionately exploring technology, AI, modern web development, digital business, and content creation. He actively learns by building real-world projects, testing business concepts, editing media, and mastering software development tools.",
    sub_bio: "From architecting digital web brands like WEBZA and agency ventures like NEXVIX MEDIA to developing cross-platform applications and exploring Razorpay payment gateway mechanics, Ritesh bridges technical execution with entrepreneurial thinking.",
    email: "Riteshsingh02010@gmail.com",
    phone: "+91 7898195460",
    location: "India",
    github: "https://github.com/riteshsingh02010",
    status_badge: "OPEN TO INTERNSHIPS, PROJECTS & COLLABORATIONS"
  },
  skills: [
    { id: "web-development", title: "Modern Web Development", category: "Engineering", proficiency: "Primary Focus", description: "HTML5, CSS3, modern JavaScript, component architecture, and responsive interfaces." },
    { id: "ai-development", title: "AI Tools & Product Workflows", category: "AI & Automation", proficiency: "Advanced Workflows", description: "Gemini, ChatGPT, Google Antigravity, and AI APIs for building smart applications." },
    { id: "brand-architecture", title: "WEBZA & Digital Brands", category: "Ventures", proficiency: "Execution", description: "Designing identity, brand voice, and digital experiences for web agencies." },
    { id: "video-production", title: "Video Production & CapCut", category: "Media & Content", proficiency: "High Retention", description: "Shorts, anime edits, pacing, dynamic motion, and sound-effect synchronization." },
    { id: "fintech-concepts", title: "Payment Systems & Razorpay", category: "Systems", proficiency: "Architecture", description: "Web checkout integration, webhooks, and payment collection workflows." },
    { id: "growth-marketing", title: "Digital & Social Marketing", category: "Growth", proficiency: "Applied", description: "Influencer strategy, content distribution algorithms, and audience retention SEO." }
  ],
  projects: [
    {
      id: "webza",
      title: "WEBZA",
      category: "web",
      status: "Active Brand",
      status_type: "live",
      featured: true,
      description: "Digital web brand focused on building sleek websites, performant digital experiences, and modern web solutions for brands and creators.",
      tech: ["HTML5", "CSS3", "JavaScript", "Design Systems"],
      image: "assets/images/webza.svg",
      demo_url: "https://github.com/riteshsingh02010",
      github_url: "https://github.com/riteshsingh02010",
      details: "WEBZA is designed as a modern web craft studio. It focuses on clean typography, responsive layouts, performance optimization, and strong visual hierarchy.",
      features: ["Custom brand identity", "Mobile-first responsive architecture", "Fluid micro-interactions", "High performance Lighthouse metrics"],
      learning_outcome: "Deepened frontend component modularity and client-facing digital design."
    },
    {
      id: "aura-app",
      title: "Aura Android Application",
      category: "apps",
      status: "APK Build Ready",
      status_type: "apk",
      featured: true,
      description: "Mobile lifestyle and utility application compiled and packaged as a standalone Android APK build.",
      tech: ["Android SDK", "Mobile UI", "Cross-Platform", "APK Build"],
      image: "assets/images/aura-app.svg",
      download_url: "assets/Aura_Final.apk",
      download_label: "Download APK (8.5 MB)",
      github_url: "https://github.com/riteshsingh02010",
      details: "Aura was developed to explore mobile application architecture, touch gestures, state persistence, and native Android packaging.",
      features: ["Optimized Android APK package", "Smooth touch interactions", "Offline capability", "Clean mobile UI"],
      learning_outcome: "Hands-on experience with native mobile deployment and packaging."
    },
    {
      id: "rk-fitness",
      title: "RK Fitness Platform",
      category: "web",
      status: "Downloadable ZIP",
      status_type: "live",
      featured: true,
      description: "Complete fitness training platform with workout routines, membership tiers, and booking interface packaged as a source ZIP.",
      tech: ["Web Architecture", "Responsive Design", "CSS Grid", "Full Source ZIP"],
      image: "assets/images/rk-fitness.svg",
      download_url: "assets/RK-Fitness-Final-Website.zip",
      download_label: "Download Website (6.9 MB ZIP)",
      github_url: "https://github.com/riteshsingh02010",
      details: "A complete multi-page gym and personal training website engineered with schedule tables, pricing cards, and contact booking.",
      features: ["Responsive schedule view", "Membership tier cards", "Trainer profile cards", "Self-contained deployable bundle"],
      learning_outcome: "End-to-end multi-page web packaging and asset structuring."
    },
    {
      id: "nexvix-media",
      title: "NEXVIX MEDIA",
      category: "agency",
      status: "Agency Concept",
      status_type: "concept",
      featured: false,
      description: "Digital and AI-powered marketing agency concept aimed at helping brands scale through short-form video, influencer campaigns, and automation.",
      tech: ["AI Workflows", "Social Strategy", "Influencer Systems", "Automation"],
      image: "assets/images/nexvix.svg",
      github_url: "https://github.com/riteshsingh02010",
      details: "NEXVIX MEDIA combines AI content pipelines with distribution strategies to help businesses capture audience attention efficiently.",
      features: ["Influencer discovery framework", "Content repurposing pipeline", "Automation playbooks", "Analytics tracking"],
      learning_outcome: "Understanding digital agency business mechanics and automated media workflows."
    },
    {
      id: "boostmybrand-ai",
      title: "BoostMyBrand.ai",
      category: "agency",
      status: "AI Concept",
      status_type: "concept",
      featured: false,
      description: "AI-powered product concept to generate social captions, marketing hooks, and brand copy tailored for Indian SMEs.",
      tech: ["Gemini API", "Prompt Engineering", "Node.js", "Express"],
      image: "assets/images/boostmybrand.svg",
      github_url: "https://github.com/riteshsingh02010",
      details: "Designed as a prompt-engineered micro-SaaS where users input their business type and get 30 days of high-converting social copy.",
      features: ["Automated hook generation", "Localized marketing tone", "One-click copy clipboard", "Template library"],
      learning_outcome: "Integrating generative AI prompts into tangible user applications."
    },
    {
      id: "payment-system",
      title: "Razorpay Payment Gateway Integration",
      category: "apps",
      status: "System Study",
      status_type: "system",
      featured: false,
      description: "Practical engineering exploration of digital payment collections, checkout SDKs, webhooks, and order generation.",
      tech: ["Razorpay API", "Webhooks", "HMAC SHA256", "Fintech Concepts"],
      image: "assets/images/payment.svg",
      github_url: "https://github.com/riteshsingh02010",
      details: "An architectural deep-dive into how modern e-commerce stores handle payment handshakes, signature verification, and receipt logging.",
      features: ["Dynamic order creation", "Cryptographic HMAC signature validation", "Failure fallback states", "Transaction logs"],
      learning_outcome: "Mastering security rules, webhooks, and idempotent server-to-server calls."
    }
  ],
  music: [
    { id: "track-1", title: "Midnight Focus", artist: "Ritesh Singh", genre: "Lo-Fi Coding Beats", duration: "0:10", artwork: "assets/images/track-chill.svg", audio_url: "assets/audio/midnight-focus.wav", visible: 1 },
    { id: "track-2", title: "Deep Residue", artist: "Ritesh Singh", genre: "Ambient Synthwave", duration: "0:12", artwork: "assets/images/track-ambient.svg", audio_url: "assets/audio/deep-residue.wav", visible: 1 },
    { id: "track-3", title: "Synthesis 2026", artist: "Ritesh Singh", genre: "Cyber Beats", duration: "0:08", artwork: "assets/images/track-cyber.svg", audio_url: "assets/audio/synthesis-2026.wav", visible: 1 }
  ],
  resume: {
    title: "Ritesh Singh — Resume",
    filename: "Ritesh-Singh-Resume.pdf",
    url: "assets/Ritesh-Singh-Resume.pdf",
    last_updated: "September 2026"
  }
};

const state = {
  data: FALLBACK_DATA,
  activeFilter: 'all',
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
   21st.dev Dynamic Spotlight Glow Engine ([data-glow])
   ========================================================================== */
function initSpotlightGlow() {
  const cards = $$('[data-glow]');
  
  const handlePointerMove = (e) => {
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);
    });
  };

  window.addEventListener('pointermove', handlePointerMove, { passive: true });
}

/* ==========================================================================
   Scroll Reveal Animations (IntersectionObserver)
   ========================================================================== */
function initScrollReveal() {
  const revealEls = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('active'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* ==========================================================================
   Data Fetching & Live Sync (Vercel & Firebase Dual Support)
   ========================================================================== */
async function fetchPortfolioData() {
  try {
    const res = await fetch(`${API_BASE}/api/portfolio`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.profile) {
      state.data = data;
    }
  } catch (err) {
    console.log('Using resilient seed data (API server idle or static preview mode):', err.message);
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
  const p = state.data?.profile;
  if (!p) return;

  $$('.user-name').forEach(el => el.textContent = p.name);
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

  const githubHeroLink = $('#githubHeroLink');
  if (githubHeroLink && p.github) githubHeroLink.href = p.github;
}

function renderSkills() {
  const grid = $('#skillsGrid');
  if (!grid || !state.data?.skills) return;

  grid.innerHTML = state.data.skills.map((s, idx) => `
    <div class="skill-bento-tile reveal delay-${(idx % 3) + 1}" data-glow>
      <div class="skill-tile-header">
        <div class="skill-icon-wrap">⚡</div>
        <span class="skill-level-badge">${escapeHtml(s.proficiency || 'Core Discipline')}</span>
      </div>
      <h3 class="skill-title">${escapeHtml(s.title)}</h3>
      <p class="skill-summary">${escapeHtml(s.description || '')}</p>
    </div>
  `).join('');
}

function matchesFilter(p, filter) {
  if (filter === 'all') return true;
  const cat = (p.category || '').toLowerCase();
  const tech = (p.tech || []).join(' ').toLowerCase();
  const title = (p.title || '').toLowerCase();

  if (filter === 'web') return cat.includes('web') || tech.includes('html') || title.includes('webza') || title.includes('rk');
  if (filter === 'agency') return cat.includes('agency') || cat.includes('startup') || cat.includes('marketing') || title.includes('nexvix') || title.includes('boost');
  if (filter === 'apps') return cat.includes('mobile') || cat.includes('apps') || cat.includes('fintech') || title.includes('aura') || title.includes('payment');
  if (filter === 'media') return cat.includes('media') || cat.includes('video') || title.includes('youtube');
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

  grid.innerHTML = filtered.map((p, idx) => {
    const isWide = idx === 0;
    const statusType = escapeHtml(p.status_type || 'concept');
    const demo = p.demo_url ? `<a class="card-link" href="${escapeHtml(p.demo_url)}" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>` : '';
    const code = p.github_url ? `<a class="card-link" href="${escapeHtml(p.github_url)}" target="_blank" rel="noopener noreferrer">Code ↗</a>` : '';
    const download = p.download_url ? `<a class="card-link" href="${escapeHtml(p.download_url)}"${p.download_url.startsWith('assets/') ? ' download' : ' target="_blank" rel="noopener noreferrer"'}>${escapeHtml(p.download_label || 'Download')} ↓</a>` : '';
    const techTags = (p.tech || []).slice(0, 4).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');

    return `
      <article class="project-bento-card ${isWide ? 'featured-wide' : ''} reveal" data-glow>
        <div class="project-preview-wrap">
          <img src="${escapeHtml(p.image || 'assets/images/webza.svg')}" alt="${escapeHtml(p.title)}" loading="lazy">
        </div>
        <div class="project-info-wrap">
          <div>
            <div class="project-header-row">
              <h3 class="project-title">${escapeHtml(p.title)}</h3>
              <span class="status-badge ${statusType}">${escapeHtml(p.status || 'Active')}</span>
            </div>
            <p class="project-desc">${escapeHtml(p.description)}</p>
            <div class="project-tags">${techTags}</div>
          </div>
          <div class="project-actions-row">
            ${demo}
            ${code}
            ${download}
            <button class="card-inspect-btn" type="button" onclick="openProjectModal('${escapeHtml(p.id)}')">Inspect Details ↗</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Re-bind spotlights to new cards
  initSpotlightGlow();
  initScrollReveal();
}

function renderResume() {
  const r = state.data?.resume;
  if (!r) return;
  $$('.resume-download-link').forEach(link => {
    link.href = r.url;
    link.setAttribute('download', r.filename || 'Ritesh-Singh-Resume.pdf');
  });
  const updated = $('#resumeLastUpdated');
  if (updated) updated.textContent = r.last_updated || 'September 2026';
}

/* ==========================================================================
   Project Inspection Modal
   ========================================================================== */
function openProjectModal(id) {
  const project = state.data?.projects?.find(p => p.id === id);
  const modal = $('#projectModal');
  if (!project || !modal) return;

  $('#modalCategory').textContent = project.category || 'PROJECT';
  $('#modalTitle').textContent = project.title;
  $('#modalDescription').textContent = project.description;

  const media = $('#modalMedia');
  if (project.video_url) {
    media.innerHTML = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;border:1px solid rgba(255,255,255,0.1);"><iframe src="${escapeHtml(project.video_url)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
  } else {
    media.innerHTML = `<img src="${escapeHtml(project.image || 'assets/images/webza.svg')}" style="width:100%; max-height:360px; object-fit:cover; border-radius:12px; border:1px solid rgba(255,255,255,0.1);" alt="Preview">`;
  }

  $('#modalTech').innerHTML = (project.tech || []).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');
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
}

function closeProjectModal() {
  const modal = $('#projectModal');
  if (!modal) return;
  if (typeof modal.close === 'function') modal.close();
  else modal.removeAttribute('open');
}

/* ==========================================================================
   Dual Audio Player & Equalizer Engine
   ========================================================================== */
function initAudioEngine() {
  const tracks = state.data?.music || [];
  if (!tracks.length) return;

  const audio = state.audio;
  const heroCard = $('#heroAudioCard');
  const heroPlayBtn = $('#heroAudioPlayBtn');
  const heroFill = $('#heroAudioFill');
  const heroScrubber = $('#heroAudioScrubber');
  const heroTime = $('#heroAudioTime');
  const heroTitle = $('#heroTrackTitle');
  const heroArtist = $('#heroTrackArtist');
  const heroThumb = $('#heroAudioThumb');

  const mainPlayBtn = $('#mainPlayerPlayBtn');
  const mainFill = $('#mainPlayerFill');
  const mainScrubber = $('#mainPlayerScrubber');
  const mainCurTime = $('#mainPlayerCurrentTime');
  const mainDurTime = $('#mainPlayerDurationTime');
  const mainTitle = $('#mainPlayerTitle');
  const mainArtist = $('#mainPlayerArtist');
  const mainThumb = $('#mainPlayerArtwork');
  const trackListEl = $('#fullTrackList');

  function loadTrack(index) {
    if (!tracks[index]) return;
    state.currentTrackIndex = index;
    const t = tracks[index];
    audio.src = t.audio_url;

    if (heroTitle) heroTitle.textContent = t.title;
    if (heroArtist) heroArtist.textContent = `${t.genre} • ${t.duration || '0:10'}`;
    if (heroThumb) heroThumb.src = t.artwork || 'assets/images/track-chill.svg';

    if (mainTitle) mainTitle.textContent = t.title;
    if (mainArtist) mainArtist.textContent = `${t.artist} • ${t.genre}`;
    if (mainThumb) mainThumb.src = t.artwork || 'assets/images/track-chill.svg';
    if (mainDurTime) mainDurTime.textContent = t.duration || '0:10';

    $$('.track-select-item').forEach((item, i) => {
      item.style.borderColor = i === index ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.08)';
    });
  }

  function togglePlay() {
    if (!audio.src) loadTrack(state.currentTrackIndex);
    if (audio.paused) {
      audio.play().then(() => {
        state.isPlaying = true;
        heroCard?.classList.add('audio-playing');
        if (heroPlayBtn) heroPlayBtn.textContent = '❚❚';
        if (mainPlayBtn) mainPlayBtn.textContent = '❚❚ Pause Soundscape';
      }).catch(err => console.log('Audio autoplay policy:', err));
    } else {
      audio.pause();
      state.isPlaying = false;
      heroCard?.classList.remove('audio-playing');
      if (heroPlayBtn) heroPlayBtn.textContent = '▶';
      if (mainPlayBtn) mainPlayBtn.textContent = '▶ Play Soundscape';
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
    if (heroFill) heroFill.style.width = `${pct}%`;
    if (mainFill) mainFill.style.width = `${pct}%`;
    if (heroTime) heroTime.textContent = fmt(audio.currentTime);
    if (mainCurTime) mainCurTime.textContent = fmt(audio.currentTime);
  });

  audio.addEventListener('ended', () => {
    state.currentTrackIndex = (state.currentTrackIndex + 1) % tracks.length;
    loadTrack(state.currentTrackIndex);
    audio.play();
  });

  heroPlayBtn?.addEventListener('click', togglePlay);
  mainPlayBtn?.addEventListener('click', togglePlay);

  const handleScrub = (bar, e) => {
    if (!audio.duration) return;
    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pos * audio.duration;
  };

  heroScrubber?.addEventListener('click', (e) => handleScrub(heroScrubber, e));
  mainScrubber?.addEventListener('click', (e) => handleScrub(mainScrubber, e));

  if (trackListEl) {
    trackListEl.innerHTML = tracks.map((t, idx) => `
      <div class="track-select-item" data-idx="${idx}" style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); cursor:pointer; transition:all 0.2s ease;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-family:var(--font-mono); font-size:12px; color:var(--text-dim);">${String(idx + 1).padStart(2, '0')}</span>
          <div>
            <div style="font-size:14px; font-weight:600; color:var(--text-main);">${escapeHtml(t.title)}</div>
            <div style="font-size:12px; color:var(--text-dim);">${escapeHtml(t.genre)}</div>
          </div>
        </div>
        <span style="font-family:var(--font-mono); font-size:12px; color:var(--text-dim);">${escapeHtml(t.duration || '0:10')}</span>
      </div>
    `).join('');

    trackListEl.addEventListener('click', (e) => {
      const item = e.target.closest('.track-select-item');
      if (!item) return;
      const idx = Number(item.dataset.idx);
      if (idx === state.currentTrackIndex) {
        togglePlay();
      } else {
        loadTrack(idx);
        audio.play().then(() => {
          state.isPlaying = true;
          heroCard?.classList.add('audio-playing');
          if (heroPlayBtn) heroPlayBtn.textContent = '❚❚';
          if (mainPlayBtn) mainPlayBtn.textContent = '❚❚ Pause Soundscape';
        });
      }
    });
  }

  loadTrack(0);
}

/* ==========================================================================
   Contact Form Submissions
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
    submitBtn.textContent = 'Sending Message…';

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
      if (alertBox) {
        alertBox.textContent = 'Thank you! Your message has been safely delivered to Ritesh Singh.';
        alertBox.hidden = false;
      }
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message || 'Unable to submit message. Please email directly.';
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
  $$('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-tab').forEach(b => b.classList.remove('active'));
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
  initAudioEngine();
  initContactForm();
  initFilters();
  initSpotlightGlow();
  initScrollReveal();

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', init);
