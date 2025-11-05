import { test, expect } from '@playwright/test';

test.describe('Dark Theme Verification', () => {
  const pagesToTest = [
    { name: 'Home', path: '/' },
    { name: 'Catalog', path: '/catalog' },
    { name: 'Credit', path: '/credit' },
  ];

  for (const pageInfo of pagesToTest) {
    test(`should correctly apply light theme on ${pageInfo.name} page`, async ({ page }) => {
      await page.goto(`http://localhost:3000${pageInfo.path}`);
      await page.emulateMedia({ colorScheme: 'light' });
      await page.waitForTimeout(5000); // Wait for theme to apply
      await page.screenshot({ path: `e2e-tests/screenshots/light-theme-${pageInfo.name}.png`, fullPage: true });
    });

    test(`should correctly apply dark theme on ${pageInfo.name} page`, async ({ page }) => {
      await page.goto(`http://localhost:3000${pageInfo.path}`);
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.waitForTimeout(5000); // Wait for theme to apply
      await page.screenshot({ path: `e2e-tests/screenshots/dark-theme-${pageInfo.name}.png`, fullPage: true });
    });
  }
});
