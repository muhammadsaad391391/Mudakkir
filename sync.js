/* ==========================================================================
   Muddakir — Cloud Sync Module (Firebase Realtime Database)
   ========================================================================== */

const SYNC_CONFIG_KEY = 'mudakkir_firebase_config';
const SYNC_USER_KEY   = 'mudakkir_firebase_user';

// ── State ──────────────────────────────────────────────────────────────────
let _firebaseApp = null;
let _firebaseDb  = null;
let _syncUserId  = null;
let _syncEnabled = false;
let _syncStatus  = 'idle'; // 'idle' | 'syncing' | 'ok' | 'error'
let _onStatusChange = null;

// ── Public API ─────────────────────────────────────────────────────────────

function getSyncStatus()  { return _syncStatus; }
function isSyncEnabled()  { return _syncEnabled; }

function onSyncStatusChange(cb) { _onStatusChange = cb; }

function _setStatus(s) {
  _syncStatus = s;
  if (_onStatusChange) _onStatusChange(s);
}

/** Load saved config from localStorage */
function getSavedSyncConfig() {
  try {
    const raw = localStorage.getItem(SYNC_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function getSavedUserId() {
  return localStorage.getItem(SYNC_USER_KEY) || '';
}

/** Save config to localStorage */
function saveSyncConfig(config, userId) {
  localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
  localStorage.setItem(SYNC_USER_KEY, userId);
}

function clearSyncConfig() {
  localStorage.removeItem(SYNC_CONFIG_KEY);
  localStorage.removeItem(SYNC_USER_KEY);
  _firebaseApp = null;
  _firebaseDb  = null;
  _syncUserId  = null;
  _syncEnabled = false;
  _setStatus('idle');
}

/**
 * Initialise Firebase and test connectivity.
 * Returns { ok: true } or { ok: false, error: string }
 */
async function initSync(firebaseConfig, userId) {
  if (!firebaseConfig || !userId) return { ok: false, error: 'Missing config or user ID.' };

  try {
    _setStatus('syncing');

    // Dynamically import Firebase modules (compat CDN already loaded via index.html)
    if (!window.firebase) throw new Error('Firebase SDK not loaded.');

    // Initialise (or reuse existing) app
    if (_firebaseApp) {
      try { firebase.app('mudakkir'); }
      catch { _firebaseApp = firebase.initializeApp(firebaseConfig, 'mudakkir'); }
    } else {
      try { _firebaseApp = firebase.app('mudakkir'); }
      catch { _firebaseApp = firebase.initializeApp(firebaseConfig, 'mudakkir'); }
    }

    _firebaseDb  = firebase.database(_firebaseApp);
    _syncUserId  = userId.replace(/[.#$\[\]]/g, '_'); // sanitise for DB key
    _syncEnabled = true;

    // Test connection with a lightweight read
    await _firebaseDb.ref(`muddakir_users/${_syncUserId}/__ping`).set(Date.now());

    _setStatus('ok');
    return { ok: true };
  } catch (err) {
    _syncEnabled = false;
    _setStatus('error');
    return { ok: false, error: err.message };
  }
}

/**
 * Push local state to Firebase.
 * @param {object} state - full app state
 */
async function pushToCloud(state) {
  if (!_syncEnabled || !_firebaseDb || !_syncUserId) return { ok: false, error: 'Sync not configured.' };
  try {
    _setStatus('syncing');
    const payload = { ...state, _syncedAt: Date.now() };
    await _firebaseDb.ref(`muddakir_users/${_syncUserId}/state`).set(payload);
    _setStatus('ok');
    return { ok: true };
  } catch (err) {
    _setStatus('error');
    return { ok: false, error: err.message };
  }
}

/**
 * Pull state from Firebase.
 * Returns { ok: true, state } or { ok: false, error }
 */
async function pullFromCloud() {
  if (!_syncEnabled || !_firebaseDb || !_syncUserId) return { ok: false, error: 'Sync not configured.' };
  try {
    _setStatus('syncing');
    const snap = await _firebaseDb.ref(`muddakir_users/${_syncUserId}/state`).get();
    if (!snap.exists()) {
      _setStatus('ok');
      return { ok: true, state: null, message: 'No cloud data yet.' };
    }
    _setStatus('ok');
    return { ok: true, state: snap.val() };
  } catch (err) {
    _setStatus('error');
    return { ok: false, error: err.message };
  }
}

/**
 * Subscribe to real-time updates from Firebase.
 * cb(newState) is called whenever the cloud state changes.
 * Returns an unsubscribe function.
 */
function subscribeToCloud(cb) {
  if (!_syncEnabled || !_firebaseDb || !_syncUserId) return () => {};
  const ref = _firebaseDb.ref(`muddakir_users/${_syncUserId}/state`);
  const handler = ref.on('value', snap => {
    if (snap.exists()) cb(snap.val());
  });
  return () => ref.off('value', handler);
}

/** Try to restore sync from saved config on app load */
async function tryAutoConnect() {
  const cfg = getSavedSyncConfig();
  const uid = getSavedUserId();
  if (cfg && uid) {
    const result = await initSync(cfg, uid);
    return result;
  }
  return { ok: false, error: 'No saved config.' };
}
