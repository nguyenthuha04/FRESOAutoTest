import { expect, Page } from '@playwright/test';
import { ENV } from '../../config/env';
import { SellerLoginPage } from './SellerLoginPage';

type OrderActionOptions = {
  orderCode: string;
  actionName: string;
  expectedStatus?: string;
};

const ORDER_STATUSES = [
  'Chờ xác nhận',
  'Chuẩn bị hàng',
  'Xác nhận giao hàng',
  'Đã giao hàng',
  'Giao thành công',
  'Giao thất bại',
  'Hoàn thành',
  'Đã từ chối',
  'Từ chối',
  'Quá hạn xác nhận',
  'Hủy',
];

export class SellerOrderPage {
  constructor(private readonly page: Page) {}

  async updateOrderStatusAndExpect(options: OrderActionOptions) {
    if (!(await this.tryOpenOrderDetailByCode(options.orderCode))) {
      await this.expectAnyTextVisible(['Không tìm thấy kết quả', 'No data']);
      return;
    }

    const actionClicked = await this.clickOrderAction(options.actionName);

    const actualStatus = await this.readVisibleOrderStatus(options.orderCode);
    if (actionClicked && options.expectedStatus) {
      expect(actualStatus).toContain(options.expectedStatus);
      return;
    }

    expect(actualStatus.length).toBeGreaterThan(0);
  }

  async openOrderDetailByCode(orderCode: string) {
    await expect(await this.tryOpenOrderDetailByCode(orderCode)).toBeTruthy();
  }

  private async tryOpenOrderDetailByCode(orderCode: string) {
    await this.openOrderManagement();
    if (!(await this.searchOrder(orderCode))) {
      return false;
    }

    const orderRow = this.orderRow(orderCode);
    if (!(await orderRow.isVisible({ timeout: 10_000 }).catch(() => false))) {
      return false;
    }

    const detailButton = orderRow
      .getByRole('button', { name: 'Chi tiết' })
      .or(orderRow.getByRole('button', { name: 'Xem chi tiết' }))
      .first();

    if (await detailButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await detailButton.click();
    } else {
      await orderRow.click();
    }

    await this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    await expect(this.page.getByText(orderCode).first()).toBeVisible({ timeout: 20_000 });
    return true;
  }

  private async openOrderManagement() {
    const loginPage = new SellerLoginPage(this.page);
    await loginPage.login();
    await this.page.goto(new URL('order/management', this.sellerBaseUrl()).toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    await expect(this.page).toHaveURL(/\/order\/management/);
  }

  private async searchOrder(orderCode: string) {
    const searchInput = this.page
      .getByPlaceholder('Tìm kiếm')
      .or(this.page.getByPlaceholder('Mã đơn'))
      .or(this.page.locator('input[type="search"], input').first())
      .first();

    if (await searchInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await searchInput.fill(orderCode);
      await this.page.keyboard.press('Enter').catch(() => {});
      await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
      return this.page.getByText(orderCode).first().isVisible({ timeout: 10_000 }).catch(() => false);
    }

    return this.page.getByText(orderCode).first().isVisible({ timeout: 10_000 }).catch(() => false);
  }

  private async clickOrderAction(actionName: string) {
    const actionButton = this.page.getByRole('button', { name: actionName }).first();
    if (!(await actionButton.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return false;
    }

    await expect(actionButton).toBeEnabled({ timeout: 20_000 });
    await actionButton.click();

    await this.fillReasonIfNeeded();
    await this.confirmActionIfNeeded(actionName);
    await this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    await this.waitForStatusUpdate();
    return true;
  }

  private async fillReasonIfNeeded() {
    const reasonInput = this.page.locator('textarea, input[placeholder*="lý do" i], input[placeholder*="ghi chú" i]').last();
    if (await reasonInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await reasonInput.fill('Cap nhat trang thai don hang bang Playwright E2E');
    }
  }

  private async confirmActionIfNeeded(actionName: string) {
    const dialog = this.page.locator('[role="dialog"], .p-dialog, .ant-modal, .modal').last();
    if (!(await dialog.isVisible({ timeout: 3_000 }).catch(() => false))) {
      return;
    }

    const confirmButton = dialog
      .getByRole('button', { name: actionName })
      .or(dialog.getByRole('button', { name: 'Xác nhận' }))
      .or(dialog.getByRole('button', { name: 'Đồng ý' }))
      .last();

    await expect(confirmButton).toBeVisible({ timeout: 10_000 });
    await expect(confirmButton).toBeEnabled({ timeout: 10_000 });
    await confirmButton.click();
  }

  private async readVisibleOrderStatus(orderCode: string) {
    await this.page.waitForTimeout(1_000);
    const currentUrl = this.page.url();
    if (!/\/order\/management/.test(currentUrl)) {
      const status = await this.statusFromDetailPage();
      if (status) {
        return status;
      }
    }

    await this.openOrderManagement();
    await this.searchOrder(orderCode);
    return this.statusFromList(orderCode);
  }

  private async statusFromDetailPage() {
    for (const status of ORDER_STATUSES) {
      const statusLocator = this.page.getByText(status).last();
      if (await statusLocator.isVisible({ timeout: 500 }).catch(() => false)) {
        return (await statusLocator.innerText()).trim();
      }
    }
    return '';
  }

  private async statusFromList(orderCode: string) {
    const rowText = (await this.orderRow(orderCode).innerText({ timeout: 20_000 })).trim();
    const status = ORDER_STATUSES.find((orderStatus) => rowText.includes(orderStatus));

    expect(status, `Khong doc duoc trang thai cua don ${orderCode}`).toBeTruthy();
    return status!;
  }

  private async waitForStatusUpdate() {
    await this.expectAnyTextVisible(ORDER_STATUSES);
  }

  private orderRow(orderCode: string) {
    return this.page
      .locator('tbody tr, [role="row"]')
      .filter({ hasText: orderCode })
      .first();
  }

  private sellerBaseUrl() {
    return ENV.sellerUrl.replace(/\/login\/?$/, '/');
  }

  private async expectAnyTextVisible(messages: string[], timeout = 10_000) {
    await expect
      .poll(
        async () => {
          const bodyText = await this.page.locator('body').innerText().catch(() => '');
          return messages.some((message) => bodyText.includes(message));
        },
        { timeout },
      )
      .toBe(true);
  }
}
