import { expect, Page } from '@playwright/test';

export class QuotationDetailPage {
  constructor(private readonly page: Page) {}

  async openExistingQuotationDetail() {
    await this.openQuotationList();

    const detailAction = this.page
      .getByRole('button', { name: 'Chi tiết' })
      .or(this.page.getByRole('button', { name: 'Xem chi tiết' }))
      .first();

    if (await detailAction.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await detailAction.click();
    } else {
      const firstRow = this.page
        .locator('tbody tr, table tr')
        .filter({ hasNotText: 'Tên' })
        .filter({ hasNotText: 'Mã' })
        .filter({ hasNotText: 'Trạng thái' })
        .first();
      await expect(firstRow).toBeVisible({ timeout: 15_000 });
      await firstRow.click();
    }

    await this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    await this.expectLoaded();
  }

  async expectLoaded() {
    await expect(this.page.getByText('Chi tiết báo giá').first()).toBeVisible({ timeout: 20_000 });
    await expect(this.page.getByRole('button', { name: 'Thêm sản phẩm' })).toBeVisible();
    await expect(this.page.locator('table, [role=table], tbody').first()).toBeVisible();
  }

  async openAddProductPopup() {
    await this.expectLoaded();
    await this.page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await this.expectAddProductPopupVisible();
  }

  async expectAddProductPopupVisible() {
    const dialog = this.page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await expect(dialog.getByText('Thêm sản phẩm').first()).toBeVisible();
    await expect(dialog.getByText('Thêm sản phẩm hàng loạt')).toBeVisible();
    await expect(dialog.getByText('Thêm sản phẩm đơn lẻ')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Xác nhận' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Hủy bỏ' })).toBeVisible();
  }

  async chooseSingleProductAndConfirm() {
    await this.openAddProductPopup();
    const dialog = this.page.getByRole('dialog').first();
    await dialog.getByText('Thêm sản phẩm đơn lẻ').click();
    await dialog.getByRole('button', { name: 'Xác nhận' }).click();
    await this.page.waitForURL(/\/seller\/product\/product-price\/new-product-price/, { timeout: 60_000 });
  }

  async expectProductVisible(productName: string) {
    await this.expectLoaded();
    await expect(this.page.getByText(productName).first()).toBeVisible({ timeout: 20_000 });
  }

  private async openQuotationList() {
    const directUrls = [
      '/freso/seller/product/product-price',
      '/freso/seller/product/product-price/list',
      '/freso/seller/product/quotation',
    ];

    for (const url of directUrls) {
      await this.page.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
      if (await this.page.getByText('Danh sách báo giá').first().isVisible({ timeout: 5_000 }).catch(() => false)) {
        return;
      }
    }

    const menu = this.page.getByText('Báo giá').first();
    await expect(menu).toBeVisible({ timeout: 20_000 });
    await menu.click();
  }
}
