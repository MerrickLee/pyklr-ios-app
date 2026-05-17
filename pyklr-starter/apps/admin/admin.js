// PYKLR Admin Dashboard — Supabase-powered
// Reads SUPABASE_URL and SUPABASE_ANON_KEY from localStorage or prompts
const SUPA_URL = localStorage.getItem('PYKLR_SUPA_URL') || prompt('Supabase URL:');
const SUPA_KEY = localStorage.getItem('PYKLR_SUPA_KEY') || prompt('Supabase Anon Key:');
if (SUPA_URL) localStorage.setItem('PYKLR_SUPA_URL', SUPA_URL);
if (SUPA_KEY) localStorage.setItem('PYKLR_SUPA_KEY', SUPA_KEY);

const sb = supabase.createClient(SUPA_URL, SUPA_KEY);

// ── Auth ──────────────────────────────────────────
async function handleLogin() {
  const email = document.getElementById('email').value;
  const pw = document.getElementById('password').value;
  const btn = document.getElementById('login-btn');
  btn.textContent = 'Signing in…';
  const { error } = await sb.auth.signInWithPassword({ email, password: pw });
  if (error) {
    document.getElementById('login-error').textContent = error.message;
    btn.textContent = 'Sign in';
  } else {
    showDashboard();
  }
}

async function handleLogout() {
  await sb.auth.signOut();
  localStorage.removeItem('PYKLR_SUPA_URL');
  localStorage.removeItem('PYKLR_SUPA_KEY');
  location.reload();
}

async function checkSession() {
  const { data } = await sb.auth.getSession();
  if (data?.session) showDashboard();
}

function showDashboard() {
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('dashboard-screen').classList.add('active');
  loadOverview();
}

// ── Navigation ────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

  const loaders = { overview: loadOverview, courts: loadCourts, users: loadUsers, events: loadEvents, reports: loadReports, forum: loadForum };
  if (loaders[tab]) loaders[tab]();
}

// ── Helpers ───────────────────────────────────────
function badge(status) {
  const cls = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', open: 'badge-open', published: 'badge-approved', flagged: 'badge-pending' };
  return `<span class="badge ${cls[status] || ''}">${status}</span>`;
}

function timeAgo(iso) {
  if (!iso) return '—';
  const d = new Date(iso); const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

// ── Overview ──────────────────────────────────────
async function loadOverview() {
  const [users, courts, events, posts] = await Promise.all([
    sb.from('profiles').select('*', { count: 'exact', head: true }),
    sb.from('courts').select('*', { count: 'exact', head: true }),
    sb.from('events').select('*', { count: 'exact', head: true }),
    sb.from('forum_posts').select('*', { count: 'exact', head: true }),
  ]);
  const pending = await sb.from('courts').select('*', { count: 'exact', head: true }).eq('status', 'pending');

  document.getElementById('stats').innerHTML = [
    { v: users.count ?? 0, l: 'Total Users' },
    { v: courts.count ?? 0, l: 'Total Courts' },
    { v: pending.count ?? 0, l: 'Pending Courts' },
    { v: events.count ?? 0, l: 'Events' },
    { v: posts.count ?? 0, l: 'Forum Posts' },
  ].map(s => `<div class="stat-card"><div class="value">${s.v}</div><div class="label">${s.l}</div></div>`).join('');

  // Recent users
  const { data: recentUsers } = await sb.from('profiles').select('display_name, username, created_at').order('created_at', { ascending: false }).limit(8);
  document.getElementById('recent-activity').innerHTML = recentUsers?.length
    ? `<table><thead><tr><th>User</th><th>Joined</th></tr></thead><tbody>${recentUsers.map(u =>
        `<tr><td><strong>${u.display_name || u.username}</strong></td><td>${timeAgo(u.created_at)}</td></tr>`
      ).join('')}</tbody></table>`
    : '<div class="empty">No recent activity</div>';
}

// ── Courts ────────────────────────────────────────
let courtFilter = 'all';
async function loadCourts() {
  let q = sb.from('courts').select('*').order('created_at', { ascending: false }).limit(50);
  if (courtFilter !== 'all') q = q.eq('status', courtFilter);
  const { data } = await q;

  document.getElementById('courts-table').innerHTML = data?.length
    ? `<table><thead><tr><th>Name</th><th>Type</th><th>Courts</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead><tbody>${data.map(c =>
        `<tr>
          <td><strong>${c.name}</strong><br><span style="color:var(--muted);font-size:11px">${c.address || '—'}</span></td>
          <td>${c.court_type}</td><td>${c.court_count}</td>
          <td>${badge(c.status)}</td><td>${timeAgo(c.created_at)}</td>
          <td>
            ${c.status === 'pending' ? `<button class="btn-sm btn-approve" onclick="courtAction('${c.id}','approved')">Approve</button> <button class="btn-sm btn-reject" onclick="courtAction('${c.id}','rejected')">Reject</button>` : '—'}
          </td>
        </tr>`
      ).join('')}</tbody></table>`
    : '<div class="empty">No courts found</div>';
}

function filterCourts(f) {
  courtFilter = f;
  document.querySelectorAll('#tab-courts .chip').forEach(c => c.classList.remove('active'));
  event.target.classList.add('active');
  loadCourts();
}

async function courtAction(id, status) {
  await sb.from('courts').update({ status }).eq('id', id);
  loadCourts(); loadOverview();
}

// ── Users ─────────────────────────────────────────
let userSearchTimeout;
async function loadUsers(search) {
  let q = sb.from('profiles').select('*').order('created_at', { ascending: false }).limit(50);
  if (search) q = q.or(`display_name.ilike.%${search}%,username.ilike.%${search}%`);
  const { data } = await q;

  document.getElementById('users-table').innerHTML = data?.length
    ? `<table><thead><tr><th>User</th><th>DUPR</th><th>Location</th><th>Joined</th><th>Status</th></tr></thead><tbody>${data.map(u =>
        `<tr>
          <td><strong>${u.display_name || '—'}</strong><br><span style="color:var(--muted);font-size:11px">@${u.username}</span></td>
          <td>${u.dupr_verified ? `${u.dupr_rating} ✓` : u.self_rating || '—'}</td>
          <td>${u.location_city || '—'}</td>
          <td>${timeAgo(u.created_at)}</td>
          <td>${u.available_to_match ? badge('approved') : '—'}</td>
        </tr>`
      ).join('')}</tbody></table>`
    : '<div class="empty">No users found</div>';
}

function searchUsers(val) {
  clearTimeout(userSearchTimeout);
  userSearchTimeout = setTimeout(() => loadUsers(val), 300);
}

// ── Events ────────────────────────────────────────
async function loadEvents() {
  const { data } = await sb.from('events').select('*').order('starts_at', { ascending: false }).limit(50);
  document.getElementById('events-table').innerHTML = data?.length
    ? `<table><thead><tr><th>Name</th><th>Format</th><th>Skill</th><th>Max</th><th>Status</th><th>Date</th></tr></thead><tbody>${data.map(e =>
        `<tr>
          <td><strong>${e.name}</strong></td>
          <td>${e.format}</td>
          <td>${e.skill_min && e.skill_max ? `${e.skill_min}–${e.skill_max}` : '—'}</td>
          <td>${e.max_players}</td>
          <td>${badge(e.status)}</td>
          <td>${new Date(e.starts_at).toLocaleDateString()}</td>
        </tr>`
      ).join('')}</tbody></table>`
    : '<div class="empty">No events yet</div>';
}

// ── Reports ───────────────────────────────────────
async function loadReports() {
  const { data } = await sb.from('reports').select('*').order('created_at', { ascending: false }).limit(50);
  document.getElementById('reports-table').innerHTML = data?.length
    ? `<table><thead><tr><th>Type</th><th>Reason</th><th>Status</th><th>Reported</th><th>Actions</th></tr></thead><tbody>${data.map(r =>
        `<tr>
          <td>${r.report_type}</td><td>${r.reason || '—'}</td>
          <td>${badge(r.status)}</td><td>${timeAgo(r.created_at)}</td>
          <td>${r.status === 'pending' ? `<button class="btn-sm btn-approve" onclick="resolveReport('${r.id}','resolved')">Resolve</button> <button class="btn-sm btn-reject" onclick="resolveReport('${r.id}','dismissed')">Dismiss</button>` : '—'}</td>
        </tr>`
      ).join('')}</tbody></table>`
    : '<div class="empty">No reports 🎉</div>';
}

async function resolveReport(id, status) {
  await sb.from('reports').update({ status }).eq('id', id);
  loadReports();
}

// ── Forum ─────────────────────────────────────────
let forumFilter = 'all';
async function loadForum() {
  let q = sb.from('forum_posts').select('*').order('created_at', { ascending: false }).limit(50);
  if (forumFilter === 'flagged') q = q.eq('status', 'flagged');
  const { data } = await q;

  document.getElementById('forum-table').innerHTML = data?.length
    ? `<table><thead><tr><th>Title</th><th>Tag</th><th>Votes</th><th>Comments</th><th>Status</th><th>Actions</th></tr></thead><tbody>${data.map(p =>
        `<tr>
          <td><strong>${p.title}</strong></td>
          <td>${p.tag}</td><td>${p.upvotes}</td><td>${p.comment_count}</td>
          <td>${badge(p.status)}</td>
          <td><button class="btn-sm btn-reject" onclick="removePost('${p.id}')">Remove</button></td>
        </tr>`
      ).join('')}</tbody></table>`
    : '<div class="empty">No posts found</div>';
}

function filterForum(f) {
  forumFilter = f;
  document.querySelectorAll('#tab-forum .chip').forEach(c => c.classList.remove('active'));
  event.target.classList.add('active');
  loadForum();
}

async function removePost(id) {
  if (!confirm('Remove this post?')) return;
  await sb.from('forum_posts').update({ status: 'removed' }).eq('id', id);
  loadForum();
}

// ── Init ──────────────────────────────────────────
checkSession();
