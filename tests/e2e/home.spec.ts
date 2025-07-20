import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the main heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /every story has power/i })).toBeVisible();
  });

  test('should have share your story button @smoke', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /share your story/i })).toBeVisible();
  });

  test('should navigate to how it works page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /learn more/i }).click();
    await expect(page).toHaveURL('/how-it-works');
  });

  test('should display trust indicators', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/end-to-end encrypted/i)).toBeVisible();
    await expect(page.getByText(/australian owned/i)).toBeVisible();
  });
});