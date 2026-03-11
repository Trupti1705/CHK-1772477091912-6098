// ── VayuMitra — App State, Tab Switching, GPS ───────────────

// ── App State ─────────────────────────────────────────────────
export let reports          = [];
export let adminLoggedIn    = false;
export let detectedLocation = null;
export let unsubscribe      = null;

export function setReports(val)          { reports = val; }
export function setAdminLoggedIn(val)    { adminLoggedIn = val; }
export function setDetectedLocation(val) { detectedLocation = val; }
export function setUnsubscribe(val)      { unsubscribe = val; }

// ── Citizen UID — persisted in localStorage ───────────────────
export let clientUID = localStorage.getItem('vayumitraUID');
if (!clientUID) {
  clientUID = 'CIT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  localStorage.setItem('vayumitraUID', clientUID);
}

document.addEventListener('DOMContentLoaded', () => {
  const uidEl = document.getElementById('client-uid');
  if (uidEl) uidEl.textContent = clientUID;
});

// ── Tab Switching ─────────────────────────────────────────────
window.switchTab = function(tab, e) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + tab).classList.add('active');
  if (e?.target) e.target.classList.add('active');
};

// ── GPS Detection ─────────────────────────────────────────────
window.detectGPS = function() {
  const mapText = document.getElementById('map-text');
  mapText.textContent = '📡 Detecting your location...';

  if (!navigator.geolocation) {
    mapText.textContent = '❌ Geolocation not supported by your browser.';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const loc = {
        lat: pos.coords.latitude.toFixed(5),
        lng: pos.coords.longitude.toFixed(5)
      };
      setDetectedLocation(loc);

      const coordsEl = document.getElementById('map-coords');
      coordsEl.style.display = 'inline-block';
      coordsEl.textContent   = `${loc.lat}°N, ${loc.lng}°E`;
      mapText.textContent    = '✅ Location detected successfully!';
      document.getElementById('map-box').style.borderColor = 'var(--green)';
    },
    () => {
      mapText.textContent = '❌ Could not detect. Please enter address manually.';
    }
  );
};

// ── Toast Notification ────────────────────────────────────────
export function showToast(icon, title, msg, isError) {
  document.getElementById('toast-icon').textContent  = icon;
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-msg').textContent   = msg;
  const toast = document.getElementById('toast');
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
}

// ── Photo Upload Preview ──────────────────────────────────────
export let photoDataUrl = null;

export function initPhotoUpload() {
  const photoInput = document.getElementById('photo-input');
  const uploadZone = document.getElementById('upload-zone');

  photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      photoDataUrl = e.target.result;
      const img = document.getElementById('preview-img');
      img.src = photoDataUrl;
      img.style.display = 'block';
      document.getElementById('photo-note').style.display = 'block';
      uploadZone.style.borderColor = 'var(--green)';
    };
    reader.readAsDataURL(file);
  });

  uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
  });

  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
      photoInput.files = e.dataTransfer.files;
      photoInput.dispatchEvent(new Event('change'));
    }
  });
}

// ── Reset Form After Submit ───────────────────────────────────
export function resetForm() {
  const photoInput = document.getElementById('photo-input');

  ['pollution-type','description','incident-time','address','city',
   'state','pincode','reporter-name','reporter-phone',
   'reporter-email','reporter-aadhar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  document.getElementById('recurring').value = 'first';
  photoDataUrl = null;
  document.getElementById('preview-img').style.display = 'none';
  document.getElementById('preview-img').src = '';
  document.getElementById('photo-note').style.display = 'none';
  document.getElementById('upload-zone').style.borderColor = '';
  photoInput.value = '';
  document.getElementById('map-text').textContent    = 'Click to auto-detect your GPS location';
  document.getElementById('map-coords').style.display = 'none';
  document.getElementById('map-box').style.borderColor = '';
  setDetectedLocation(null);
}
