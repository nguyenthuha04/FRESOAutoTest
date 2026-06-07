import { expect, Page } from '@playwright/test';
import { TestUser } from '../data/users';

export async function login(page: Page, user: TestUser) {
  const inputs = page.locator('input');
  await expect(inputs.first()).toBeVisible({ timeout: 20_000 });

  await inputs.nth(0).fill(user.username);

  if (user.code && (await inputs.count()) >= 3) {
    await inputs.nth(1).fill(user.password);
    await inputs.nth(2).fill(user.code);
  } else {
    await inputs.nth(1).fill(user.password);
  }

  await page.getByRole('button', { name: 'Đăng nhập' }).or(page.getByRole('button', { name: 'Login' })).click();
  await page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {});
}
