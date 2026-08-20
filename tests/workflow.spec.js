import { test, expect } from '@playwright/test'

test('user can create project and task', async ({ page }) => {
  await page.goto('/login')

  await page.locator('input[type="email"]').fill('test@sprintflow.com')
  await page.locator('input[type="password"]').fill('Test123!')

  await page.getByRole('button', { name: 'Login' }).click()

  await expect(page).toHaveURL(/dashboard/)

  await page.getByRole('link', { name: 'Projects' }).click()

  await expect(page).toHaveURL(/projects/)

  const projectName = `Playwright Project ${Date.now()}`

  await page.getByPlaceholder('Project name').fill(projectName)
  await page
    .getByPlaceholder('Description')
    .fill('Project created by Playwright')

  await page.getByRole('button', { name: 'Create Project' }).click()

  await expect(
    page.getByRole('heading', { name: projectName })
  ).toBeVisible()

  await page.getByRole('link', { name: 'Open Board →' }).first().click()

  await expect(page.getByText('PROJECT BOARD')).toBeVisible()

  await page.getByRole('button', { name: '+ Add Task' }).click()

  await page.getByPlaceholder('Task title').fill('Playwright test task')
  await page
    .getByPlaceholder('Description')
    .fill('Task created by automated test')

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dueDate = tomorrow.toISOString().slice(0, 10)

  await page.locator('input[type="date"]').fill(dueDate)

  await page.getByRole('button', { name: 'Add Task', exact: true }).click()

  await expect(
    page.getByRole('heading', { name: 'Playwright test task' })
  ).toBeVisible()

  const taskCard = page
  .getByRole('heading', { name: 'Playwright test task' })
  .locator('..')

    await taskCard.locator('select').selectOption('in-progress')

    await expect(
    page.getByRole('heading', { name: 'Playwright test task' })
    ).toBeVisible()

    await expect(
    taskCard.locator('select')
    ).toHaveValue('in-progress')
    
    // clean up the project created by this test
    await page.getByRole('link', { name: 'Projects' }).click()

    const projectCard = page
    .locator('.project-card')
    .filter({ hasText: projectName })

    await projectCard.getByRole('button', { name: 'Delete' }).click()

    await page.getByRole('button', { name: 'Delete Project' }).click()

    await expect(
    page.getByRole('heading', { name: projectName })
    ).not.toBeVisible()
})