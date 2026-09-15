const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), ts = require('typescript');
function load(file) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(require, module, module.exports);
  return module.exports;
}
const { valueMarket } = load('src/features/today/value-picks.ts');
const { predictionMarketLabel } = load('src/i18n/prediction-markets.ts');
const { predictionMarkets } = load('src/features/today/types.ts');
const now = Date.parse('2026-09-14T10:00:00Z');
function market(overrides = {}) { return { available: true, valueAnalysis: { probability: .6, decimalOdds: 2, edge: .1, expectedValue: .2, kellyScore: .2, capturedAt: '2026-09-14T09:00:00Z', ...overrides } }; }
function fixture(markets = { BTTS: market() }) { return { state: 'scheduled', kickoffAt: '2026-09-14T18:00:00Z', markets }; }
test('Value selects the highest positive ranking; Top additionally requires probability at least 50%', () => {
  const match = fixture({ BTTS: market(), REGULAR: market({ probability: .4, kellyScore: .3 }) });
  assert.equal(valueMarket(match, false, now), 'REGULAR');
  assert.equal(valueMarket(match, true, now), 'BTTS');
});
test('expired, future, non-positive and unavailable prices cannot become Value picks', () => {
  for (const overrides of [{ capturedAt: '2026-09-13T09:00:00Z' }, { capturedAt: '2026-09-14T11:00:00Z' }, { expectedValue: 0 }, { edge: 0 }, { kellyScore: NaN }]) {
    assert.equal(valueMarket(fixture({ BTTS: market(overrides) }), false, now), null);
  }
  assert.equal(valueMarket(fixture({ BTTS: { ...market(), available: false } }), false, now), null);
});
test('live, finished, kicked-off and invalid-dated fixtures are excluded', () => {
  for (const override of [{ state: 'live' }, { state: 'finished' }, { kickoffAt: '2026-09-14T10:00:00Z' }, { kickoffAt: 'invalid' }]) {
    assert.equal(valueMarket({ ...fixture(), ...override }, false, now), null);
  }
});
test('all sixteen supported market labels exist in every product language', () => {
  assert.equal(predictionMarkets.length, 16);
  for (const locale of ['en', 'fr', 'es', 'de', 'it', 'pt']) for (const market of predictionMarkets) {
    assert.ok(predictionMarketLabel(locale, market));
    assert.ok(!predictionMarketLabel(locale, market).includes('_'));
  }
});
