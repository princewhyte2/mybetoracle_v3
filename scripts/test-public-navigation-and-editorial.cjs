const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadTs(file, mocks = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', code)(
    (name) => mocks[name] ?? require(name),
    mod,
    mod.exports,
  );
  return mod.exports;
}

const codec = loadTs('src/features/discovery/public-id.ts');
const footerData = loadTs('src/components/navigation/footer-data.ts');
const editorialCopy = loadTs('src/features/today/editorial-copy.ts');
const marketPresentation = loadTs('src/features/discovery/market-presentation.ts');
const scopedHeadingMod = loadTs('src/features/today/scoped-heading.ts', {
  '@/features/discovery/market-presentation': marketPresentation,
});

const LOCALES = ['en', 'es', 'fr', 'de', 'it', 'pt'];

test('footer manifest provides all 4 column groups with valid anchors across all six locales', () => {
  for (const locale of LOCALES) {
    const content = footerData.getFooterContent(locale);
    assert.equal(content.groups.length, 4, `expected 4 columns in ${locale}`);
    assert.ok(content.disclaimer.length > 30, `disclaimer should be non-empty in ${locale}`);
    assert.ok(content.copyright.includes('2026'), `copyright should include 2026 in ${locale}`);

    for (const group of content.groups) {
      assert.ok(group.title.trim().length > 0, `group title missing in ${locale}`);
      assert.ok(group.links.length >= 4, `group ${group.title} has fewer than 4 links in ${locale}`);

      for (const link of group.links) {
        assert.ok(link.label.trim().length > 0, `empty link label in ${group.title}`);
        assert.ok(link.href.startsWith(`/${locale}/`), `link ${link.href} does not start with /${locale}/`);
        assert.ok(!link.href.includes('undefined'), `link ${link.href} contains undefined`);
        assert.ok(!link.href.includes('//'), `link ${link.href} contains double slash`);
      }
    }
  }
});

test('verified competition links in footer decode to their exact database UUIDs', () => {
  const expectedComps = [
    { id: 'c8b97cc2-2122-4bcc-a7ab-65274a75d00b', name: 'Premier League' },
    { id: '92436c91-cf2d-47b6-a133-7c660d6e261a', name: 'La Liga' },
    { id: '390f0f1b-6dc0-4d50-8b4e-87696813bb99', name: 'Serie A' },
    { id: '1cfc4ef3-0c92-41b4-99c0-0a1fc7cf789f', name: 'Bundesliga' },
    { id: 'f6899004-373f-4eb6-8769-9f6193e35167', name: 'Ligue 1' },
    { id: '365e4ab3-a9b9-4271-8507-1aa4d985957b', name: 'UEFA Champions League' },
  ];

  for (const comp of expectedComps) {
    const verified = footerData.VERIFIED_FOOTER_COMPETITIONS.find((c) => c.id === comp.id);
    assert.ok(verified, `missing verified competition ${comp.name}`);
    const decodedId = codec.encodedEntityId(verified.slug);
    assert.equal(decodedId, comp.id, `encoded entity ID ${decodedId} did not match expected ${comp.id}`);
  }
});

test('editorial content provides complete headings, paragraphs, and internal links in all six locales', () => {
  const scopes = [
    'today',
    'tomorrow',
    'match-result',
    'both-teams-score',
    'total-2-5',
    'total-1-5',
    'double-chance',
    'halftime-result',
    'value-picks',
    'top-picks',
  ];

  for (const locale of LOCALES) {
    for (const scope of scopes) {
      const content = editorialCopy.getEditorialContent(locale, scope);
      assert.ok(content.heading.trim().length > 5, `heading missing for ${scope} in ${locale}`);
      assert.ok(content.paragraphs.length >= 2, `paragraphs missing for ${scope} in ${locale}`);
      for (const p of content.paragraphs) {
        assert.ok(p.trim().length > 20, `paragraph too short for ${scope} in ${locale}`);
        // Ensure no untranslated template placeholders
        assert.ok(!p.includes('{'), `unresolved template placeholder in ${scope} (${locale}): ${p}`);
      }
      assert.ok(content.relatedLinks.length >= 3, `related links missing for ${scope} in ${locale}`);
      for (const link of content.relatedLinks) {
        assert.ok(link.href.startsWith(`/${locale}/`), `related link ${link.href} not localized to ${locale}`);
      }
    }
  }
});

test('today-experience renders crawlable sidebar links, footer jump link, and pauses auto-scroll', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/features/today/today-experience.tsx'), 'utf8');

  // Sidebar footer uses Link with href, not button with onClick
  assert.ok(source.includes('<Link href={`/${locale}/competitions`}') || source.includes('href={`/${locale}/competitions`}'));
  assert.ok(source.includes('<Link href={`/${locale}/responsible-play`}') || source.includes('href={`/${locale}/responsible-play`}'));

  // PageEditorial is rendered
  assert.ok(source.includes('<PageEditorial'));

  // Auto-scroll pause state and skip-to-footer anchor exist
  assert.ok(source.includes('autoScrollPaused'));
  assert.ok(source.includes('href="#site-footer"'));
  assert.ok(source.includes('setAutoScrollPaused(true)'));
  assert.ok(source.includes('setAutoScrollPaused(false)'));
});

test('locale root layout renders SiteFooter', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/app/[locale]/layout.tsx'), 'utf8');
  assert.ok(source.includes('<SiteFooter locale={safeLocale} />'));
});

test('Target #1 double-chance scopedHeading and scopedMarketDescription are complete across all six locales for today and tomorrow', () => {
  const expectedHeadings = {
    en: { today: 'Double Chance: predictions for today', tomorrow: 'Double Chance: predictions for tomorrow' },
    es: { today: 'Doble oportunidad: pronósticos para hoy', tomorrow: 'Doble oportunidad: pronósticos para mañana' },
    fr: { today: 'Double chance : pronostics pour aujourd’hui', tomorrow: 'Double chance : pronostics pour demain' },
    de: { today: 'Doppelte Chance: Prognosen für heute', tomorrow: 'Doppelte Chance: Prognosen für morgen' },
    it: { today: 'Doppia chance: pronostici per oggi', tomorrow: 'Doppia chance: pronostici per domani' },
    pt: { today: 'Dupla hipótese: palpites para hoje', tomorrow: 'Dupla hipótese: palpites para amanhã' },
  };

  for (const locale of LOCALES) {
    for (const scope of ['today', 'tomorrow']) {
      const subject = {
        en: 'Double Chance',
        es: 'Doble oportunidad',
        fr: 'Double chance',
        de: 'Doppelte Chance',
        it: 'Doppia chance',
        pt: 'Dupla hipótese',
      }[locale];

      const heading = scopedHeadingMod.scopedHeading(locale, subject, scope);
      assert.equal(heading, expectedHeadings[locale][scope], `heading mismatch for ${locale} ${scope}`);

      const desc = scopedHeadingMod.scopedMarketDescription(locale, 'double-chance', scope);
      assert.ok(desc.length >= 100 && desc.length <= 180, `desc length ${desc.length} out of bounds for ${locale} ${scope}`);
      assert.ok(!desc.includes('{'), `template placeholder in description for ${locale} ${scope}`);

      // Confirm exact market markers (1X, X2, 12) are present in the description
      assert.ok(desc.includes('1X') && desc.includes('X2') && desc.includes('12'), `missing 1X/X2/12 in ${locale} ${scope}`);
    }
  }
});

test('scopedMarketDescription delivers high-CTR descriptions for all top search markets across all six locales', () => {
  const topMarkets = [
    'double-chance',
    'both-teams-score',
    'total-2-5',
    'total-1-5',
    'match-result',
    'halftime-result',
    'value-picks',
    'top-picks',
  ];

  for (const locale of LOCALES) {
    for (const scope of ['today', 'tomorrow']) {
      for (const market of topMarkets) {
        const desc = scopedHeadingMod.scopedMarketDescription(locale, market, scope);
        assert.ok(desc.length > 50, `missing scoped description for ${market} in ${locale} ${scope}`);
        assert.ok(desc.length <= 200, `description too long for ${market} in ${locale} ${scope}: ${desc.length}`);
      }
    }
  }
});

test('MarketScopePage renders pageHeading, BreadcrumbList, and buildTodayItemListJsonLd structured data', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/features/today/market-scope-page.tsx'), 'utf8');
  assert.ok(source.includes('scopedHeading(locale, marketName, scope)'), 'must compute pageHeading with scopedHeading');
  assert.ok(source.includes('buildTodayItemListJsonLd'), 'must call buildTodayItemListJsonLd');
  assert.ok(source.includes('"@type": "BreadcrumbList"'), 'must render BreadcrumbList schema');
  assert.ok(source.includes('heading={pageHeading}'), 'must pass pageHeading as heading to TodayExperience');
  assert.ok(source.includes('type="application/ld+json"'), 'must render application/ld+json script');
});

