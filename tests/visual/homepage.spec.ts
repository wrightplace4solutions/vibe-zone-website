import { test, expect } from '@playwright/test';

// Disable CSS animations/transitions so screenshots are deterministic
const NO_MOTION_CSS =
  '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }';

async function gotoHome(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.addStyleTag({ content: NO_MOTION_CSS });
  await page.waitForLoadState('networkidle');
}

// ── Overflow checks ───────────────────────────────────────────────────────────

test('homepage: no horizontal overflow', async ({ page }) => {
  await gotoHome(page);

  const hasHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );

  expect(hasHorizontalScroll, 'Page must not produce horizontal scroll').toBe(false);
});

// ── Above-the-fold / hero screenshot ─────────────────────────────────────────

test('homepage: hero above-the-fold', async ({ page }) => {
  await gotoHome(page);
  await expect(page).toHaveScreenshot('hero-above-fold.png');
});

// ── Full page screenshots ─────────────────────────────────────────────────────

test('homepage: full page layout', async ({ page }) => {
  await gotoHome(page);

  // Scroll to bottom to trigger lazy-loaded images, then back to top
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));

  await expect(page).toHaveScreenshot('homepage-full.png', { fullPage: true });
});

// ── Key section visibility checks ────────────────────────────────────────────

test('homepage: hero heading is visible and not clipped', async ({ page }) => {
  await gotoHome(page);

  const heading = page.locator('h1').first();
  await expect(heading).toBeVisible();

  const box = await heading.boundingBox();
  expect(box, 'Hero heading must have a measurable bounding box').not.toBeNull();
  if (box) {
    const viewport = page.viewportSize()!;
    expect(box.x, 'Heading must not start off-screen to the left').toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, 'Heading must not overflow to the right').toBeLessThanOrEqual(
      viewport.width + 1, // 1 px tolerance
    );
  }
});

test('homepage: services section renders all 4 cards', async ({ page }) => {
  await gotoHome(page);

  await page.locator('text=Our').scrollIntoViewIfNeeded();
  const cards = page.locator('section:has(h2:has-text("Services")) [class*="Card"]');
  await expect(cards).toHaveCount(4);
});

test('homepage: CTA buttons are linked (not dead)', async ({ page }) => {
  await gotoHome(page);

  // Scroll to CTA section
  await page.locator('text=#LETSWORK').scrollIntoViewIfNeeded();

  const callBtn = page.locator('a[href^="tel:"]');
  const emailBtn = page.locator('a[href^="mailto:"]');

  await expect(callBtn).toBeVisible();
  await expect(emailBtn).toBeVisible();
});
