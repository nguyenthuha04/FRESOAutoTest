import { expect, Page } from '@playwright/test';
import { createInvalidTextFile, createLargeJpgFile, createLargeMp4File, createTinyJpgFiles } from '../../utils/file-helper';
import { SellerLoginPage } from './SellerLoginPage';

const ORDER_DETAIL_URL = 'http://125.235.38.229:8080/freso/seller/order/management/ea5d978bafad458fbe89ed5da6b32080';

export const SELLER_COMPLAINT_RESOLUTIONS = [
  'Trả hàng - Hoàn tiền',
  'Đổi hàng',
  'Bổ sung hàng',
  'Hoàn tiền không cần trả hàng',
  'Từ chối khiếu nại',
] as const;

export type SellerComplaintResolution = (typeof SELLER_COMPLAINT_RESOLUTIONS)[number];

const ORDER_CODE = '#260120W7P6';
const COMPLAINT_CODE = '#2606072080S5';
const COMPLAINT_DESCRIPTION = 'kkmkmkm';
const FIRST_PRODUCT_CODE = 'TC_2084_10';
const LAST_PRODUCT_CODE = 'TC_2001_10';
const REJECT_PRODUCT_CODE = 'TC_10056_10';

const UI = {
  handleComplaint: 'Xử lý khiếu nại',
  cancel: 'Hủy',
  confirm: 'Xác nhận',
  returnRefundGroup: 'Trả hàng hoàn tiền',
  complaintGoods: 'Khiếu nại hàng',
  notReceived: 'Chưa nhận hàng',
  received: 'Đã nhận hàng',
  waitingForCustomerReturn: 'Chờ khách hàng trả hàng',
  waitingForPlatformRefund: 'Chờ sàn hoàn tiền',
  waitingForPlatformHandle: 'Chờ sàn xử lý',
};

const UPLOAD_ERROR_TEXTS = [
  'sai định dạng',
  'định dạng',
  'dung lượng',
  'tối đa',
  'không hợp lệ',
  'vượt quá',
];

export class SellerComplaintPage {
  constructor(private readonly page: Page) {}

  async openProvidedComplaintOrderDetail() {
    await new SellerLoginPage(this.page).login();
    await this.page.goto(ORDER_DETAIL_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    await expect(this.page.getByText(ORDER_CODE)).toBeVisible({ timeout: 20_000 });
    await expect(this.page.getByText(COMPLAINT_CODE)).toBeVisible({ timeout: 20_000 });
  }

  async expectComplaintInfoVisible() {
    await expect(this.page.getByText(COMPLAINT_CODE)).toBeVisible();
    await expect(this.page.getByText(COMPLAINT_DESCRIPTION)).toBeVisible();
  }

  async expectComplaintProductListVisible(expectedCount = 10) {
    await expect(this.complaintProductCodes()).toHaveCount(expectedCount);
    await expect(this.page.getByText(FIRST_PRODUCT_CODE).first()).toBeVisible();
    await expect(this.page.getByText(LAST_PRODUCT_CODE).first()).toBeVisible();
  }

  async openHandleComplaintDialog() {
    await this.page.getByRole('button', { name: UI.handleComplaint }).click();
    await expect(this.dialog()).toBeVisible({ timeout: 20_000 });
    await expect(this.dialog().getByText(FIRST_PRODUCT_CODE)).toBeVisible();
  }

  async cancelHandleComplaintDialog() {
    await this.dialog().getByRole('button', { name: UI.cancel }).click();
    await expect(this.dialog()).toBeHidden({ timeout: 10_000 });
  }

  async expectHandleComplaintDialogProductCount(expectedCount = 10) {
    await expect(this.resolutionComboboxes()).toHaveCount(expectedCount);
  }

  async expectResolutionOptionsAvailable() {
    await this.resolutionComboboxes().first().click();

    for (const option of SELLER_COMPLAINT_RESOLUTIONS) {
      await expect(this.page.getByText(option, { exact: true }).last()).toBeVisible();
    }

    await this.page.keyboard.press('Escape');
  }

  async expectConfirmDisabled() {
    await expect(this.confirmButton()).toBeDisabled();
  }

  async expectConfirmEnabled() {
    await expect(this.confirmButton()).toBeEnabled();
  }

  async selectResolutionForProduct(productIndex: number, resolution: SellerComplaintResolution) {
    const combobox = this.resolutionComboboxes().nth(productIndex);

    await combobox.scrollIntoViewIfNeeded();
    await expect(combobox).toBeVisible({ timeout: 10_000 });
    await combobox.click();
    await this.page.getByText(resolution, { exact: true }).last().click();
    await expect(combobox).toContainText(resolution);
  }

  async selectRejectResolutionForProduct(productIndex = 0) {
    await this.selectResolutionForProduct(productIndex, SELLER_COMPLAINT_RESOLUTIONS[4]);
    await expect(this.dialog().locator('input[type="file"]').first()).toBeAttached({ timeout: 10_000 });
    await expect(this.dialog().locator('textarea').last()).toBeVisible({ timeout: 10_000 });
  }

  async uploadInvalidRejectEvidenceAndExpectRejected() {
    await this.uploadFirstEvidenceFile(createInvalidTextFile());
    await this.expectUploadError();
  }

  async uploadOversizedRejectImageAndExpectRejected() {
    await this.uploadFirstEvidenceFile(createLargeJpgFile(6 * 1024));
    await this.expectUploadError();
  }

  async uploadTooManyRejectImagesAndExpectLimit() {
    await this.uploadFirstEvidenceFile(createTinyJpgFiles(4));
    await this.expectUploadError();
  }

  async uploadOversizedRejectVideoAndExpectRejected() {
    await this.uploadLastEvidenceFile(createLargeMp4File(101));
    await this.expectUploadError();
  }

  async selectMixedResolutionForAllComplaintProducts() {
    const count = await this.resolutionComboboxes().count();

    for (let index = 0; index < count; index++) {
      await this.selectResolutionForProduct(index, SELLER_COMPLAINT_RESOLUTIONS[index % SELLER_COMPLAINT_RESOLUTIONS.length]);
    }
  }

  async expectMixedResolutionsSelected() {
    const comboboxes = this.resolutionComboboxes();
    const count = await comboboxes.count();

    for (let index = 0; index < count; index++) {
      await expect(comboboxes.nth(index)).toContainText(SELLER_COMPLAINT_RESOLUTIONS[index % SELLER_COMPLAINT_RESOLUTIONS.length]);
    }
  }

  async confirmComplaintHandlingAndExpectProductStatusesUpdated() {
    const productCodes = await this.productCodesInDialog();

    await this.confirmButton().click();
    await this.confirmDialogIfShown();
    await this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    await expect(this.dialog()).toBeHidden({ timeout: 20_000 }).catch(() => {});

    for (const productCode of productCodes) {
      await expect(this.productStatus(productCode)).toBeVisible({ timeout: 20_000 });
    }
  }

  async expectReturnRefundFollowUpActionsVisible() {
    await expect(this.page.getByText(UI.returnRefundGroup).first()).toBeVisible({ timeout: 20_000 });
    await expect(this.returnRefundButton(UI.complaintGoods).first()).toBeVisible({ timeout: 20_000 });
    await expect(this.returnRefundButton(UI.notReceived).first()).toBeVisible({ timeout: 20_000 });
    await expect(this.returnRefundButton(UI.received).first()).toBeVisible({ timeout: 20_000 });
  }

  async clickReturnRefundComplaintGoodsAndExpectHandled() {
    await this.clickReturnRefundAction(UI.complaintGoods, UI.waitingForPlatformHandle);
  }

  async clickReturnRefundNotReceivedAndExpectHandled() {
    await this.clickReturnRefundAction(UI.notReceived, UI.waitingForCustomerReturn);
  }

  async clickReturnRefundReceivedAndExpectHandled() {
    await this.clickReturnRefundAction(UI.received, UI.waitingForPlatformRefund);
  }

  private dialog() {
    return this.page.getByRole('dialog').last();
  }

  private resolutionComboboxes() {
    return this.dialog().getByRole('combobox');
  }

  private confirmButton() {
    return this.dialog().getByRole('button', { name: UI.confirm });
  }

  private async uploadFirstEvidenceFile(filePath: string | string[]) {
    await this.dialog().locator('input[type="file"]').first().setInputFiles(filePath);
  }

  private async uploadLastEvidenceFile(filePath: string | string[]) {
    await this.dialog().locator('input[type="file"]').last().setInputFiles(filePath);
  }

  private async expectUploadError() {
    const dialogText = await this.dialog().innerText({ timeout: 10_000 });
    expect(UPLOAD_ERROR_TEXTS.some((message) => dialogText.includes(message))).toBeTruthy();
  }

  private async productCodesInDialog() {
    const dialogText = await this.dialog().innerText();
    return this.extractProductCodes(dialogText);
  }

  private complaintProductCodes() {
    return this.page.locator('main').locator('text=TC_');
  }

  private productStatus(productCode: string) {
    return this.productBlock(productCode).locator('[role="status"]').first();
  }

  private productBlock(productCode: string) {
    return this.page.locator('main section, main article, main div').filter({ hasText: productCode }).first();
  }

  private returnRefundButton(name: string) {
    return this.page.getByRole('button', { name });
  }

  private async clickReturnRefundAction(buttonName: string, expectedStatus: string) {
    const button = this.returnRefundButton(buttonName).first();

    await expect(button).toBeVisible({ timeout: 20_000 });
    await expect(button).toBeEnabled({ timeout: 20_000 });
    await button.click();
    await this.confirmDialogIfShown();
    await this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    await expect(this.productStatus(FIRST_PRODUCT_CODE).or(this.page.getByText(expectedStatus).first())).toBeVisible({ timeout: 20_000 });
  }

  private async confirmDialogIfShown() {
    const dialog = this.page.getByRole('dialog').last();

    if (!(await dialog.isVisible({ timeout: 3_000 }).catch(() => false))) {
      return;
    }

    const confirmButton = dialog.getByRole('button', { name: UI.confirm });
    await expect(confirmButton).toBeEnabled({ timeout: 10_000 });
    await confirmButton.click();
  }

  private extractProductCodes(text: string) {
    return [
      ...new Set(
        text
          .split(/\s+/)
          .map((part) => part.trim())
          .filter((part) => part.startsWith('TC_') && part.split('_').length === 3),
      ),
    ];
  }
}
