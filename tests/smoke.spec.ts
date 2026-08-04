import { test, expect } from '@playwright/test'

test.describe('Briefing smoke', () => {
  test('critical routes load and retain key content', async ({ page }) => {
    await page.goto('/#/home')
    await expect(page.getByRole('heading', { name: 'M365 Copilot' })).toBeVisible()
    await expect(page.getByRole('link', { name: '21 Live Tracker (Start Here)' })).toBeVisible()

    await page.goto('/#/rss')
    await expect(page.getByRole('heading', { name: 'RSS — Current State' })).toBeVisible()
    await expect(page.getByText('retired for new enablement')).toBeVisible()
    await expect(page.getByText('recommended successor')).toBeVisible()
  })

  test('ask decisions and meeting log are interactive', async ({ page }) => {
    await page.goto('/#/ask')

    const firstAsk = page.locator('.ask').first()
    await firstAsk.getByRole('button', { name: '✓ Agree' }).click()
    await expect(firstAsk.locator('.ask-status')).toHaveText(/Agreed/i)

    await page.getByRole('button', { name: '+ Add decision' }).click()
    const logCard = page.locator('.dlog-card').last()
    const topicInput = logCard.getByPlaceholder('Decision / topic')
    const notesInput = logCard.getByPlaceholder('Outcome, owner, follow-up...')

    await topicInput.fill('Smoke test decision')
    await notesInput.fill('Captured from automated smoke workflow.')

    await expect(topicInput).toHaveValue('Smoke test decision')
    await expect(notesInput).toHaveValue('Captured from automated smoke workflow.')
  })
})
