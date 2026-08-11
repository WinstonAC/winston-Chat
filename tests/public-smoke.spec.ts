import { test, expect } from '@playwright/test';

// Widget routes to test - dynamically check which ones exist
const WIDGET_ROUTES = [
  '/winston-widget',
  '/werule-widget',
  '/william-widget',
];

test.describe('Public Widget Smoke Tests', () => {
  test('widget pages load without console errors', async ({ page }) => {
    // Collect console errors for this test
    const consoleErrors: string[] = [];
    
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Test each widget route that exists
    for (const route of WIDGET_ROUTES) {
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      
      // Skip if route doesn't exist
      if (response?.status() === 404) {
        continue;
      }

      expect(response?.status()).toBe(200);
      
      // Wait a bit for any async console errors
      await page.waitForTimeout(1000);
    }

    // Fail if any console errors occurred
    if (consoleErrors.length > 0) {
      console.error('Console errors found:', consoleErrors);
    }
    expect(consoleErrors).toHaveLength(0);
  });

  test('chat widget is visible and interactive', async ({ page }) => {
    // Try to find a working widget route
    let workingRoute: string | null = null;
    
    for (const route of WIDGET_ROUTES) {
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      if (response?.status() === 200) {
        workingRoute = route;
        break;
      }
    }

    // Skip if no widget routes exist
    test.skip(workingRoute === null, 'No widget routes found');

    await page.goto(workingRoute!);

    // Wait for chat widget to be visible
    await page.waitForSelector('[data-component="ChatWidget"]', { timeout: 5000 });

    // Check that message log is visible
    const messageLog = page.getByRole('log', { name: /chat messages/i });
    await expect(messageLog).toBeVisible();

    // Check that textbox is visible and enabled
    const textbox = page.getByRole('textbox');
    await expect(textbox).toBeVisible();
    await expect(textbox).toBeEnabled();

    // Check that send button is visible
    const sendButton = page.getByRole('button', { name: /send/i });
    await expect(sendButton).toBeVisible();
  });

  test('can type and send a message', async ({ page }) => {
    // Try to find a working widget route
    let workingRoute: string | null = null;
    
    for (const route of WIDGET_ROUTES) {
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      if (response?.status() === 200) {
        workingRoute = route;
        break;
      }
    }

    test.skip(workingRoute === null, 'No widget routes found');

    await page.goto(workingRoute!);

    // Wait for chat widget
    await page.waitForSelector('[data-component="ChatWidget"]', { timeout: 5000 });

    const textbox = page.getByRole('textbox');
    const sendButton = page.getByRole('button', { name: /send/i });
    const messageLog = page.getByRole('log', { name: /chat messages/i });

    // Type a test message
    const testMessage = 'Hello, this is a test message';
    await textbox.fill(testMessage);
    await expect(textbox).toHaveValue(testMessage);

    // Send the message
    await sendButton.click();

    // Wait for the message to appear in the UI (user message should appear immediately)
    // We don't require an assistant response - just verify user message appears
    await expect(messageLog).toContainText(testMessage, { timeout: 5000 });

    // Verify the message appears in the log
    const messageContent = await messageLog.textContent();
    expect(messageContent).toContain(testMessage);
  });

  test('no console errors on widget pages', async ({ page }) => {
    // Test all widget routes and collect errors
    const allErrors: string[] = [];

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        allErrors.push(msg.text());
      }
    });

    for (const route of WIDGET_ROUTES) {
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      
      if (response?.status() === 404) {
        continue;
      }

      // Wait for page to stabilize
      await page.waitForTimeout(2000);
    }

    // Fail if any console errors occurred
    if (allErrors.length > 0) {
      console.error('Console errors found:', allErrors);
    }
    expect(allErrors).toHaveLength(0);
  });
});

