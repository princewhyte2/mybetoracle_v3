const { test } = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), ts = require('typescript');
function load(file, imports = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => name in imports ? imports[name] : require(name), module, module.exports);
  return module.exports;
}
function client(stored = null, fail = false) {
  const calls = [];
  const sdk = { setConsent: value => calls.push(['consent', value.analytics_storage]), isSupported: async () => true,
    getAnalytics: () => { calls.push(['init']); if (fail) throw Error('blocked'); return {}; },
    logEvent: () => { calls.push(['event']); if (fail) throw Error('blocked'); } };
  const api = load('src/lib/analytics/client.ts', { 'firebase/analytics': sdk,
    '@/lib/firebase/app': { getFirebaseApp: () => ({}) }, '@/lib/firebase/config': { isMeasurementConfigured: () => true },
    './consent-storage': { getStoredConsent: () => stored } });
  return { api, calls };
}
test('Today events cannot initialize analytics without consent', async () => {
  global.window = {};
  for (const choice of [null, 'denied']) {
    const { api, calls } = client(choice); await api.trackEvent('today_viewed'); assert.deepEqual(calls, []);
  }
  delete global.window;
});
test('stored consent is applied before initialization, and withdrawal stops events', async () => {
  global.window = {};
  const { api, calls } = client('granted'); await api.trackEvent('today_viewed');
  assert.deepEqual(calls.slice(0, 3), [['consent', 'granted'], ['init'], ['event']]);
  await api.applyAnalyticsConsent(false); await api.trackEvent('today_viewed');
  assert.equal(calls.filter(([name]) => name === 'event').length, 1);
  delete global.window;
});
test('a first-visit grant works and optional SDK errors do not reject', async () => {
  global.window = {};
  const { api, calls } = client(); await api.trackEvent('today_viewed');
  await api.applyAnalyticsConsent(true); await api.trackEvent('today_viewed');
  assert.equal(calls.filter(([name]) => name === 'init').length, 1);
  const broken = client('granted', true); await assert.doesNotReject(() => broken.api.trackEvent('today_viewed'));
  delete global.window;
});
test('invalid, future, expired and inaccessible stored consent fails closed', () => {
  const storage = new Map(); global.window = { localStorage: { getItem: key => storage.get(key) ?? null } };
  const { getStoredConsent } = load('src/lib/analytics/consent-storage.ts');
  storage.set('mbo_analytics_consent', 'granted');
  for (const date of ['invalid', '2099-01-01', '2000-01-01']) { storage.set('mbo_analytics_consent_date', date); assert.equal(getStoredConsent(), null); }
  storage.set('mbo_analytics_consent_date', new Date().toISOString()); assert.equal(getStoredConsent(), 'granted');
  window.localStorage.getItem = () => { throw Error('disabled'); }; assert.equal(getStoredConsent(), null);
  delete global.window;
});
