const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { db, hashPassword } = require('./database/db');

// Load .env file natively without third-party dependencies
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        process.env[k.trim()] = v.join('=').trim();
      }
    }
  }
} catch (_) {}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB max
});

// Authentication Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-admin-token']) {
    token = req.headers['x-admin-token'];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing authentication token' });
  }

  const now = Date.now();
  const session = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > ?').get(token, now);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  req.adminId = session.admin_id;
  req.sessionToken = token;
  next();
}

/* ==========================================================================
   PUBLIC REST API
   ========================================================================== */

function parseArrayField(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}
  return String(val).split(',').map(s => s.trim()).filter(Boolean);
}

// 1. Full Portfolio Bundle (High Performance single query)
app.get('/api/portfolio', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get() || {};
    const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC, title ASC').all();
    const rawProjects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC').all();
    const music = db.prepare('SELECT * FROM music WHERE visible = 1 ORDER BY sort_order ASC').all();
    const resume = db.prepare('SELECT * FROM resume WHERE id = 1').get() || {};

    const projects = rawProjects.map(p => ({
      ...p,
      featured: Boolean(p.featured),
      tech: parseArrayField(p.tech),
      features: parseArrayField(p.features)
    }));

    res.json({
      profile,
      skills,
      projects,
      music,
      resume
    });
  } catch (err) {
    console.error('Error in /api/portfolio:', err);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

// 2. Real Contact Form Submission Endpoint
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }
    if (!message || message.trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    const insert = db.prepare(`
      INSERT INTO contact_submissions (name, email, message, ip_address)
      VALUES (?, ?, ?, ?)
    `);
    const result = insert.run(name.trim(), email.trim(), message.trim(), String(ip));

    res.status(201).json({
      success: true,
      id: Number(result.lastInsertRowid),
      message: 'Message delivered successfully to Ritesh Singh.'
    });
  } catch (err) {
    console.error('Error in /api/contact:', err);
    res.status(500).json({ error: 'Failed to save contact message' });
  }
});

/* ==========================================================================
   AUTHENTICATION API
   ========================================================================== */

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username.trim());
    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const hash = hashPassword(password, admin.salt);
    if (hash !== admin.password_hash) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate secure session token (valid for 7 days)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    db.prepare('INSERT INTO sessions (token, admin_id, expires_at) VALUES (?, ?, ?)').run(token, admin.id, expiresAt);

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (err) {
    console.error('Error in /api/auth/login:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify Current Session
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const admin = db.prepare('SELECT id, username, created_at FROM admins WHERE id = ?').get(req.adminId);
  res.json({
    authenticated: true,
    user: admin
  });
});

// Logout
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(req.sessionToken);
  res.json({ success: true, message: 'Logged out successfully' });
});

// Change Password
app.post('/api/auth/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.adminId);
  const currentHash = hashPassword(currentPassword, admin.salt);

  if (currentHash !== admin.password_hash) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  const newHash = hashPassword(newPassword, newSalt);

  db.prepare('UPDATE admins SET password_hash = ?, salt = ? WHERE id = ?').run(newHash, newSalt, admin.id);
  // Invalidate other sessions
  db.prepare('DELETE FROM sessions WHERE admin_id = ? AND token != ?').run(admin.id, req.sessionToken);

  res.json({ success: true, message: 'Password updated successfully' });
});

/* ==========================================================================
   PROTECTED ADMIN ENDPOINTS
   ========================================================================== */

// 1. Profile Management
app.put('/api/admin/profile', authMiddleware, (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM profile WHERE id = 1').get() || {};
    const {
      name = cur.name,
      role = cur.role,
      headline = cur.headline,
      bio = cur.bio,
      sub_bio = cur.sub_bio,
      email = cur.email,
      phone = cur.phone,
      location = cur.location,
      github = cur.github,
      youtube = cur.youtube,
      linkedin = cur.linkedin,
      instagram = cur.instagram,
      status_badge = cur.status_badge,
      avatar_url = cur.avatar_url
    } = req.body;

    db.prepare(`
      UPDATE profile SET
        name = ?, role = ?, headline = ?, bio = ?, sub_bio = ?, email = ?,
        phone = ?, location = ?, github = ?, youtube = ?, linkedin = ?,
        instagram = ?, status_badge = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      name ?? '', role ?? '', headline ?? '', bio ?? '', sub_bio ?? '', email ?? '',
      phone ?? '', location ?? '', github ?? '', youtube ?? '', linkedin ?? '',
      instagram ?? '', status_badge ?? '', avatar_url ?? ''
    );

    const updated = db.prepare('SELECT * FROM profile WHERE id = 1').get();
    res.json({ success: true, profile: updated });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile: ' + err.message });
  }
});

// 2. Skills Management
app.get('/api/admin/skills', authMiddleware, (req, res) => {
  const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC, title ASC').all();
  res.json(skills);
});

app.post('/api/admin/skills', authMiddleware, (req, res) => {
  try {
    const { title = '', category = 'Web Development', proficiency = 'Advanced', description = '', icon = 'code', sort_order = 0 } = req.body;
    const id = (req.body.id || title.toLowerCase().replace(/[^a-z0-9_-]/g, '-')).trim();

    db.prepare(`
      INSERT INTO skills (id, title, category, proficiency, description, icon, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, title ?? '', category ?? '', proficiency ?? 'Advanced', description ?? '', icon ?? 'code', Number(sort_order || 0)
    );

    const created = db.prepare('SELECT * FROM skills WHERE id = ?').get(id);
    res.status(201).json({ success: true, skill: created });
  } catch (err) {
    console.error('Error creating skill:', err);
    res.status(500).json({ error: 'Failed to create skill: ' + err.message });
  }
});

app.put('/api/admin/skills/:id', authMiddleware, (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id) || {};
    const {
      title = cur.title,
      category = cur.category,
      proficiency = cur.proficiency,
      description = cur.description,
      icon = cur.icon,
      sort_order = cur.sort_order
    } = req.body;

    db.prepare(`
      UPDATE skills SET
        title = ?, category = ?, proficiency = ?, description = ?, icon = ?, sort_order = ?
      WHERE id = ?
    `).run(
      title ?? '', category ?? '', proficiency ?? '', description ?? '', icon ?? '', Number(sort_order || 0), req.params.id
    );

    const updated = db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id);
    res.json({ success: true, skill: updated });
  } catch (err) {
    console.error('Error updating skill:', err);
    res.status(500).json({ error: 'Failed to update skill: ' + err.message });
  }
});

app.delete('/api/admin/skills/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Skill deleted' });
});

// 3. Projects Management
app.get('/api/admin/projects', authMiddleware, (req, res) => {
  const raw = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC').all();
  const projects = raw.map(p => ({
    ...p,
    featured: Boolean(p.featured),
    tech: parseArrayField(p.tech),
    features: parseArrayField(p.features)
  }));
  res.json(projects);
});

app.post('/api/admin/projects', authMiddleware, (req, res) => {
  try {
    const {
      title = '', visual_label = '', category = 'web', status = 'Concept', status_type = 'concept', featured = false,
      description = '', details = '', tech = [], image = 'assets/images/webza.svg', video_url = '', github_url = '',
      demo_url = '', download_url = '', download_label = 'Download', features = [], learning_outcome = '', sort_order = 0
    } = req.body;

    const id = (req.body.id || title.toLowerCase().replace(/[^a-z0-9_-]/g, '-')).trim();

    db.prepare(`
      INSERT INTO projects (
        id, title, visual_label, category, status, status_type, featured,
        description, details, tech, image, video_url, github_url, demo_url,
        download_url, download_label, features, learning_outcome, sort_order
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      id,
      title ?? '',
      visual_label || title || '',
      category ?? 'web',
      status || 'Concept',
      status_type || 'concept',
      featured ? 1 : 0,
      description ?? '',
      details ?? '',
      JSON.stringify(Array.isArray(tech) ? tech : (tech ? tech.split(',').map(s => s.trim()) : [])),
      image || 'assets/images/webza.svg',
      video_url ?? '',
      github_url ?? '',
      demo_url ?? '',
      download_url ?? '',
      download_label ?? 'Download',
      JSON.stringify(Array.isArray(features) ? features : (features ? features.split('\n').map(s => s.trim()) : [])),
      learning_outcome ?? '',
      Number(sort_order || 0)
    );

    const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.status(201).json({ success: true, project: created });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Failed to create project: ' + err.message });
  }
});

app.put('/api/admin/projects/:id', authMiddleware, (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) || {};
    const {
      title = cur.title,
      visual_label = cur.visual_label,
      category = cur.category,
      status = cur.status,
      status_type = cur.status_type,
      featured = cur.featured,
      description = cur.description,
      details = cur.details,
      tech = cur.tech,
      image = cur.image,
      video_url = cur.video_url,
      github_url = cur.github_url,
      demo_url = cur.demo_url,
      download_url = cur.download_url,
      download_label = cur.download_label,
      features = cur.features,
      learning_outcome = cur.learning_outcome,
      sort_order = cur.sort_order
    } = req.body;

    db.prepare(`
      UPDATE projects SET
        title = ?, visual_label = ?, category = ?, status = ?, status_type = ?,
        featured = ?, description = ?, details = ?, tech = ?, image = ?,
        video_url = ?, github_url = ?, demo_url = ?, download_url = ?,
        download_label = ?, features = ?, learning_outcome = ?, sort_order = ?
      WHERE id = ?
    `).run(
      title ?? '',
      visual_label ?? '',
      category ?? '',
      status ?? '',
      status_type ?? 'concept',
      featured ? 1 : 0,
      description ?? '',
      details ?? '',
      typeof tech === 'string' ? tech : JSON.stringify(Array.isArray(tech) ? tech : (tech ? tech.split(',').map(s => s.trim()) : [])),
      image ?? '',
      video_url ?? '',
      github_url ?? '',
      demo_url ?? '',
      download_url ?? '',
      download_label ?? '',
      typeof features === 'string' ? features : JSON.stringify(Array.isArray(features) ? features : (features ? features.split('\n').map(s => s.trim()) : [])),
      learning_outcome ?? '',
      Number(sort_order || 0),
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    res.json({ success: true, project: updated });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project: ' + err.message });
  }
});

app.patch('/api/admin/projects/:id/feature', authMiddleware, (req, res) => {
  const cur = db.prepare('SELECT featured FROM projects WHERE id = ?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'Project not found' });
  const nextVal = cur.featured ? 0 : 1;
  db.prepare('UPDATE projects SET featured = ? WHERE id = ?').run(nextVal, req.params.id);
  res.json({ success: true, featured: Boolean(nextVal) });
});

app.delete('/api/admin/projects/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Project deleted' });
});

// 4. Music Management
app.get('/api/admin/music', authMiddleware, (req, res) => {
  const tracks = db.prepare('SELECT * FROM music ORDER BY sort_order ASC').all();
  res.json(tracks);
});

app.post('/api/admin/music', authMiddleware, (req, res) => {
  try {
    const {
      title = '', artist = 'Ritesh Singh', genre = 'Ambient', description = '', duration = '0:00',
      artwork = 'assets/images/track-chill.svg', audio_url = '', visible = true, sort_order = 0
    } = req.body;
    const id = (req.body.id || `track-${Date.now()}`).trim();

    db.prepare(`
      INSERT INTO music (id, title, artist, genre, description, duration, artwork, audio_url, visible, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, title ?? '', artist ?? 'Ritesh Singh', genre ?? 'Ambient', description ?? '', duration ?? '0:00',
      artwork ?? 'assets/images/track-chill.svg', audio_url ?? '', visible !== false ? 1 : 0, Number(sort_order || 0)
    );

    const created = db.prepare('SELECT * FROM music WHERE id = ?').get(id);
    res.status(201).json({ success: true, track: created });
  } catch (err) {
    console.error('Error adding track:', err);
    res.status(500).json({ error: 'Failed to add track: ' + err.message });
  }
});

app.put('/api/admin/music/:id', authMiddleware, (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM music WHERE id = ?').get(req.params.id) || {};
    const {
      title = cur.title,
      artist = cur.artist,
      genre = cur.genre,
      description = cur.description,
      duration = cur.duration,
      artwork = cur.artwork,
      audio_url = cur.audio_url,
      visible = cur.visible,
      sort_order = cur.sort_order
    } = req.body;

    db.prepare(`
      UPDATE music SET
        title = ?, artist = ?, genre = ?, description = ?, duration = ?,
        artwork = ?, audio_url = ?, visible = ?, sort_order = ?
      WHERE id = ?
    `).run(
      title ?? '', artist ?? '', genre ?? '', description ?? '', duration ?? '',
      artwork ?? '', audio_url ?? '', visible ? 1 : 0, Number(sort_order || 0), req.params.id
    );

    const updated = db.prepare('SELECT * FROM music WHERE id = ?').get(req.params.id);
    res.json({ success: true, track: updated });
  } catch (err) {
    console.error('Error updating track:', err);
    res.status(500).json({ error: 'Failed to update track: ' + err.message });
  }
});

app.patch('/api/admin/music/:id/visibility', authMiddleware, (req, res) => {
  const cur = db.prepare('SELECT visible FROM music WHERE id = ?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'Track not found' });
  const nextVal = cur.visible ? 0 : 1;
  db.prepare('UPDATE music SET visible = ? WHERE id = ?').run(nextVal, req.params.id);
  res.json({ success: true, visible: Boolean(nextVal) });
});

app.delete('/api/admin/music/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM music WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Track deleted' });
});

// 5. Resume Management
app.put('/api/admin/resume', authMiddleware, (req, res) => {
  try {
    const cur = db.prepare('SELECT * FROM resume WHERE id = 1').get() || {};
    const {
      title = cur.title,
      filename = cur.filename,
      url = cur.url,
      last_updated = cur.last_updated,
      visible = cur.visible
    } = req.body;

    db.prepare(`
      UPDATE resume SET
        title = ?, filename = ?, url = ?, last_updated = ?, visible = ?
      WHERE id = 1
    `).run(
      title ?? '', filename ?? '', url ?? '', last_updated ?? '', visible !== false ? 1 : 0
    );

    const updated = db.prepare('SELECT * FROM resume WHERE id = 1').get();
    res.json({ success: true, resume: updated });
  } catch (err) {
    console.error('Error updating resume:', err);
    res.status(500).json({ error: 'Failed to update resume: ' + err.message });
  }
});

// 6. Contact Inbox Management
app.get('/api/admin/messages', authMiddleware, (req, res) => {
  const messages = db.prepare('SELECT * FROM contact_submissions ORDER BY created_at DESC').all();
  res.json(messages);
});

app.patch('/api/admin/messages/:id/read', authMiddleware, (req, res) => {
  db.prepare('UPDATE contact_submissions SET read_status = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.delete('/api/admin/messages/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM contact_submissions WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Message deleted' });
});

// 7. Real File Upload Endpoint (Images, Videos, PDFs, Audio)
app.post('/api/admin/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// 8. Database Export & Import
app.get('/api/admin/export', authMiddleware, (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
  const skills = db.prepare('SELECT * FROM skills').all();
  const projects = db.prepare('SELECT * FROM projects').all();
  const music = db.prepare('SELECT * FROM music').all();
  const resume = db.prepare('SELECT * FROM resume WHERE id = 1').get();
  const messages = db.prepare('SELECT * FROM contact_submissions').all();

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="ritesh-portfolio-backup.json"');
  res.json({
    timestamp: new Date().toISOString(),
    profile,
    skills,
    projects,
    music,
    resume,
    messages
  });
});

app.post('/api/admin/import', authMiddleware, (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.profile) {
      return res.status(400).json({ error: 'Invalid backup file payload' });
    }

    // Wrap in transaction
    db.exec('BEGIN TRANSACTION');

    if (data.profile) {
      const p = data.profile;
      db.prepare(`
        UPDATE profile SET
          name = ?, role = ?, headline = ?, bio = ?, sub_bio = ?, email = ?,
          phone = ?, location = ?, github = ?, youtube = ?, linkedin = ?,
          instagram = ?, status_badge = ?, avatar_url = ?
        WHERE id = 1
      `).run(
        p.name, p.role, p.headline, p.bio, p.sub_bio, p.email,
        p.phone, p.location, p.github, p.youtube, p.linkedin,
        p.instagram, p.status_badge, p.avatar_url
      );
    }

    if (Array.isArray(data.skills)) {
      db.prepare('DELETE FROM skills').run();
      const insertSkill = db.prepare(`
        INSERT INTO skills (id, title, category, proficiency, description, icon, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const s of data.skills) {
        insertSkill.run(s.id, s.title, s.category, s.proficiency, s.description, s.icon, s.sort_order);
      }
    }

    if (Array.isArray(data.projects)) {
      db.prepare('DELETE FROM projects').run();
      const insertProj = db.prepare(`
        INSERT INTO projects (
          id, title, visual_label, category, status, status_type, featured,
          description, details, tech, image, video_url, github_url, demo_url,
          download_url, download_label, features, learning_outcome, sort_order
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);
      for (const p of data.projects) {
        insertProj.run(
          p.id, p.title, p.visual_label, p.category, p.status, p.status_type, p.featured,
          p.description, p.details, typeof p.tech === 'string' ? p.tech : JSON.stringify(p.tech || []),
          p.image, p.video_url, p.github_url, p.demo_url, p.download_url, p.download_label,
          typeof p.features === 'string' ? p.features : JSON.stringify(p.features || []),
          p.learning_outcome, p.sort_order
        );
      }
    }

    if (Array.isArray(data.music)) {
      db.prepare('DELETE FROM music').run();
      const insertM = db.prepare(`
        INSERT INTO music (id, title, artist, genre, description, duration, artwork, audio_url, visible, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of data.music) {
        insertM.run(m.id, m.title, m.artist, m.genre, m.description, m.duration, m.artwork, m.audio_url, m.visible, m.sort_order);
      }
    }

    db.exec('COMMIT');
    res.json({ success: true, message: 'Database restored successfully' });
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Import error:', err);
    res.status(500).json({ error: 'Failed to import backup: ' + err.message });
  }
});

/* ==========================================================================
   STATIC ASSETS & ROUTING
   ========================================================================== */
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Fallback for clean single-page routes (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server Initialization
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`⚡ Ritesh Singh Portfolio & Admin System`);
    console.log(`🌐 Public Portfolio:  http://localhost:${PORT}`);
    console.log(`🔒 Secure Admin:      http://localhost:${PORT}/admin`);
    console.log(`🔑 Default Admin:     admin / ritesh2026`);
    console.log(`💾 Database:          SQLite (database/portfolio.db)`);
    console.log(`=================================================\n`);
  });
}

module.exports = app;
