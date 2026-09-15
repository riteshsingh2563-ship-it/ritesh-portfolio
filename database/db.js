const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'portfolio.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for better concurrency and foreign keys
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    headline TEXT,
    bio TEXT,
    sub_bio TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    github TEXT,
    youtube TEXT,
    linkedin TEXT,
    instagram TEXT,
    status_badge TEXT,
    avatar_url TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    proficiency TEXT DEFAULT 'Advanced',
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    visual_label TEXT,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    status_type TEXT DEFAULT 'concept',
    featured INTEGER DEFAULT 0,
    description TEXT,
    details TEXT,
    tech TEXT,
    image TEXT,
    video_url TEXT,
    github_url TEXT,
    demo_url TEXT,
    download_url TEXT,
    download_label TEXT,
    features TEXT,
    learning_outcome TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS music (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    genre TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    artwork TEXT,
    audio_url TEXT NOT NULL,
    visible INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS resume (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    last_updated TEXT,
    visible INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    ip_address TEXT,
    read_status INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Password hashing utility using scrypt
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

// Seed initial data if tables are empty
function seedDatabase() {
  // 1. Seed Admin
  const adminCheck = db.prepare('SELECT COUNT(*) as count FROM admins').get();
  if (adminCheck.count === 0) {
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'ritesh2026';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(adminPass, salt);
    
    db.prepare('INSERT INTO admins (username, password_hash, salt) VALUES (?, ?, ?)').run(adminUser, hash, salt);
    console.log(`[Database] Created default admin account: "${adminUser}"`);
  }

  // 2. Seed Profile
  const profileCheck = db.prepare('SELECT COUNT(*) as count FROM profile').get();
  if (profileCheck.count === 0) {
    db.prepare(`
      INSERT INTO profile (
        id, name, role, headline, bio, sub_bio, email, phone, location,
        github, youtube, linkedin, instagram, status_badge, avatar_url
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      'Ritesh Singh',
      'Student, Creator & Digital Builder',
      'Architecting High-Performance Web Products, AI Systems & Creative Media',
      'Ritesh is a student passionately exploring technology, AI, modern web development, digital business, and content creation. He actively learns by building real-world projects, testing business concepts, editing media, and mastering software development tools.',
      'From architecting digital web brands like WEBZA and agency ventures like NEXVIX MEDIA to developing cross-platform applications and exploring Razorpay payment gateway mechanics, Ritesh bridges technical execution with entrepreneurial thinking.',
      'Riteshsingh02010@gmail.com',
      '+91 7898195460',
      'India',
      'https://github.com/riteshsingh02010',
      'https://youtube.com/@riteshsingh',
      'https://linkedin.com/in/riteshsingh',
      'https://instagram.com/riteshsingh',
      'OPEN TO INTERNSHIPS, PROJECTS & COLLABORATIONS',
      'assets/images/webza.svg'
    );
  }

  // 3. Seed Skills
  const skillsCheck = db.prepare('SELECT COUNT(*) as count FROM skills').get();
  if (skillsCheck.count === 0) {
    const defaultSkills = [
      { id: 'web-dev', title: 'Web & App Development', category: 'Engineering', proficiency: 'Advanced', description: 'Responsive web apps, single-page architectures, React, Next.js, and Capacitor mobile packaging.', icon: 'code', sort_order: 1 },
      { id: 'ai-tools', title: 'AI Tools & Automation', category: 'Artificial Intelligence', proficiency: 'Advanced', description: 'Google Antigravity agentic workflows, Gemini, ChatGPT, LLM APIs, and prompt engineering.', icon: 'cpu', sort_order: 2 },
      { id: 'ui-design', title: 'Website Design & UI/UX', category: 'Design', proficiency: 'Advanced', description: 'High-contrast design systems, typography hierarchy, responsive grids, and micro-interactions.', icon: 'layout', sort_order: 3 },
      { id: 'digital-marketing', title: 'Digital & Social Marketing', category: 'Growth & Marketing', proficiency: 'Intermediate', description: 'Brand positioning, audience acquisition, social media strategies, and creator partnerships.', icon: 'trending-up', sort_order: 4 },
      { id: 'business', title: 'Entrepreneurship & Startups', category: 'Business', proficiency: 'Intermediate', description: 'Agency business models, client onboarding pipelines, and marketplace service architectures.', icon: 'briefcase', sort_order: 5 },
      { id: 'video-editing', title: 'Video Editing & Content Creation', category: 'Media Production', proficiency: 'Advanced', description: 'YouTube Shorts, anime edits, CapCut retention pacing, Canva thumbnails, and metadata SEO.', icon: 'video', sort_order: 6 },
      { id: 'github-workflow', title: 'GitHub & Software Projects', category: 'Developer Tools', proficiency: 'Advanced', description: 'Git versioning, open-source repositories, collaborative workflows, and terminal mastery.', icon: 'git-branch', sort_order: 7 },
      { id: 'payment-concepts', title: 'FinTech & Payment Gateways', category: 'Architecture', proficiency: 'Intermediate', description: 'Razorpay checkout lifecycle, webhook signature verification, and secure transaction states.', icon: 'credit-card', sort_order: 8 }
    ];

    const insertSkill = db.prepare(`
      INSERT INTO skills (id, title, category, proficiency, description, icon, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of defaultSkills) {
      insertSkill.run(s.id, s.title, s.category, s.proficiency, s.description, s.icon, s.sort_order);
    }
  }

  // 4. Seed Projects & Concepts
  const projectCheck = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  if (projectCheck.count === 0) {
    const defaultProjects = [
      {
        id: 'webza',
        title: 'WEBZA',
        visual_label: 'WEBZA / BRAND',
        category: 'Digital Web Brand',
        status: 'Active Brand',
        status_type: 'active',
        featured: 1,
        description: 'A web-focused personal and project brand where Ritesh creates modern websites, bespoke web applications, and digital experiences for businesses and individuals.',
        details: 'WEBZA is Ritesh\'s flagship digital agency brand. It focuses on clean code, responsive mobile design, fast loading speeds, and user-friendly interfaces tailored to modern client needs.',
        tech: JSON.stringify(['HTML5', 'CSS3', 'JavaScript', 'React', 'Tailwind CSS', 'UI/UX']),
        image: 'assets/images/webza.svg',
        video_url: '',
        github_url: 'https://github.com/riteshsingh02010',
        demo_url: '',
        download_url: '',
        download_label: '',
        features: JSON.stringify([
          'Bespoke modern responsive website architecture',
          'Fast loading speeds with zero layout shifts',
          'SEO-friendly semantic markup and accessibility compliance',
          'Custom brand identity and digital asset integration'
        ]),
        learning_outcome: 'Hands-on client-facing web architecture, design token management, and project scoping.',
        sort_order: 1
      },
      {
        id: 'aura-app',
        title: 'AURA MUSIC',
        visual_label: 'AURA MUSIC // OPEN SOURCE',
        category: 'Open Source Mobile App',
        status: 'Release APK',
        status_type: 'active',
        featured: 1,
        description: 'An open-source Android music streaming and downloading application. Stream, discover, and download high-quality music completely ad-free with background playback and offline caching.',
        details: 'Aura Music is an open-source, ad-free music application built for music lovers who value privacy, speed, and offline access. It enables users to search, stream, and directly download high-fidelity audio tracks without interruptions, paywalls, or intrusive advertisements. Built with native Android packaging, background audio services, and cached offline storage.',
        tech: JSON.stringify(['Open Source', 'Android APK', 'Music Streaming', 'Ad-Free', 'Offline Download', 'Background Audio']),
        image: 'assets/images/aura-app.svg',
        video_url: '',
        github_url: 'https://github.com/riteshsingh2563-ship-it/ritesh-portfolio',
        demo_url: '',
        download_url: 'assets/Aura-Music.apk',
        download_label: 'Download Aura Music APK (26 MB)',
        features: JSON.stringify([
          '100% Ad-free streaming and uninterrupted playback',
          'Direct high-quality music download for offline listening',
          'Background audio playback with lock screen media controls',
          'Open-source codebase with lightweight, battery-efficient design',
          'Clean dark-mode mobile interface with instant search'
        ]),
        learning_outcome: 'Engineered native Android media services, offline audio caching, and ad-free open-source app architecture.',
        sort_order: 2
      },
      {
        id: 'nexvix-media',
        title: 'NEXVIX MEDIA',
        visual_label: 'NEXVIX / AGENCY',
        category: 'Digital & AI Agency Concept',
        status: 'Agency Concept',
        status_type: 'concept',
        featured: 1,
        description: 'A digital and AI marketing agency concept designed to help businesses scale through targeted digital marketing, influencer marketing, social media, and AI-driven growth workflows.',
        details: 'Conceived to bridge modern AI tools with business marketing needs. Nexvix Media focuses on automating creative asset production, managing multi-platform social distribution, and structuring influencer marketing campaigns with measurable ROI.',
        tech: JSON.stringify(['AI Marketing', 'Social Media Strategy', 'Canva', 'CapCut', 'Campaign Management']),
        image: 'assets/images/nexvix.svg',
        video_url: '',
        github_url: '',
        demo_url: '',
        download_url: '',
        download_label: '',
        features: JSON.stringify([
          'AI-assisted copywriting and social media content pipelines',
          'Influencer campaign structuring and creator outreach protocols',
          'Multi-channel digital marketing blueprints for local businesses',
          'Brand voice synthesis and audience retention frameworks'
        ]),
        learning_outcome: 'Deep understanding of digital marketing funnels, client service models, and integrating AI to 10x agency productivity.',
        sort_order: 2
      },
      {
        id: 'boostmybrand-ai',
        title: 'BOOSTMYBRAND.AI',
        visual_label: 'BOOST / AI STARTUP',
        category: 'AI Startup Concept',
        status: 'Startup Concept',
        status_type: 'concept',
        featured: 1,
        description: 'An AI-powered digital marketing business concept designed around helping brands optimize their online presence, enhance discoverability, and automate brand content generation.',
        details: 'BoostMyBrand.ai explores how generative AI models can be packaged into simple, actionable tools for entrepreneurs. The platform concept includes automated SEO meta-tag generation, social caption crafting, competitor tone analysis, and digital brand scorecards.',
        tech: JSON.stringify(['Generative AI', 'Gemini API', 'Prompt Engineering', 'Web Architecture', 'SaaS Concept']),
        image: 'assets/images/boostmybrand.svg',
        video_url: '',
        github_url: '',
        demo_url: '',
        download_url: '',
        download_label: '',
        features: JSON.stringify([
          'AI-driven content generation tailored to unique brand voices',
          'Digital presence health check and SEO optimization recommendations',
          'Automated social post planning and hashtag generation',
          'Simplified user dashboard designed for non-technical business owners'
        ]),
        learning_outcome: 'Exploration of software-as-a-service (SaaS) business models, AI prompt pipelines, and product-market fit evaluation.',
        sort_order: 3
      },
      {
        id: 'influencer-system',
        title: 'INFLUENCER MARKETING SYSTEM',
        visual_label: 'INFLUENCER / SYSTEM',
        category: 'Business & Platform Concept',
        status: 'Business Concept',
        status_type: 'concept',
        featured: 0,
        description: 'A business concept and matchmaking system involving discovering suitable creators and influencers, connecting them with brands, and managing end-to-end campaigns.',
        details: 'Solves the friction between small-to-medium businesses and creators. The system framework outlines creator vetting, niche classification (micro vs macro), automated pitch templates, deliverable tracking, and ROI verification.',
        tech: JSON.stringify(['Influencer CRM', 'Analytics Modeling', 'Workflow Automation', 'Social APIs']),
        image: 'assets/images/influencer.svg',
        video_url: '',
        github_url: '',
        demo_url: '',
        download_url: '',
        download_label: '',
        features: JSON.stringify([
          'Categorized creator discovery across YouTube, Instagram, and niche blogs',
          'Standardized campaign briefing and timeline management',
          'Performance tracking metrics (reach, engagement, conversion tracking)',
          'Escrow and payment release milestone structure'
        ]),
        learning_outcome: 'Insight into creator economy dynamics, brand sponsorship agreements, and workflow automation.',
        sort_order: 4
      },
      {
        id: 'service-marketplace',
        title: 'ON-DEMAND SERVICE MARKETPLACE',
        visual_label: 'SERVICE / APP',
        category: 'Marketplace Application Concept',
        status: 'App Concept',
        status_type: 'concept',
        featured: 1,
        description: 'A marketplace-style mobile application concept inspired by on-demand local services such as AC repair, doorstep car wash, maid/home assistance, and urgent medicine delivery.',
        details: 'Designed with a dual-sided marketplace architecture: a consumer portal for ordering and live tracking, and a service-provider portal for accepting bookings. Addresses common urban pain points with location-aware dispatching and transparent pricing.',
        tech: JSON.stringify(['Mobile App Architecture', 'Capacitor', 'React', 'Geolocation', 'Marketplace Mechanics']),
        image: 'assets/images/marketplace.svg',
        video_url: '',
        github_url: '',
        demo_url: '',
        download_url: '',
        download_label: '',
        features: JSON.stringify([
          'Multi-service catalog: AC maintenance, vehicle detailing, housekeeping, urgent pharmacy',
          'Live provider availability and geo-radius booking allocation',
          'Transparent pricing estimates and digital checkout options',
          'Ratings, reviews, and provider verification workflows'
        ]),
        learning_outcome: 'Understanding complex marketplace logistics, supply-demand balancing, and mobile user experience design.',
        sort_order: 5
      },
      {
        id: 'payment-gateway',
        title: 'PAYMENT GATEWAY SYSTEM',
        visual_label: 'PAYMENT / FINTECH',
        category: 'FinTech Learning & Concept',
        status: 'Architecture Study',
        status_type: 'concept',
        featured: 0,
        description: 'A project and learning concept around building a payment-gateway-style system, understanding payment infrastructure, security, and Razorpay integrations.',
        details: 'An in-depth study of modern FinTech infrastructure. Covers checkout tokenization, merchant API authentication, cryptographic signature verification (HMAC SHA-256), webhook handling, and handling edge cases like refund lifecycles and network drops.',
        tech: JSON.stringify(['Razorpay APIs', 'Webhooks', 'Node.js', 'Cryptographic Signatures', 'FinTech']),
        image: 'assets/images/payment.svg',
        video_url: '',
        github_url: '',
        demo_url: '',
        download_url: '',
        download_label: '',
        features: JSON.stringify([
          'Simulated checkout modal with order generation and status tracking',
          'Server-side webhook listener with idempotent processing',
          'Security validation and signature verification routines',
          'Comprehensive learning documentation on payment states and retries'
        ]),
        learning_outcome: 'Mastery of critical payment security concepts, API reliability, and webhook lifecycle management.',
        sort_order: 6
      },
      {
        id: 'trading-course',
        title: 'TRADING COURSE LANDING PAGE',
        visual_label: 'TRADING / LANDING',
        category: 'Web Design & Conversion',
        status: 'Design Prototype',
        status_type: 'prototype',
        featured: 0,
        description: 'A modern, high-conversion landing page concept focused on presenting an online trading curriculum with clear value propositions, mentor authority, and enrollment triggers.',
        details: 'Built to explore conversion rate optimization (CRO) principles. Features structured syllabus modules, sticky checkout calls-to-action, social proof student testimonial blocks, and interactive FAQ accordions.',
        tech: JSON.stringify(['HTML5', 'CSS Grid', 'JavaScript', 'Conversion Optimization', 'Canva']),
        image: 'assets/images/trading.svg',
        video_url: '',
        github_url: '',
        demo_url: '',
        download_url: '',
        download_label: '',
        features: JSON.stringify([
          'High-contrast financial editorial styling and visual hierarchy',
          'Interactive curriculum accordions with lesson previews',
          'Trust signals, risk disclaimers, and transparent pricing tiers',
          'Optimized mobile layout for fast social media traffic conversions'
        ]),
        learning_outcome: 'Principles of consumer psychology, sales page architecture, and high-impact visual storytelling.',
        sort_order: 7
      },
      {
        id: 'youtube-content',
        title: 'YOUTUBE & CONTENT LAB',
        visual_label: 'CONTENT / MEDIA',
        category: 'Video & Content Creation',
        status: 'Active Creative',
        status_type: 'active',
        featured: 1,
        description: 'Hands-on creative experimentation producing YouTube Shorts, anime edits, pacing optimization with CapCut, eye-catching Canva thumbnails, and audience retention strategies.',
        details: 'Ritesh treats content creation as an engineering discipline: analyzing viewer drop-off points, designing compelling hooks in the first 2 seconds, testing title variations, optimizing tags, and syncing audio beats with visual transitions.',
        tech: JSON.stringify(['CapCut', 'Canva', 'YouTube Shorts', 'Video Editing', 'Audience Retention', 'SEO']),
        image: 'assets/images/content.svg',
        video_url: '',
        github_url: '',
        demo_url: 'https://youtube.com/@riteshsingh',
        download_url: '',
        download_label: '',
        features: JSON.stringify([
          'Fast-paced vertical editing optimized for mobile viewers',
          'Custom high-CTR thumbnail compositions crafted in Canva',
          'Strategic title, tag, and description SEO for algorithm discovery',
          'Rhythmic sound design and visual punch-ins to maintain viewer engagement'
        ]),
        learning_outcome: 'Direct insights into algorithmic distribution, digital storytelling, and creative consistency.',
        sort_order: 8
      },
      {
        id: 'personal-portfolio',
        title: 'PERSONAL PORTFOLIO 2026',
        visual_label: 'PORTFOLIO / DEV',
        category: 'Full-Stack Web System',
        status: 'Live & Deployed',
        status_type: 'live',
        featured: 1,
        description: 'This complete full-stack portfolio and secure admin portal system — built with Node.js, Express, SQLite database, token-based authentication, and dynamic CMS capabilities.',
        details: 'A developer-first flagship project featuring real SQLite persistence, protected admin management routes, media upload handling, live contact message storage, and synchronized public rendering.',
        tech: JSON.stringify(['Node.js', 'Express', 'SQLite', 'REST API', 'JavaScript', 'CSS3', 'Session Auth']),
        image: 'assets/images/webza.svg',
        video_url: '',
        github_url: 'https://github.com/riteshsingh02010',
        demo_url: '#top',
        download_url: 'assets/Ritesh-Singh-Resume.pdf',
        download_label: 'Download Resume PDF',
        features: JSON.stringify([
          'Full-stack architecture with native SQLite database persistence',
          'Protected admin portal with salted scrypt auth & session tokens',
          'Real contact form backend storing messages in database',
          'Complete CRUD for projects, skills, music, resume, and profile'
        ]),
        learning_outcome: 'End-to-end full-stack engineering, API security, and database normalization.',
        sort_order: 9
      }
    ];

    const insertProject = db.prepare(`
      INSERT INTO projects (
        id, title, visual_label, category, status, status_type, featured,
        description, details, tech, image, video_url, github_url, demo_url,
        download_url, download_label, features, learning_outcome, sort_order
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    for (const p of defaultProjects) {
      insertProject.run(
        p.id, p.title, p.visual_label, p.category, p.status, p.status_type, p.featured,
        p.description, p.details, p.tech, p.image, p.video_url, p.github_url, p.demo_url,
        p.download_url, p.download_label, p.features, p.learning_outcome, p.sort_order
      );
    }
  }

  // 5. Seed Music
  const musicCheck = db.prepare('SELECT COUNT(*) as count FROM music').get();
  if (musicCheck.count === 0) {
    const defaultMusic = [
      {
        id: 'track-1',
        title: 'Midnight Focus',
        artist: 'Ritesh Singh',
        genre: 'Lo-Fi Coding Beats',
        description: 'Gentle, repetitive harmonic chimes designed for late-night programming sessions and deep work.',
        duration: '0:10',
        artwork: 'assets/images/track-chill.svg',
        audio_url: 'assets/audio/midnight-focus.wav',
        visible: 1,
        sort_order: 1
      },
      {
        id: 'track-2',
        title: 'Synthesis 2026',
        artist: 'Ritesh Singh',
        genre: 'Cyber Electronic',
        description: 'Futuristic electronic sequence reflecting high-tech exploration, automation, and digital momentum.',
        duration: '0:08',
        artwork: 'assets/images/track-cyber.svg',
        audio_url: 'assets/audio/synthesis-2026.wav',
        visible: 1,
        sort_order: 2
      },
      {
        id: 'track-3',
        title: 'Deep Residue',
        artist: 'Ritesh Singh',
        genre: 'Soundscape',
        description: 'Calm, expansive low-frequency resonance ideal for focus, reading, and conceptual thinking.',
        duration: '0:12',
        artwork: 'assets/images/track-ambient.svg',
        audio_url: 'assets/audio/deep-residue.wav',
        visible: 1,
        sort_order: 3
      }
    ];

    const insertMusic = db.prepare(`
      INSERT INTO music (id, title, artist, genre, description, duration, artwork, audio_url, visible, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const m of defaultMusic) {
      insertMusic.run(m.id, m.title, m.artist, m.genre, m.description, m.duration, m.artwork, m.audio_url, m.visible, m.sort_order);
    }
  }

  // 6. Seed Resume
  const resumeCheck = db.prepare('SELECT COUNT(*) as count FROM resume').get();
  if (resumeCheck.count === 0) {
    db.prepare(`
      INSERT INTO resume (id, title, filename, url, last_updated, visible)
      VALUES (1, ?, ?, ?, ?, 1)
    `).run(
      'Ritesh Singh — Professional Resume',
      'Ritesh-Singh-Resume.pdf',
      'assets/Ritesh-Singh-Resume.pdf',
      'September 2026'
    );
  }
}

// Run initial seed
seedDatabase();

module.exports = {
  db,
  hashPassword
};
