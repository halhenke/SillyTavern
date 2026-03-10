import { expect, test } from '@playwright/test';

type FrontendFlags = {
  reactLoginEnabled: boolean;
  reactShellEnabled: boolean;
  frontendBuildReady: boolean;
};

async function getFrontendFlags(request: Parameters<typeof test>[0]['request']): Promise<FrontendFlags> {
  const response = await request.get('/api/frontend/flags');
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as FrontendFlags;
}

test('frontend flags endpoint reports runtime shell configuration', async ({ request }) => {
  const flags = await getFrontendFlags(request);

  expect(flags).toEqual({
    reactLoginEnabled: expect.any(Boolean),
    reactShellEnabled: expect.any(Boolean),
    frontendBuildReady: expect.any(Boolean),
  });
});

test('legacy login remains reachable', async ({ page }) => {
  await page.goto('/legacy-login');
  await expect(page).toHaveTitle(/SillyTavern/i);
});

test('legacy app fallback remains reachable', async ({ page }) => {
  await page.goto('/legacy');
  await expect(page).toHaveTitle(/SillyTavern/i);
  await expect(page.locator('#send_textarea')).toBeVisible();
  await expect(page.locator('#options_button')).toBeVisible();
});

test('root route serves the configured app surface', async ({ page, request }) => {
  const flags = await getFrontendFlags(request);

  await page.goto('/');
  await expect(page).toHaveTitle(/SillyTavern/i);

  if (flags.reactShellEnabled && flags.frontendBuildReady) {
    await expect(page.getByRole('heading', { name: 'SillyTavern runtime panel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open legacy fallback' })).toBeVisible();
    return;
  }

  await expect(page.locator('#send_textarea')).toBeVisible();
  await expect(page.locator('#options_button')).toBeVisible();
});
