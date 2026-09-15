const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => mocks[name] ?? require(name), mod, mod.exports);
  return mod.exports;
}
const codec = load('src/features/discovery/public-id.ts');
const { competitionShortcuts } = load('src/features/today/competition-shortcuts.ts', { '../discovery/public-id': codec });
const id = 'ad62f10b-d419-45d8-a559-02c51940433d';
test('league shortcuts preserve canonical identity in all six locales', () => {
  for (const locale of ['en', 'es', 'fr', 'de', 'it', 'pt']) {
    const [item] = competitionShortcuts([{ id, name: 'Champions League', countryCode: 'EUR' }], locale);
    assert.equal(item.href, `/${locale}/competitions/${codec.entitySlug('Champions League', id)}`);
    assert.equal(codec.encodedEntityId(item.href.split('/').at(-1)), id);
    assert.ok(!item.href.includes('premier-league'));
  }
});
test('missing, duplicate and invalid league identities cannot create fake shortcuts', () => {
  assert.deepEqual(competitionShortcuts([], 'en'), []);
  assert.deepEqual(competitionShortcuts([{ id: 'premier-league', name: 'Premier League' }], 'en'), []);
  const league = { id, name: 'Ligue des champions', countryCode: 'EUR' };
  assert.equal(competitionShortcuts([league, league], 'fr').length, 1);
});
test('all Today views share the Oracle gauge and have no duplicate intelligence panel', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/features/today/today-experience.tsx'), 'utf8');
  assert.ok(source.includes('<OracleGauge score={market.confidence} compact />'));
  assert.ok(source.includes('<OracleGauge score={selectedMarket.confidence} />'));
  assert.ok(source.includes('{market.confidence}/100'));
  assert.ok(!source.includes('<MarketIntelligence'));
  assert.ok(!source.includes('styles.valueEvidence'));
  assert.ok(!source.includes('Math.round(market.probability * 100)'));
  assert.ok(!source.includes('Math.round(selectedMarket.probability * 100)'));
  assert.ok(source.includes('const SHOW_TODAY_COMPETITION_FOLLOWING = false'));
});
