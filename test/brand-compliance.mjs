/**
 * Brand Compliance Tests — blackroad-chat
 * Validates that index.html uses the authoritative brand colors and gradient
 * defined in BlackRoad-OS-Inc/blackroad-design (src/tokens/generator.ts).
 *
 * Source of truth:
 *   BRAND_COLORS.amber            = '#F5A623'
 *   BRAND_COLORS['hot-pink']      = '#FF1D6C'
 *   BRAND_COLORS.violet           = '#9C27B0'
 *   BRAND_COLORS['electric-blue'] = '#2979FF'
 *   BRAND_GRADIENT uses golden-ratio stops 38.2% and 61.8%
 *
 *   FORBIDDEN_COLORS (old system, must NOT appear):
 *     '#FF9D00','#FF6B00','#FF0066','#FF006B','#D600AA','#7700FF','#0066FF'
 */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${name}: ${e.message}`);
    failed++;
  }
}

console.log('\n🎨 Brand Compliance — blackroad-chat\n');

// ── Brand colors (from blackroad-design BRAND_COLORS) ──────────────────────
test('uses amber #F5A623', () => {
  assert.ok(html.includes('#F5A623'), 'amber (#F5A623) not found in index.html');
});

test('uses hot-pink #FF1D6C', () => {
  assert.ok(html.includes('#FF1D6C'), 'hot-pink (#FF1D6C) not found in index.html');
});

test('uses violet #9C27B0', () => {
  assert.ok(html.includes('#9C27B0'), 'violet (#9C27B0) not found in index.html');
});

test('uses electric-blue #2979FF', () => {
  assert.ok(html.includes('#2979FF'), 'electric-blue (#2979FF) not found in index.html');
});

// ── Gradient (from blackroad-design BRAND_GRADIENT) ────────────────────────
test('gradient uses golden-ratio stop 38.2%', () => {
  assert.ok(html.includes('38.2%'), 'golden-ratio stop 38.2% not found in index.html');
});

test('gradient uses golden-ratio stop 61.8%', () => {
  assert.ok(html.includes('61.8%'), 'golden-ratio stop 61.8% not found in index.html');
});

test('gradient is linear-gradient at 135deg', () => {
  assert.ok(
    html.includes('linear-gradient(135deg'),
    'linear-gradient(135deg) not found in index.html',
  );
});

// ── Forbidden colors (from blackroad-design FORBIDDEN_COLORS) ──────────────
const FORBIDDEN = ['#FF9D00', '#FF6B00', '#FF0066', '#FF006B', '#D600AA', '#7700FF', '#0066FF'];
const htmlUpper = html.toUpperCase();

for (const color of FORBIDDEN) {
  test(`forbidden color ${color} is absent`, () => {
    assert.ok(
      !htmlUpper.includes(color.toUpperCase()),
      `Forbidden color ${color} (old brand system) found in index.html`,
    );
  });
}

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
