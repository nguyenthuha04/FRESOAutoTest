import { expect, Page } from '@playwright/test';
import { ENV } from '../../config/env';

export class AdminLoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(ENV.adminUrl, { waitUntil: 'networkidle' });
    await expect(this.page.locator('input#account')).toBeVisible();
    await expect(this.page.locator('input#password')).toBeVisible();
  }

  async login() {
    await this.goto();
    await this.page.locator('input#account').fill(ENV.adminUsername);
    await this.page.locator('input#password').fill(ENV.adminPassword);
    await this.page.getByRole('button', { name: 'Đăng nhập' }).click();
    await this.page.waitForURL(/\/admin\/product-management/, { timeout: 60_000 });
  }
}
