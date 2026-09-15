const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), ts = require('typescript');
function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => name in mocks ? mocks[name] : require(name), mod, mod.exports);
  return mod.exports;
}
const presentation = load('src/features/discovery/market-presentation.ts');
const { locales, isLocale } = load('src/i18n/config.ts');
const labels = load('src/features/discovery/labels.ts');
const systemLabels = load('src/i18n/system-labels.ts');
const scoped = load('src/features/today/scoped-heading.ts', { '@/features/discovery/market-presentation': presentation });
let calls = [], empty = false;
const TodayExperience = () => null;
const moduleUnderTest = load('src/features/today/market-scope-page.tsx', {
  'server-only': {}, 'react': { cache: fn => fn }, 'next/link': () => null,
  'next/navigation': { notFound() { throw new Error('404') } },
  '@/features/today/today-experience': { TodayExperience },
  '@/features/today/runtime-labels': { todayRuntimeLabels: Object.fromEntries(locales.map(l => [l, {}])) },
  '@/features/today/today-service': { lagosDate: () => '2026-09-15', tomorrowLagosDate: () => '2026-09-16', TodayFeedError: class extends Error {},
    getTodayData: async query => { calls.push(query); return { totalMatches: empty ? 0 : 1, competitions: empty ? [] : [{ matches: [{}] }], pagination: { hasMore: false } } } },
  '@/features/discovery/discovery-service': presentation, '@/features/discovery/market-presentation': presentation,
  '@/features/discovery/labels': labels, '@/i18n/config': { locales, isLocale },
  '@/i18n/system-labels': systemLabels,
  './today-jsonld': { buildTodayItemListJsonLd: () => null },
  '@/i18n/localized-metadata': { localizedMetadata: (locale, route, title, description, index) => ({ locale, route, title, index }) },
  './scoped-heading': scoped, '@/app/[locale]/today/page.module.css': {},
});
const props = (marketSlug, locale='en', query={}) => ({ params: Promise.resolve({ locale, marketSlug }), searchParams: Promise.resolve(query) });
function findExperience(page) {
  const children = Array.isArray(page.props.children) ? page.props.children : [page.props.children];
  return children.find(child => child?.type === TodayExperience);
}
test('all market routes initialize the existing Today component with the exact market in six locales', async () => {
  for (const locale of locales) for (const [group, item] of Object.entries(presentation.marketPresentation)) {
    const page = await moduleUnderTest.MarketScopePage(props(item.slug, locale), 'today');
    const comp = findExperience(page);
    assert.ok(comp, `TodayExperience missing for ${item.slug} in ${locale}`);
    assert.equal(comp.props.initialMarket, group === 'ORACLE_PICK' ? 'best' : group);
    assert.equal(calls.at(-1).marketGroup, group);
  }
});
test('Value and Top use the same component and never inherit a market constraint', async () => {
  for (const view of ['value', 'top']) {
    const page = await moduleUnderTest.MarketScopePage(props(`${view}-picks`), 'today');
    const comp = findExperience(page);
    assert.ok(comp, `TodayExperience missing for ${view}-picks`);
    assert.equal(comp.props.initialMarket, view);
    assert.equal(calls.at(-1).view, view);
    assert.equal(calls.at(-1).marketGroup, undefined);
  }
});
test('empty Cards/Corners preserve the shell and are not indexable', async () => {
  empty = true;
  try { for (const slug of ['cards','corners']) {
    const page = await moduleUnderTest.MarketScopePage(props(slug), 'today');
    const comp = findExperience(page);
    assert.ok(comp, `TodayExperience missing for ${slug}`);
    assert.equal((await moduleUnderTest.buildMarketScopeMetadata(props(slug),'today')).index, false);
  } } finally { empty = false; }
});
test('date and pagination survive route rendering; invalid markets return 404', async () => {
  await moduleUnderTest.MarketScopePage(props('mixed','fr',{date:'2026-09-14',page:'2'}),'today');
  assert.equal(calls.at(-1).date,'2026-09-14'); assert.equal(calls.at(-1).page,2);
  assert.equal((await moduleUnderTest.buildMarketScopeMetadata(props('mixed','fr',{page:'2'}),'today')).route,'today/mixed?page=2');
  await assert.rejects(() => moduleUnderTest.MarketScopePage(props('invented'),'today'),/404/);
});
