import { expect, test } from '@playwright/test';

test('legacy login remains reachable', async ({ page }) => {
  await page.goto('/legacy-login');
  await expect(page).toHaveTitle(/SillyTavern/i);
});
