// ── VayuMitra — Firebase: Auth, Firestore, Kanban Board ─────

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore, collection, addDoc,
  onSnapshot, doc, updateDoc,
  serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  clientUID, detectedLocation,
  setReports, setAdminLoggedIn, setUnsubscribe,
  showToast, resetForm,
  reports, adminLoggedIn, unsubscribe
} from './js/app.js';

import { showShareSection } from './share.js';

// ── Firebase Config ───────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyB1YpukI2RVBFIyEEUWE6g9JxyN1r4NqSY",
  authDomain:        "vayumitra-175e3.firebaseapp.com",
  projectId:         "vayumitra-175e3",
  storageBucket:     "vayumitra-175e3.firebasestorage.app",
  messagingSenderId: "331021813045",
  appId:             "1:331021813045:web:5fed113ac848a0dbe5787c"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// ── Submit Report → Firestore ─────────────────────────────────
window.submitReport = async function() {
  const type    = document.getElementById('pollution-type').value;
  const address = document.getElementById('address').value.trim();
  const city    = document.getElementById('city').value.trim();
  const name    = document.getElementById('reporter-name').value.trim();
  const phone   = document.getElementById('reporter-phone').value.trim();

  if (!type)    return showToast('⚠️', 'Select Pollution Type', 'Please choose what type of pollution you observed.', true);
  if (!address) return showToast('⚠️', 'Address Required', 'Please enter the location address.', true);
  if (!name)    return showToast('⚠️', 'Name Required', 'Please enter your full name.', true);
  if (!phone)   return showToast('⚠️', 'Phone Required', 'Please enter your mobile number.', true);

  setSubmitLoading(true);

  try {
    const docRef = await addDoc(collection(db, 'reports'), {
      uid:           clientUID,
      status:        'pending',
      pollutionType: type,
      description:   document.getElementById('description').value.trim(),
      incidentTime:  document.getElementById('incident-time').value,
      recurring:     document.getElementById('recurring').value,
      address:       address,
      city:          city,
      state:         document.getElementById('state').value.trim(),
      pincode:       document.getElementById('pincode').value.trim(),
      reporterName:  name,
      phone:         phone,
      email:         document.getElementById('reporter-email').value.trim(),
      aadhar:        document.getElementById('reporter-aadhar').value.trim(),
      coords:        detectedLocation,
      timestamp:     serverTimestamp()
    });

    showToast('✅', 'Report Submitted!',
      `Report ID: ${docRef.id.substring(0,8).toUpperCase()} · UID: ${clientUID}`, false);

    showShareSection(docRef.id, type, address, city, clientUID);
    resetForm();

  } catch (err) {
    console.error(err);
    showToast('❌', 'Submission Failed', err.message, true);
  } finally {
    setSubmitLoading(false);
  }
};

function setSubmitLoading(on) {
  document.getElementById('submit-btn').disabled              = on;
  document.getElementById('submit-spinner').style.display     = on ? 'block' : 'none';
  document.getElementById('submit-text').textContent          = on ? 'Submitting...' : '⚡ Submit Report to Authorities';
}

// ── Admin Login ───────────────────────────────────────────────
window.adminLogin = async function() {
  const email = document.getElementById('admin-email').value.trim();
  const pwd   = document.getElementById('admin-pwd').value;
  const errEl = document.getElementById('login-error');

  errEl.style.display = 'none';

  if (!email || !pwd) {
    errEl.textContent   = '⚠️ Please enter both email and password.';
    errEl.style.display = 'block';
    return;
  }

  setLoginLoading(true);

  try {
    await signInWithEmailAndPassword(auth, email, pwd);
  } catch (err) {
    errEl.textContent   = '❌ ' + (err.code === 'auth/invalid-credential'
      ? 'Wrong email or password. Try again.'
      : err.message);
    errEl.style.display = 'block';
    const pwdInput = document.getElementById('admin-pwd');
    pwdInput.style.borderColor = 'var(--red)';
    setTimeout(() => { pwdInput.style.borderColor = ''; }, 2000);
  } finally {
    setLoginLoading(false);
  }
};

function setLoginLoading(on) {
  document.getElementById('login-btn').disabled          = on;
  document.getElementById('login-spinner').style.display = on ? 'block' : 'none';
  document.getElementById('login-text').textContent      = on ? 'Signing in...' : '🔓 Access Dashboard';
}

// ── Admin Logout ──────────────────────────────────────────────
window.adminLogout = async function() {
  await signOut(auth);
  if (unsubscribe) { unsubscribe(); setUnsubscribe(null); }
  setAdminLoggedIn(false);
  setReports([]);
  document.getElementById('admin-lock').style.display = '';
  document.getElementById('admin-content').classList.remove('unlocked');
  document.getElementById('admin-email').value        = '';
  document.getElementById('admin-pwd').value          = '';
  document.getElementById('login-error').style.display = 'none';
};

// ── Auth State Listener ───────────────────────────────────────
onAuthStateChanged(auth, user => {
  if (user) {
    setAdminLoggedIn(true);
    document.getElementById('admin-lock').style.display = 'none';
    document.getElementById('admin-content').classList.add('unlocked');
    startRealtimeListener();
  } else {
    setAdminLoggedIn(false);
  }
});

// ── Realtime Firestore Listener ───────────────────────────────
function startRealtimeListener() {
  if (unsubscribe) unsubscribe();

  const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));

  const unsub = onSnapshot(q,
    snapshot => {
      setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      renderBoard();
    },
    err => {
      console.error(err);
      showToast('❌', 'Database Error', err.message, true);
    }
  );

  setUnsubscribe(unsub);
}

// ── Render Kanban Board ───────────────────────────────────────
window.renderBoard = function() {
  if (!adminLoggedIn) return;

  const search       = document.getElementById('search-bar').value.toLowerCase();
  const statusFilter = document.getElementById('status-filter').value;

  const filtered = reports.filter(r => {
    const matchSearch =
      !search ||
      (r.uid           || '').toLowerCase().includes(search) ||
      (r.reporterName  || '').toLowerCase().includes(search) ||
      (r.address       || '').toLowerCase().includes(search) ||
      (r.city          || '').toLowerCase().includes(search) ||
      (r.pollutionType || '').toLowerCase().includes(search);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending  = filtered.filter(r => r.status === 'pending');
  const urgent   = filtered.filter(r => r.status === 'urgent');
  const rejected = filtered.filter(r => r.status === 'rejected');

  document.getElementById('stat-total').textContent    = reports.length;
  document.getElementById('stat-pending').textContent  = reports.filter(r => r.status === 'pending').length;
  document.getElementById('stat-urgent').textContent   = reports.filter(r => r.status === 'urgent').length;
  document.getElementById('stat-rejected').textContent = reports.filter(r => r.status === 'rejected').length;

  document.getElementById('cnt-pending').textContent  = pending.length;
  document.getElementById('cnt-urgent').textContent   = urgent.length;
  document.getElementById('cnt-rejected').textContent = rejected.length;

  renderColumn('body-pending',  pending,  false, true,  false);
  renderColumn('body-urgent',   urgent,   true,  false, false);
  renderColumn('body-rejected', rejected, false, false, true);
};

function renderColumn(bodyId, items, isUrgent, canMarkUrgent, isRejected) {
  const body = document.getElementById(bodyId);

  if (items.length === 0) {
    body.innerHTML = `
      <div class="empty-col">
        <span class="empty-icon">${isRejected ? '🚫' : isUrgent ? '✅' : '📭'}</span>
        <span>${isUrgent ? 'No urgent cases right now' : isRejected ? 'No rejections' : 'No pending reports'}</span>
      </div>`;
    return;
  }

  body.innerHTML = items.map((r, index) => {
    const reportNum  = 'RPT-' + String(index + 1).padStart(3, '0');
    const reportDate = r.timestamp?.toDate
      ? r.timestamp.toDate().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
      : 'Date unknown';
    const reportTime = r.timestamp?.toDate
      ? r.timestamp.toDate().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
      : '';

    return `
    <div class="report-card" onclick="openModal('${r.id}')">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
        <div class="rc-uid">📋 ${reportNum}</div>
        <span class="severity-badge sev-${r.status}">${(r.status || 'pending').toUpperCase()}</span>
      </div>
      <div class="rc-title">🏭 ${r.pollutionType || '—'}</div>
      <div class="rc-location">📍 ${r.address || '—'}${r.city ? ', ' + r.city : ''}</div>
      <div style="font-size:0.75rem;color:var(--muted);margin-bottom:0.3rem;">
        👤 ${r.reporterName || 'Anonymous'} &nbsp;·&nbsp; 📞 ${r.phone || '—'}
      </div>
      <div style="font-size:0.72rem;color:var(--muted);margin-bottom:0.5rem;">
        🕐 ${reportDate}${reportTime ? ' at ' + reportTime : ''} &nbsp;·&nbsp; 🪪 ${r.uid || '—'}
      </div>
      <div class="rc-actions" onclick="event.stopPropagation()">
        ${canMarkUrgent ? `<button class="rc-btn urgent-btn"  onclick="changeStatus('${r.id}','urgent')">🚨 Mark Urgent</button>` : ''}
        ${!isRejected   ? `<button class="rc-btn reject-btn"  onclick="changeStatus('${r.id}','rejected')">✕ Reject</button>` : ''}
        ${isRejected    ? `<button class="rc-btn restore-btn" onclick="changeStatus('${r.id}','pending')">↩ Restore</button>` : ''}
        ${isUrgent      ? `<button class="rc-btn"             onclick="changeStatus('${r.id}','pending')">↩ Move to Pending</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ── Change Report Status ──────────────────────────────────────
window.changeStatus = async function(id, newStatus) {
  try {
    await updateDoc(doc(db, 'reports', id), { status: newStatus });
  } catch (err) {
    showToast('❌', 'Update Failed', err.message, true);
  }
};

// ── Open Detail Modal ─────────────────────────────────────────
window.openModal = function(id) {
  const r = reports.find(r => r.id === id);
  if (!r) return;

  document.getElementById('modal-title').textContent = r.pollutionType || 'Report Details';

  const ts = r.timestamp?.toDate
    ? r.timestamp.toDate().toLocaleString('en-IN')
    : '—';

  document.getElementById('modal-detail').innerHTML = `
    <div class="detail-row"><span class="detail-label">Report ID</span>    <span class="detail-value" style="font-family:monospace;color:var(--green)">${r.id}</span></div>
    <div class="detail-row"><span class="detail-label">Citizen UID</span>  <span class="detail-value" style="font-family:monospace">${r.uid || '—'}</span></div>
    <div class="detail-row"><span class="detail-label">Status</span>       <span class="detail-value"><span class="severity-badge sev-${r.status}">${(r.status||'').toUpperCase()}</span></span></div>
    <div class="detail-row"><span class="detail-label">Source</span>       <span class="detail-value">${r.pollutionType || '—'}</span></div>
    <div class="detail-row"><span class="detail-label">Location</span>     <span class="detail-value">${[r.address, r.city, r.state, r.pincode].filter(Boolean).join(', ')}</span></div>
    ${r.coords ? `<div class="detail-row"><span class="detail-label">GPS Coords</span><span class="detail-value" style="font-family:monospace">${r.coords.lat}°N, ${r.coords.lng}°E</span></div>` : ''}
    <div class="detail-row"><span class="detail-label">Reporter</span>     <span class="detail-value">${r.reporterName || '—'}</span></div>
    <div class="detail-row"><span class="detail-label">Phone</span>        <span class="detail-value">${r.phone || '—'}</span></div>
    ${r.email  ? `<div class="detail-row"><span class="detail-label">Email</span>  <span class="detail-value">${r.email}</span></div>` : ''}
    ${r.aadhar ? `<div class="detail-row"><span class="detail-label">Aadhar</span><span class="detail-value">${r.aadhar}</span></div>` : ''}
    <div class="detail-row"><span class="detail-label">Recurring</span>    <span class="detail-value">${r.recurring || '—'}</span></div>
    <div class="detail-row"><span class="detail-label">Submitted At</span> <span class="detail-value">${ts}</span></div>
    ${r.description ? `<div class="detail-row"><span class="detail-label">Description</span><span class="detail-value">${r.description}</span></div>` : ''}
  `;

  document.getElementById('modal').classList.add('open');
};

window.closeModal = function(e) {
  if (e.target === document.getElementById('modal')) {
    document.getElementById('modal').classList.remove('open');
  }
};
