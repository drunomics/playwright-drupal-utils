const { expect } = require('@playwright/test');
const { test } = require('./helpers/backend-test');
let helpers = require('./helpers/test-methods');

test.describe('Drupal base', () => {
  test('Drupal generates a page', async ({ page }) => {
    const response = await page.goto('/');
    await expect(response.status()).toBe(200);
    await expect(await response.text()).toContain(('nuxt'));
  });

  test('Drupal generates a 404 response', async ({ page, backendURL}) => {
    const response = await page.goto(`${backendURL}/api/some-not-existing-page)`);
    await expect(response.status()).toBe(404);
  });

  test('Admin routes redirect to login page for anonymous users.', async ({ page, backendURL }) => {
    const response = await page.goto(`${backendURL}/admin`);
    await expect((await response).status()).toBe(200);
    await expect(page).toHaveURL(/.*(?!user\/login?destination=admin)/);
  });

  test('I can log in and logout.', async ({ page, backendURL }) => {
    await helpers.IShouldNotBeLoggedIn(page);
    // Log in
    await helpers.ILogInAs([page, 'dru_editor']);
    await helpers.IShouldBeLoggedIn(page);
    // Log out
    await page.goto(`${backendURL}/user/logout`);
    await helpers.IShouldNotBeLoggedIn(page);
  });

});
