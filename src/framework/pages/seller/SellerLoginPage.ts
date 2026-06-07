import { expect, Page } from '@playwright/test';
import { ENV } from '../../config/env';

export class SellerLoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(ENV.sellerUrl, { waitUntil: 'networkidle' });
    const loginInputs = this.page.locator('main input');
    if ((await loginInputs.count()) < 3 || !(await loginInputs.nth(0).isVisible({ timeout: 5_000 }).catch(() => false))) {
      return;
    }

    await expect(loginInputs.nth(1)).toBeVisible();
    await expect(loginInputs.nth(2)).toBeVisible();
  }

  async login() {
    await this.goto();
    const loginInputs = this.page.locator('main input');
    if ((await loginInputs.count()) < 3 || !(await loginInputs.nth(0).isVisible({ timeout: 1_000 }).catch(() => false))) {
      return;
    }

    await loginInputs.nth(0).fill(ENV.sellerUsername);
    await loginInputs.nth(1).fill(ENV.sellerPassword);
    await loginInputs.nth(2).fill(ENV.sellerCode);
    await this.page.getByRole('button', { name: 'Đăng nhập' }).click();
    await this.page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {});
    await expect(this.page).not.toHaveURL(/\/login/);
  }

}
