import { expect, Page } from '@playwright/test';

export class ProductManagementPage {
  constructor(private readonly page: Page) {}

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/admin\/product-management/);
    await expect(this.page.getByText('Danh sách sản phẩm').first()).toBeVisible();
  }

  async openAddProduct() {
    await this.expectLoaded();
    await this.page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await this.page.waitForURL(/\/admin\/product-management\/add-edit-product/, { timeout: 60_000 });
  }

  async expectProductVisible(productName: string) {
    await expect(this.page.getByText(productName).first()).toBeVisible({ timeout: 20_000 });
  }
}
