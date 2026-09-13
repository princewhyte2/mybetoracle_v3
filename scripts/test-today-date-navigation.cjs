const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/app/[locale]/today/page.tsx'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
} }).outputText;
const imports = {
  'next/navigation': { notFound() { throw new Error('404'); } },
  '@/features/today/today-experience': { TodayExperience() {} },
  '@/features/today/runtime-labels': { todayRuntimeLabels: { en: {}, fr: {} } },
  '@/features/today/today-service': {
    getTodayData: async ({ date, locale }) => ({ totalMatches: 1, dateIso: date, locale }),
    lagosDate: () => '2026-09-13', TodayFeedError: class extends Error {},
  },
  '@/i18n/config': { isLocale: locale => ['en', 'fr'].includes(locale), locales: ['en', 'fr'] },
  '@/i18n/messages': {}, '@/i18n/localized-metadata': {}, '@/i18n/system-labels': {},
  './page.module.css': {},
};
const loaded = { exports: {} };
new Function('require', 'module', 'exports', code)(name => name in imports ? imports[name] : require(name), loaded, loaded.exports);
const render = (date, locale = 'en') => loaded.exports.default({ params: Promise.resolve({ locale }), searchParams: Promise.resolve({ date }) });

test('date navigation replaces client feed identity while same-day renders retain it', async () => {
  const today = await render('2026-09-13');
  const yesterday = await render('2026-09-12');
  assert.notEqual(today.key, yesterday.key);
  assert.equal(yesterday.props.data.dateIso, '2026-09-12');
  assert.equal((await render('2026-09-13')).key, today.key);
  assert.notEqual((await render('2026-09-13', 'fr')).key, today.key);
});

test('invalid dates use the validated current-day identity', async () => {
  assert.equal((await render('2026-02-31')).key, (await render(undefined)).key);
});
