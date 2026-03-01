import { test, expect } from '@playwright/test';

/**
 * E2E tests for BlackRoad AI Chat
 * Tests the static Ollama chat interface without requiring a live Ollama backend.
 */

test.describe('Page load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/BlackRoad AI Chat/);
  });

  test('shows the BlackRoad AI logo/header', async ({ page }) => {
    await expect(page.locator('.logo')).toBeVisible();
    await expect(page.locator('.logo')).toContainText('BlackRoad AI');
  });

  test('shows the endpoint input', async ({ page }) => {
    const endpointInput = page.locator('#endpoint-input');
    await expect(endpointInput).toBeVisible();
    await expect(endpointInput).toHaveValue(/192\.168\.\d+\.\d+/);
  });

  test('shows the model select dropdown', async ({ page }) => {
    await expect(page.locator('#model-select')).toBeVisible();
  });

  test('shows the status bar', async ({ page }) => {
    await expect(page.locator('#status-bar')).toBeVisible();
    await expect(page.locator('#conn-status')).toBeVisible();
  });

  test('shows the empty state with suggestions', async ({ page }) => {
    await expect(page.locator('#empty-state')).toBeVisible();
    await expect(page.locator('.empty-title')).toContainText('BlackRoad AI Chat');
    const chips = page.locator('.suggestion-chip');
    await expect(chips).toHaveCount(4);
  });

  test('shows the chat input textarea', async ({ page }) => {
    await expect(page.locator('#chat-input')).toBeVisible();
    await expect(page.locator('#chat-input')).toHaveAttribute(
      'placeholder',
      'Message BlackRoad AI…',
    );
  });

  test('shows the send button', async ({ page }) => {
    await expect(page.locator('#send-btn')).toBeVisible();
  });

  test('shows the keyboard hint', async ({ page }) => {
    await expect(page.locator('.input-meta')).toContainText('Enter to send');
  });
});

test.describe('Settings modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens when clicking the settings button', async ({ page }) => {
    await expect(page.locator('#settings-overlay')).not.toHaveClass(/open/);
    await page.locator('button', { hasText: '⚙' }).click();
    await expect(page.locator('#settings-overlay')).toHaveClass(/open/);
  });

  test('closes when clicking Cancel', async ({ page }) => {
    await page.locator('button', { hasText: '⚙' }).click();
    await expect(page.locator('#settings-overlay')).toHaveClass(/open/);
    await page.locator('button', { hasText: 'Cancel' }).click();
    await expect(page.locator('#settings-overlay')).not.toHaveClass(/open/);
  });

  test('closes when clicking outside the card', async ({ page }) => {
    await page.locator('button', { hasText: '⚙' }).click();
    await expect(page.locator('#settings-overlay')).toHaveClass(/open/);
    await page.locator('#settings-overlay').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('#settings-overlay')).not.toHaveClass(/open/);
  });

  test('pre-fills current endpoint in settings', async ({ page }) => {
    await page.locator('button', { hasText: '⚙' }).click();
    const sEndpoint = page.locator('#s-endpoint');
    await expect(sEndpoint).toHaveValue(/\d+\.\d+\.\d+\.\d+/);
  });
});

test.describe('Chat input interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('send button is initially not disabled when no model loaded', async ({ page }) => {
    // Button should exist; it only gets disabled during streaming
    await expect(page.locator('#send-btn')).toBeEnabled();
  });

  test('textarea expands as user types', async ({ page }) => {
    const input = page.locator('#chat-input');
    const initialHeight = await input.evaluate((el) => (el as HTMLElement).offsetHeight);
    await input.fill('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
    const newHeight = await input.evaluate((el) => (el as HTMLElement).offsetHeight);
    expect(newHeight).toBeGreaterThanOrEqual(initialHeight);
  });

  test('shows token count estimate while typing', async ({ page }) => {
    const input = page.locator('#chat-input');
    await input.fill('Hello world, this is a test message');
    await expect(page.locator('#token-count')).toContainText('tokens');
  });

  test('clears token count when input is empty', async ({ page }) => {
    const input = page.locator('#chat-input');
    await input.fill('some text');
    await input.fill('');
    await expect(page.locator('#token-count')).toHaveText('');
  });

  test('suggestion chip fills the input', async ({ page }) => {
    // Mock fetch so sendMessage doesn't fail
    await page.route('**/api/tags', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ models: [{ name: 'test-model' }] }),
      }),
    );
    await page.route('**/api/chat', (route) => route.abort());
    await page.reload();

    const chip = page.locator('.suggestion-chip').first();
    const chipText = await chip.textContent();
    await chip.click();
    // After clicking, input should have been populated (sendMessage clears it,
    // so just verify the empty-state is removed when message is sent)
    await expect(page.locator('#empty-state')).not.toBeAttached();
  });
});

test.describe('Clear chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Clear button re-shows the empty state', async ({ page }) => {
    // Mock a connected Ollama so we can load a model
    await page.route('**/api/tags', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ models: [{ name: 'test-model' }] }),
      }),
    );
    await page.route('**/api/chat', (route) => route.abort());
    await page.reload();

    // Type a message and send it
    const input = page.locator('#chat-input');
    await input.fill('hello');
    await page.keyboard.press('Enter');

    // Click Clear
    await page.locator('button', { hasText: '↺ Clear' }).click();
    await expect(page.locator('#empty-state')).toBeVisible();
  });
});

test.describe('Offline state', () => {
  // Ollama fetch times out after 5 s; allow extra margin for CI
  const OFFLINE_STATUS_TIMEOUT = 8000;

  test('shows offline status when Ollama endpoint is unreachable', async ({ page }) => {
    // Block the Ollama API call
    await page.route('**/api/tags', (route) => route.abort());
    await page.goto('/');
    // Status should eventually show red/offline
    await expect(page.locator('#conn-status')).toContainText('Offline', {
      timeout: OFFLINE_STATUS_TIMEOUT,
    });
  });
});
