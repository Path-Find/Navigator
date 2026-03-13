import { test, expect } from '@playwright/test';

test('system update cards swap logic', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // 1. Verify standard cards (no stale focus, no TOS update)
    // We assume the user is logged in for these tests to trigger the injection logic.
    // If not, we might need to mock the UserContext state.

    // Since we are testing the FE logic, we can inject localStorage values.

    // Simulate stale archetype (200 days ago)
    await page.evaluate(() => {
        localStorage.setItem('navigator_test_user', 'true');
        localStorage.setItem('navigator_user_tier', 'plus');
        localStorage.setItem('navigator_last_archetype_update', (Date.now() - 200 * 24 * 60 * 60 * 1000).toString());
        localStorage.setItem('navigator_accepted_tos_version', '20240221'); // Current version
    });

    await page.reload();
    await expect(page.locator('text=Update Focus')).toBeVisible();

    // Simulate TOS update (takes precedence)
    await page.evaluate(() => {
        localStorage.setItem('navigator_accepted_tos_version', '1'); // Old version
    });

    await page.reload();
    await expect(page.locator('text=Policy Update')).toBeVisible();
    await expect(page.locator('text=Update Focus')).not.toBeVisible();

    // 3. Verify action: Update Focus opens Settings
    await page.evaluate(() => {
        localStorage.setItem('navigator_accepted_tos_version', '20240221'); // Current version
    });
    await page.reload();
    await page.click('text=Update Now'); // Action button on Archetype card
    // Check if settings modal OR something identifiable opens
    // (Assuming Settings modal has some unique text)
    await expect(page.locator('text=Settings')).toBeVisible();
});
