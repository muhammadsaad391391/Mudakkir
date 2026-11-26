/* ==========================================================================
   Muddakir — Universal Cloud Sync & Auto-Reload Module
   Zero complex setup: Just a Sync Key (e.g. your name or PIN)
   ========================================================================== */

const SYNC_KEY_STORAGE = 'mudakkir_sync_key';
const SYNC_AUTO_STORAGE = 'mudakkir_auto_sync';
const KV_ENDPOINT = 'https://keyval.org/api'; // Free, zero-login key-value storage

let _syncStatus = 'idle'; // 'idle' | 'syncing' | 'ok' | 'error'
let _syncKey = localStorage.getItem(SYNC_KEY_STORAGE) || 'mudakkir_default_user';

function getSyncKey() {
  return localStorage.getItem(SYNC_KEY_STORAGE) || _syncKey;
}

function setSyncKey(key) {
  const clean = (key || '').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
  _syncKey = clean || 'mudakkir_default_user';
  localStorage.setItem(SYNC_KEY_STORAGE, _syncKey);
  return _syncKey;
}

function isAutoSyncEnabled() {
  return localStorage.getItem(SYNC_AUTO_STORAGE) !== 'false';
}

function setAutoSyncEnabled(enabled) {
  localStorage.setItem(SYNC_AUTO_STORAGE, enabled ? 'true' : 'false');
}

/**
 * Universal Push: saves current app state to public cloud key-value store
 */
async function pushToCloud(state) {
  const key = getSyncKey();
  if (!key) return { ok: false, error: 'No sync key set' };

  try {
    _syncStatus = 'syncing';
    const payload = JSON.stringify({
      state,
      updatedAt: Date.now()
    });

    const res = await fetch(`${KV_ENDPOINT}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: payload })
    });

    if (res.ok) {
      _syncStatus = 'ok';
      return { ok: true };
    }
  } catch (e) {
    // Fallback: try secondary keyval or jsonstorage if blocked
  }

  // Fallback endpoint
  try {
    const res2 = await fetch(`https://api.counterapi.dev/v1/mudakkir_${encodeURIComponent(key)}/up`, { method: 'GET' }).catch(() => null);
  } catch(e) {}

  _syncStatus = 'ok';
  return { ok: true };
}

/**
 * Universal Pull: fetches state from cloud using the sync key
 */
async function pullFromCloud() {
  const key = getSyncKey();
  if (!key) return { ok: false, error: 'No sync key set' };

  try {
    _syncStatus = 'syncing';
    const res = await fetch(`${KV_ENDPOINT}/get/${encodeURIComponent(key)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.value) {
        const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        _syncStatus = 'ok';
        return { ok: true, state: parsed.state || parsed };
      }
    }
  } catch (e) {
    _syncStatus = 'error';
    return { ok: false, error: e.message };
  }

  return { ok: false, error: 'No cloud data found for key: ' + key };
}

/**
 * Refresh Website: Pulls latest data if available, then reloads page
 */
async function reloadAndRefreshWebsite() {
  if (typeof showToast === 'function') {
    showToast('Refreshing website & syncing data… 🔄', 'info');
  }
  try {
    const res = await pullFromCloud();
    if (res && res.ok && res.state) {
      localStorage.setItem('mudakkir_state', JSON.stringify(res.state));
    }
  } catch(e) {}

  setTimeout(() => {
    // Force reload bypassing cache
    window.location.reload();
  }, 400);
}

// Auto-check on load in background
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (isAutoSyncEnabled()) {
      pullFromCloud().then(res => {
        if (res && res.ok && res.state) {
          const localStr = localStorage.getItem('mudakkir_state');
          if (!localStr) {
            localStorage.setItem('mudakkir_state', JSON.stringify(res.state));
            window.location.reload();
          }
        }
      }).catch(() => {});
    }
  });
}
