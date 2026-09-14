/**
 * Ritesh Singh Portfolio — Admin Dashboard Controller
 * Full-Stack API Integration, Token-Based Auth, and Real-Time SQLite CRUD
 */

const state = {
  token: localStorage.getItem('admin_token'),
  portfolio: null,
  skills: [],
  projects: [],
  music: [],
  messages: []
};

// Helper: Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// Authenticated API Fetch Wrapper
async function api(endpoint, options = {}) {
  const headers = {
    'Authorization': `Bearer ${state.token}`,
    ...(options.headers || {})
  };

  const res = await fetch(endpoint, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API Request failed');
  return data;
}

// Auth Verification
async function verifyAuth() {
  if (!state.token) {
    window.location.href = '/login';
    return false;
  }
  try {
    const data = await api('/api/auth/me');
    document.getElementById('adminUsername').textContent = data.user.username;
    return true;
  } catch (err) {
    window.location.href = '/login';
    return false;
  }
}

// Tab Switching
function switchTab(tabName) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-content-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabName}`);
  });

  const titles = {
    overview: 'Overview',
    profile: 'Profile & Bio',
    skills: 'Skills & Stack',
    projects: 'Projects & Ventures',
    music: 'Music Showcase',
    resume: 'Resume Manager',
    messages: 'Contact Messages Inbox',
    settings: 'Backup & Settings'
  };
  document.getElementById('pageTitle').textContent = titles[tabName] || 'Dashboard';
}

/* ==========================================================================
   Data Loaders & Renderers
   ========================================================================== */

// 1. Overview
async function loadOverview() {
  try {
    const data = await api('/api/portfolio');
    state.portfolio = data;

    const msgs = await api('/api/admin/messages');
    state.messages = msgs;

    document.getElementById('statProjects').textContent = data.projects.length;
    document.getElementById('statSkills').textContent = data.skills.length;
    document.getElementById('statMusic').textContent = data.music.length;
    document.getElementById('statMessages').textContent = msgs.length;

    // Sidebar badge
    const badge = document.getElementById('sidebarMsgBadge');
    if (badge) {
      badge.textContent = msgs.length;
      badge.hidden = msgs.length === 0;
    }

    // Recent messages
    const tbody = document.getElementById('overviewRecentMsgs');
    if (tbody) {
      if (msgs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--admin-muted);">No messages yet.</td></tr>`;
      } else {
        tbody.innerHTML = msgs.slice(0, 5).map(m => `
          <tr>
            <td><strong>${escapeHtml(m.name)}</strong></td>
            <td>${escapeHtml(m.email)}</td>
            <td style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(m.message)}</td>
            <td style="font-family:var(--font-mono); font-size:11px;">${new Date(m.created_at).toLocaleDateString()}</td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Failed to load overview data:', err);
  }
}

// 2. Profile
async function loadProfile() {
  try {
    const data = await api('/api/portfolio');
    const p = data.profile;
    document.getElementById('profName').value = p.name || '';
    document.getElementById('profRole').value = p.role || '';
    document.getElementById('profHeadline').value = p.headline || '';
    document.getElementById('profStatusBadge').value = p.status_badge || '';
    document.getElementById('profEmail').value = p.email || '';
    document.getElementById('profPhone').value = p.phone || '';
    document.getElementById('profLocation').value = p.location || '';
    document.getElementById('profGithub').value = p.github || '';
    document.getElementById('profYoutube').value = p.youtube || '';
    document.getElementById('profLinkedin').value = p.linkedin || '';
    document.getElementById('profBio').value = p.bio || '';
    document.getElementById('profSubBio').value = p.sub_bio || '';
  } catch (err) {
    showToast('Failed to load profile', 'error');
  }
}

// 3. Skills
async function loadSkills() {
  try {
    const skills = await api('/api/admin/skills');
    state.skills = skills;
    const tbody = document.getElementById('skillsTableBody');
    if (!tbody) return;

    if (skills.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--admin-muted);">No skills created yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = skills.map((s, idx) => `
      <tr>
        <td><strong>${escapeHtml(s.title)}</strong></td>
        <td><span class="badge" style="background:var(--admin-sidebar); border:1px solid var(--admin-border);">${escapeHtml(s.category)}</span></td>
        <td><span style="color:var(--admin-emerald); font-family:var(--font-mono); font-size:11px;">${escapeHtml(s.proficiency)}</span></td>
        <td>${s.sort_order}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="editSkill('${s.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSkill('${s.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Failed to load skills', 'error');
  }
}

function editSkill(id) {
  const skill = state.skills.find(s => s.id === id);
  if (!skill) return;
  document.getElementById('skillId').value = skill.id;
  document.getElementById('skillTitle').value = skill.title;
  document.getElementById('skillCategory').value = skill.category;
  document.getElementById('skillProficiency').value = skill.proficiency;
  document.getElementById('skillSortOrder').value = skill.sort_order;
  document.getElementById('skillDesc').value = skill.description || '';

  document.getElementById('skillFormTitle').textContent = `Edit Skill: ${skill.title}`;
  document.getElementById('saveSkillBtn').textContent = 'Update Skill';
  document.getElementById('cancelSkillBtn').hidden = false;
  document.getElementById('skillTitle').focus();
}

function resetSkillForm() {
  document.getElementById('skillForm').reset();
  document.getElementById('skillId').value = '';
  document.getElementById('skillFormTitle').textContent = 'Add New Skill';
  document.getElementById('saveSkillBtn').textContent = 'Save Skill';
  document.getElementById('cancelSkillBtn').hidden = true;
}

async function deleteSkill(id) {
  if (!confirm('Are you sure you want to delete this skill?')) return;
  try {
    await api(`/api/admin/skills/${id}`, { method: 'DELETE' });
    showToast('Skill deleted');
    loadSkills();
    loadOverview();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 4. Projects
async function loadProjects() {
  try {
    const projects = await api('/api/admin/projects');
    state.projects = projects;
    const tbody = document.getElementById('projectsTableBody');
    if (!tbody) return;

    if (projects.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--admin-muted);">No projects found.</td></tr>`;
      return;
    }

    tbody.innerHTML = projects.map(p => `
      <tr>
        <td><strong>${escapeHtml(p.title)}</strong></td>
        <td>${escapeHtml(p.category)}</td>
        <td><span class="badge badge-${p.status_type}">${escapeHtml(p.status)}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="toggleFeatured('${p.id}')">
            ${p.featured ? '★ Featured' : '☆ Standard'}
          </button>
        </td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="editProject('${p.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProject('${p.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Failed to load projects', 'error');
  }
}

function editProject(id) {
  const p = state.projects.find(item => item.id === id);
  if (!p) return;

  document.getElementById('projId').value = p.id;
  document.getElementById('projTitle').value = p.title;
  document.getElementById('projVisualLabel').value = p.visual_label || '';
  document.getElementById('projCategory').value = p.category;
  document.getElementById('projStatus').value = p.status;
  document.getElementById('projStatusType').value = p.status_type || 'concept';
  document.getElementById('projFeatured').checked = Boolean(p.featured);
  document.getElementById('projDesc').value = p.description || '';
  document.getElementById('projDetails').value = p.details || '';
  document.getElementById('projTech').value = (p.tech || []).join(', ');
  document.getElementById('projImage').value = p.image || '';
  document.getElementById('projDemo').value = p.demo_url || '';
  document.getElementById('projGithub').value = p.github_url || '';
  document.getElementById('projDownload').value = p.download_url || '';
  document.getElementById('projDownloadLabel').value = p.download_label || '';
  document.getElementById('projFeatures').value = (p.features || []).join('\n');
  document.getElementById('projOutcome').value = p.learning_outcome || '';

  document.getElementById('projectFormTitle').textContent = `Edit Project: ${p.title}`;
  document.getElementById('saveProjBtn').textContent = 'Update Project';
  document.getElementById('cancelProjBtn').hidden = false;
  document.getElementById('projTitle').focus();
}

function resetProjectForm() {
  document.getElementById('projectForm').reset();
  document.getElementById('projId').value = '';
  document.getElementById('projectFormTitle').textContent = 'Add New Project or Venture';
  document.getElementById('saveProjBtn').textContent = 'Save Project';
  document.getElementById('cancelProjBtn').hidden = true;
}

async function toggleFeatured(id) {
  try {
    const res = await api(`/api/admin/projects/${id}/feature`, { method: 'PATCH' });
    showToast(res.featured ? 'Project marked as featured' : 'Project unfeatured');
    loadProjects();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteProject(id) {
  if (!confirm('Are you sure you want to delete this project?')) return;
  try {
    await api(`/api/admin/projects/${id}`, { method: 'DELETE' });
    showToast('Project deleted');
    loadProjects();
    loadOverview();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 5. Music
async function loadMusic() {
  try {
    const music = await api('/api/admin/music');
    state.music = music;
    const tbody = document.getElementById('musicTableBody');
    if (!tbody) return;

    if (music.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--admin-muted);">No audio tracks added.</td></tr>`;
      return;
    }

    tbody.innerHTML = music.map(m => `
      <tr>
        <td><strong>${escapeHtml(m.title)}</strong></td>
        <td>${escapeHtml(m.genre)}</td>
        <td>${escapeHtml(m.duration || '0:00')}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="toggleMusicVisibility('${m.id}')">
            ${m.visible ? '✓ Visible' : '✗ Hidden'}
          </button>
        </td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="editMusic('${m.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteMusic('${m.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Failed to load music tracks', 'error');
  }
}

function editMusic(id) {
  const m = state.music.find(item => item.id === id);
  if (!m) return;
  document.getElementById('trackId').value = m.id;
  document.getElementById('trackTitle').value = m.title;
  document.getElementById('trackArtist').value = m.artist;
  document.getElementById('trackGenre').value = m.genre;
  document.getElementById('trackDuration').value = m.duration || '';
  document.getElementById('trackAudioUrl').value = m.audio_url;
  document.getElementById('trackArtwork').value = m.artwork || '';
  document.getElementById('trackDesc').value = m.description || '';
  document.getElementById('trackVisible').checked = Boolean(m.visible);

  document.getElementById('musicFormTitle').textContent = `Edit Track: ${m.title}`;
  document.getElementById('saveTrackBtn').textContent = 'Update Track';
  document.getElementById('cancelTrackBtn').hidden = false;
  document.getElementById('trackTitle').focus();
}

function resetMusicForm() {
  document.getElementById('musicForm').reset();
  document.getElementById('trackId').value = '';
  document.getElementById('musicFormTitle').textContent = 'Add Music Track';
  document.getElementById('saveTrackBtn').textContent = 'Save Track';
  document.getElementById('cancelTrackBtn').hidden = true;
}

async function toggleMusicVisibility(id) {
  try {
    const res = await api(`/api/admin/music/${id}/visibility`, { method: 'PATCH' });
    showToast(res.visible ? 'Track is now public' : 'Track is now hidden');
    loadMusic();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteMusic(id) {
  if (!confirm('Are you sure you want to delete this audio track?')) return;
  try {
    await api(`/api/admin/music/${id}`, { method: 'DELETE' });
    showToast('Track deleted');
    loadMusic();
    loadOverview();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 6. Resume
async function loadResume() {
  try {
    const data = await api('/api/portfolio');
    const r = data.resume;
    document.getElementById('currentResumeTitle').textContent = r.title || 'Ritesh Singh — Professional Resume';
    document.getElementById('currentResumeFilename').textContent = r.filename || 'Ritesh-Singh-Resume.pdf';
    document.getElementById('currentResumeUpdated').textContent = r.last_updated || 'September 2026';
    document.getElementById('testResumeBtn').href = r.url;
  } catch (err) {
    showToast('Failed to load resume details', 'error');
  }
}

// 7. Messages
async function loadMessages() {
  try {
    const msgs = await api('/api/admin/messages');
    state.messages = msgs;
    const tbody = document.getElementById('messagesTableBody');
    if (!tbody) return;

    if (msgs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--admin-muted);">No messages received yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = msgs.map(m => `
      <tr>
        <td><strong>${escapeHtml(m.name)}</strong></td>
        <td><a href="mailto:${escapeHtml(m.email)}" style="color:var(--admin-cyan);">${escapeHtml(m.email)}</a></td>
        <td style="max-width:400px;">${escapeHtml(m.message)}</td>
        <td style="font-family:var(--font-mono); font-size:11px;">${new Date(m.created_at).toLocaleString()}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteMessage(${m.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Failed to load messages', 'error');
  }
}

async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  try {
    await api(`/api/admin/messages/${id}`, { method: 'DELETE' });
    showToast('Message deleted');
    loadMessages();
    loadOverview();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ==========================================================================
   File Upload Helper
   ========================================================================== */
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${state.token}` },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

/* ==========================================================================
   Form Event Handlers
   ========================================================================== */
function initForms() {
  // Profile Form
  document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: document.getElementById('profName').value,
        role: document.getElementById('profRole').value,
        headline: document.getElementById('profHeadline').value,
        status_badge: document.getElementById('profStatusBadge').value,
        email: document.getElementById('profEmail').value,
        phone: document.getElementById('profPhone').value,
        location: document.getElementById('profLocation').value,
        github: document.getElementById('profGithub').value,
        youtube: document.getElementById('profYoutube').value,
        linkedin: document.getElementById('profLinkedin').value,
        bio: document.getElementById('profBio').value,
        sub_bio: document.getElementById('profSubBio').value
      };
      await api('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showToast('Profile updated successfully!');
      loadOverview();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Skill Form
  document.getElementById('skillForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('skillId').value;
    const payload = {
      title: document.getElementById('skillTitle').value.trim(),
      category: document.getElementById('skillCategory').value.trim(),
      proficiency: document.getElementById('skillProficiency').value,
      sort_order: Number(document.getElementById('skillSortOrder').value),
      description: document.getElementById('skillDesc').value.trim()
    };

    try {
      if (id) {
        await api(`/api/admin/skills/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast('Skill updated');
      } else {
        await api('/api/admin/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast('Skill created');
      }
      resetSkillForm();
      loadSkills();
      loadOverview();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('cancelSkillBtn')?.addEventListener('click', resetSkillForm);

  // Project Form
  document.getElementById('projectForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('projId').value;
    let imgUrl = document.getElementById('projImage').value.trim();

    // Check if new media file was selected
    const fileInput = document.getElementById('projMediaFile');
    if (fileInput && fileInput.files[0]) {
      try {
        const uploadResult = await uploadFile(fileInput.files[0]);
        imgUrl = uploadResult.url;
      } catch (uploadErr) {
        showToast('Media upload failed: ' + uploadErr.message, 'error');
        return;
      }
    }

    const payload = {
      title: document.getElementById('projTitle').value.trim(),
      visual_label: document.getElementById('projVisualLabel').value.trim(),
      category: document.getElementById('projCategory').value.trim(),
      status: document.getElementById('projStatus').value.trim(),
      status_type: document.getElementById('projStatusType').value,
      featured: document.getElementById('projFeatured').checked,
      description: document.getElementById('projDesc').value.trim(),
      details: document.getElementById('projDetails').value.trim(),
      tech: document.getElementById('projTech').value,
      image: imgUrl || 'assets/images/webza.svg',
      demo_url: document.getElementById('projDemo').value.trim(),
      github_url: document.getElementById('projGithub').value.trim(),
      download_url: document.getElementById('projDownload').value.trim(),
      download_label: document.getElementById('projDownloadLabel').value.trim() || 'Download',
      features: document.getElementById('projFeatures').value,
      learning_outcome: document.getElementById('projOutcome').value.trim()
    };

    try {
      if (id) {
        await api(`/api/admin/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast('Project updated');
      } else {
        await api('/api/admin/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast('Project created');
      }
      resetProjectForm();
      loadProjects();
      loadOverview();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('cancelProjBtn')?.addEventListener('click', resetProjectForm);

  // Music Form
  document.getElementById('musicForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('trackId').value;
    let audioUrl = document.getElementById('trackAudioUrl').value.trim();

    // Check if audio file selected
    const audioFileInput = document.getElementById('trackAudioFile');
    if (audioFileInput && audioFileInput.files[0]) {
      try {
        const uploadResult = await uploadFile(audioFileInput.files[0]);
        audioUrl = uploadResult.url;
      } catch (uploadErr) {
        showToast('Audio file upload failed: ' + uploadErr.message, 'error');
        return;
      }
    }

    const payload = {
      title: document.getElementById('trackTitle').value.trim(),
      artist: document.getElementById('trackArtist').value.trim(),
      genre: document.getElementById('trackGenre').value.trim(),
      duration: document.getElementById('trackDuration').value.trim() || '0:10',
      audio_url: audioUrl,
      artwork: document.getElementById('trackArtwork').value.trim() || 'assets/images/track-chill.svg',
      description: document.getElementById('trackDesc').value.trim(),
      visible: document.getElementById('trackVisible').checked
    };

    try {
      if (id) {
        await api(`/api/admin/music/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast('Track updated');
      } else {
        await api('/api/admin/music', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast('Track added');
      }
      resetMusicForm();
      loadMusic();
      loadOverview();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('cancelTrackBtn')?.addEventListener('click', resetMusicForm);

  // Resume Upload Form
  document.getElementById('resumeUploadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('newResumeFile');
    if (!fileInput || !fileInput.files[0]) {
      showToast('Please select a PDF file', 'error');
      return;
    }

    const uploadBtn = document.getElementById('uploadResumeBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading file…';

    try {
      const file = fileInput.files[0];
      const uploadRes = await uploadFile(file);

      const payload = {
        title: document.getElementById('resumeDocTitle').value.trim() || 'Ritesh Singh — Professional Resume',
        filename: file.name,
        url: uploadRes.url,
        last_updated: document.getElementById('resumeUpdatedDate').value.trim() || 'September 2026',
        visible: true
      };

      await api('/api/admin/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      showToast('Resume published successfully!');
      fileInput.value = '';
      loadResume();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Upload & Publish Resume';
    }
  });

  // Change Password Form
  document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: document.getElementById('currentPassword').value,
          newPassword: document.getElementById('newPassword').value
        })
      });
      showToast('Password changed successfully!');
      e.target.reset();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Export Backup
  document.getElementById('exportBackupBtn')?.addEventListener('click', () => {
    window.location.href = `/api/admin/export?token=${state.token}`;
  });

  // Import Backup
  document.getElementById('importBackupInput')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        await api('/api/admin/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json)
        });
        showToast('Database imported successfully!');
        loadOverview();
        loadSkills();
        loadProjects();
        loadMusic();
        loadResume();
      } catch (err) {
        showToast('Import error: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  });

  // Nav Item click delegate
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      switchTab(tab);
      if (tab === 'overview') loadOverview();
      if (tab === 'profile') loadProfile();
      if (tab === 'skills') loadSkills();
      if (tab === 'projects') loadProjects();
      if (tab === 'music') loadMusic();
      if (tab === 'resume') loadResume();
      if (tab === 'messages') loadMessages();
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Global initialization
async function init() {
  const ok = await verifyAuth();
  if (!ok) return;

  initForms();
  loadOverview();
  loadProfile();
  loadSkills();
  loadProjects();
  loadMusic();
  loadResume();
  loadMessages();
}

document.addEventListener('DOMContentLoaded', init);
