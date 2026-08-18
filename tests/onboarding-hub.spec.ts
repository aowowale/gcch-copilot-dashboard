import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test.beforeEach(async ({ page }) => {
  await page.goto('/#/journey')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('executive and delivery views explain the same readiness state at the right level', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Onboarding Dashboard' })).toBeVisible()
  await expect(page.getByText('Where we are')).toBeVisible()
  await expect(page.getByText('What could delay us')).toBeVisible()
  await expect(page.getByText('What must happen next', { exact: true })).toBeVisible()
  await expect(page.getByText('Tenant-grounded readiness')).toBeVisible()

  await page.getByRole('button', { name: 'Delivery team view' }).click()
  await expect(page.getByText('Overall readiness')).toBeVisible()
  await expect(page.getByText('Next best actions')).toBeVisible()
  await expect(page.getByText('Workspace controls')).toBeVisible()
})

test('executive view turns recorded blockers and decisions into plain-language attention items', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('copilot_onboarding_v2_state', JSON.stringify({
      profile: { cloud: 'gcch', path: 'pilot', teamName: 'Federal Pilot' },
      blockers: [{ status: 'Open' }],
    }))
    localStorage.setItem('lemon_asks', JSON.stringify([
      { id: 'ask-release', title: 'Approve pilot launch', rationale: 'The team needs authority to begin the controlled pilot.', decision: 'Pending' },
    ]))
  })
  await page.reload()

  await expect(page.getByText('Blocked', { exact: true })).toBeVisible()
  await expect(page.getByText('The journey cannot advance until the open blockers are resolved or an accountable leader accepts the risk.')).toBeVisible()
  await expect(page.getByText('1 open blocker(s)')).toBeVisible()
  await expect(page.getByText('Approve pilot launch')).toBeVisible()
  await expect(page.getByText('The team needs authority to begin the controlled pilot.')).toBeVisible()
})

test('executive tenant readiness reflects remediation findings and validation evidence', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('lemon_sam_findings', JSON.stringify([
    {
      id: 'sam-ready',
      title: 'SharePoint sharing review',
      workstream: 'SharePoint & SAM',
      severity: 'High',
      stage: 'Ready',
      evidence: 'Evidence/sharepoint-review.csv',
      owner: 'SharePoint Admin',
      notes: '',
    },
    {
      id: 'teams-critical',
      title: 'Ownerless teams',
      workstream: 'Microsoft Teams',
      severity: 'Critical',
      stage: 'Remediation underway',
      evidence: '',
      owner: 'Teams Admin',
      notes: '',
    },
  ])))
  await page.reload()

  await expect(page.getByText('Blocked', { exact: true })).toBeVisible()
  await expect(page.getByText('1 of 2 workstreams ready')).toBeVisible()
  await expect(page.getByText('1 critical finding(s) must be resolved or accepted by an accountable leader.')).toBeVisible()
  await expect(page.getByText('At risk', { exact: true })).toBeVisible()
})

test('Teams remediation work remains trackable through validation', async ({ page }) => {
  await page.goto('/#/sam')
  await expect(page.getByRole('heading', { name: 'Get Copilot Ready' })).toBeVisible()

  await page.getByRole('button', { name: '+ Add Teams finding' }).click()
  const finding = page.locator('.card').filter({ has: page.locator('input') }).first()

  await finding.locator('input').first().fill('Review guest access in active teams')
  const stage = finding.getByRole('combobox').nth(3)
  await stage.selectOption('Validation needed')
  await expect(stage.locator('option', { hasText: 'Ready' })).toBeDisabled()
  await expect(finding.getByText('Add validation evidence before marking this finding Ready.')).toBeVisible()
  await finding.getByPlaceholder('Validation evidence link or reference').fill('Evidence/teams-guest-review.csv')
  await expect(stage.locator('option', { hasText: 'Ready' })).toBeEnabled()
  await stage.selectOption('Ready')
  await finding.getByPlaceholder('Validation evidence link or reference').fill('')
  await expect(stage).toHaveValue('Validation needed')
  await finding.getByPlaceholder('Validation evidence link or reference').fill('Evidence/teams-guest-review.csv')
  await stage.selectOption('Ready')

  await page.reload()
  const persistedFinding = page.locator('.card').filter({ has: page.locator('input') }).first()
  await expect(persistedFinding.locator('input').first()).toHaveValue('Review guest access in active teams')
  await expect(persistedFinding.getByRole('combobox').nth(3)).toHaveValue('Ready')
  await expect(persistedFinding.getByPlaceholder('Validation evidence link or reference')).toHaveValue('Evidence/teams-guest-review.csv')
})

test('field-informed controls preserve applicability and require validation evidence', async ({ page }) => {
  await page.goto('/#/sam')
  await page.getByLabel('Field-informed readiness template').selectOption('grounded-answer-test')
  await page.getByRole('button', { name: 'Add selected control' }).click()

  const finding = page.locator('.card').filter({ has: page.locator('input[value="Grounded answers need citation and permission-boundary testing"]') })
  await expect(finding.getByLabel('Environment applicability')).toHaveValue('Validate in tenant')
  await expect(finding.getByText('A technically available answer is not ready until its source, citation, freshness, and user-specific access behavior are validated.')).toBeVisible()
  await expect(finding.getByPlaceholder('Remediation plan, dependencies, and approved exceptions.')).toContainText('expected authoritative source')

  const stage = finding.getByRole('combobox').nth(3)
  await expect(stage.locator('option', { hasText: 'Ready' })).toBeDisabled()
  await finding.getByPlaceholder('Validation evidence link or reference').fill('Evidence/grounded-answer-test.csv')
  await expect(stage.locator('option', { hasText: 'Ready' })).toBeDisabled()
  await finding.getByPlaceholder('Representative test question').fill('What is the approved travel policy?')
  await finding.getByPlaceholder('Expected authoritative source').fill('HR/Travel/Policy.docx')
  await finding.getByPlaceholder('Persona that should receive the answer').fill('Employee')
  await finding.getByPlaceholder('Persona that must not receive the answer').fill('External guest')
  await finding.getByPlaceholder('Freshness requirement').fill('Published within the last 12 months')
  await finding.getByLabel('Citation result').selectOption('Pass')
  await finding.getByLabel('Permission boundary result').selectOption('Pass')
  await stage.selectOption('Ready')
  await page.reload()

  const persisted = page.locator('.card').filter({ has: page.locator('input[value="Grounded answers need citation and permission-boundary testing"]') })
  await expect(persisted.getByLabel('Environment applicability')).toHaveValue('Validate in tenant')
  await expect(persisted.getByRole('combobox').nth(3)).toHaveValue('Ready')
  await expect(persisted.getByLabel('Permission boundary result')).toHaveValue('Pass')
})

test('viewer mode protects readiness data from editing', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('lemon_role_mode', 'viewer'))
  await page.goto('/#/sam')

  await expect(page.getByRole('button', { name: '+ Add Teams finding' })).toBeDisabled()
  await expect(page.getByRole('button', { name: '+ Add SharePoint finding' })).toBeDisabled()
  await expect(page.locator('.readiness-edit-grid input').first()).toBeDisabled()
  await expect(page.locator('.readiness-edit-grid select').first()).toBeDisabled()

  await page.goto('/#/journey')
  await page.getByRole('button', { name: 'Delivery team view' }).click()
  await expect(page.locator('input[type="file"]')).toBeDisabled()
})

test('malformed saved data falls back to a usable workspace', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('copilot_onboarding_v2_state', '{not-json')
    localStorage.setItem('lemon_sam_findings', '{not-json')
    localStorage.setItem('lemon_asks', '{not-json')
  })
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Onboarding Dashboard' })).toBeVisible()

  await page.goto('/#/sam')
  await expect(page.getByRole('heading', { name: 'Get Copilot Ready' })).toBeVisible()
  await expect(page.getByText('SharePoint & SAM', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Microsoft Teams', { exact: true }).first()).toBeVisible()
})

test('workspace export and import round-trips readiness data', async ({ page }) => {
  await page.goto('/#/sam')
  const firstTitle = page.locator('.readiness-edit-grid-primary input').first()
  await firstTitle.fill('Exported readiness marker')

  await page.goto('/#/journey')
  await page.getByRole('button', { name: 'Delivery team view' }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export workspace' }).click()
  const download = await downloadPromise
  const downloadPath = await download.path()
  expect(downloadPath).not.toBeNull()
  const exported = JSON.parse(await readFile(downloadPath!, 'utf8')) as { data: Record<string, unknown> }
  expect(exported.data.lemon_audit_trail).toBeDefined()

  await page.goto('/#/sam')
  await page.locator('.readiness-edit-grid-primary input').first().fill('Changed after export')
  await page.goto('/#/journey')
  await page.evaluate(() => localStorage.setItem('lemon_role_mode', 'admin'))
  await page.reload()
  await page.getByRole('button', { name: 'Delivery team view' }).click()
  await page.locator('input[type="file"]').setInputFiles(downloadPath!)
  await page.waitForLoadState('domcontentloaded')

  await page.goto('/#/sam')
  await expect(page.locator('.readiness-edit-grid-primary input').first()).toHaveValue('Exported readiness marker')
})

test('executive and readiness views remain usable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/journey')
  await expect(page.getByText('Where we are')).toBeVisible()
  await expect(page.getByText('What could delay us')).toBeVisible()

  await page.goto('/#/sam')
  await expect(page.getByRole('heading', { name: 'Get Copilot Ready' })).toBeVisible()
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(horizontalOverflow).toBe(false)
})

test('full live tracker combines readiness gates, owned work, review changes, and the roadmap', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('copilot_onboarding_v2_state', JSON.stringify({
    profile: { cloud: 'gcch', path: 'pilot', teamName: 'Federal Pilot' },
    workStatus: {
      'ctrl-ca': 'done',
      'ctrl-integrated': 'done',
      'ctrl-retention': 'done',
      'ctrl-dlp': 'done',
      'ctrl-rss-rcd': 'done',
    },
    workDue: {},
    blockers: [],
    evidence: [{ id: 'ev-ready', title: 'Pilot evidence', status: 'complete' }],
  })))
  await page.goto('/#/tracker')

  await expect(page.getByRole('heading', { name: 'Live Tracker — Start Here' })).toBeVisible()
  await expect(page.getByText('Top 3 next actions')).toBeVisible()
  await expect(page.getByText('Copilot readiness gate scorecard')).toBeVisible()
  await expect(page.getByText('5/5')).toBeVisible()
  await expect(page.getByText('Program readiness gates')).toBeVisible()
  await expect(page.getByText('Current environment: GCC High')).toBeVisible()
  await expect(page.getByText('Grounded answers pass citation and permission tests')).toBeVisible()
  await expect(page.getByText('Owned tracker items')).toBeVisible()
  await expect(page.locator('input[value="Complete agent and connector assessment"]')).toBeVisible()
  await expect(page.locator('.badge').filter({ hasText: /^Validate in tenant$/ }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: '+ Add tracker item' })).toBeVisible()
  await expect(page.frameLocator('iframe[title="GCCH Copilot Dashboard Tracker"]').getByText('Deployment Readiness Roadmap')).toBeVisible()

  await page.getByRole('button', { name: 'Capture review snapshot' }).click()
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('copilot_onboarding_v2_state') || '{}')
    state.workStatus['ctrl-ca'] = 'blocked'
    localStorage.setItem('copilot_onboarding_v2_state', JSON.stringify(state))
  })
  await page.reload()
  await expect(page.getByText('Conditional Access for Copilot app scope: Done -> Blocked')).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(horizontalOverflow).toBe(false)
})

test('dashboard and readiness center avoid overflow at tablet and desktop widths', async ({ page }) => {
  for (const viewport of [{ width: 768, height: 1024 }, { width: 1280, height: 900 }]) {
    await page.setViewportSize(viewport)
    for (const route of ['/#/journey', '/#/sam']) {
      await page.goto(route)
      const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
      expect(horizontalOverflow, `${route} overflowed at ${viewport.width}px`).toBe(false)
    }
  }
})

test('print mode removes application chrome and keeps executive and readiness content visible', async ({ page }) => {
  await page.emulateMedia({ media: 'print' })

  for (const view of [
    { route: '/#/journey', heading: 'Onboarding Dashboard' },
    { route: '/#/sam', heading: 'Get Copilot Ready' },
  ]) {
    await page.goto(view.route)
    await expect(page.locator('.sidebar')).toBeHidden()
    await expect(page.locator('.topbar')).toBeHidden()
    await expect(page.getByRole('heading', { name: view.heading })).toBeVisible()
  }
})
