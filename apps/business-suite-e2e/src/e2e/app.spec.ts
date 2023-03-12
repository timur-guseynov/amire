import { test, expect } from '@playwright/test';

test('business-suite', async ({ page }) => {
  await page.goto('/');

  const greeting = page.locator('h1');
  await expect(greeting).toContainText('Welcome business-suite');
});
