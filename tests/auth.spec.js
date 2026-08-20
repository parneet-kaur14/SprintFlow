import { test, expect } from '@playwright/test'

test('user can log in and log out', async ({ page }) => {
  await page.goto('/login')

  await page.locator('input[type="email"]').fill('test@sprintflow.com')
  await page.locator('input[type="password"]').fill('Test123!')

  await page.getByRole('button', { name: 'Login' }).click()

  await expect(page).toHaveURL(/dashboard/)
  await expect(
    page.getByRole('heading', { name: 'Welcome back' })
  ).toBeVisible()

  await page.locator('.profile-button').click()

  await page.getByRole('button', { name: 'Logout' }).click()

  await expect(page).toHaveURL(/login/)
})