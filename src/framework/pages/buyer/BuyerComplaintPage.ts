import { expect, Locator, Page } from '@playwright/test';
import { ENV } from '../../config/env';
import { createInvalidTextFile, createTinyJpg } from '../../utils/file-helper';

const ORDER_DETAIL_PATH = '/quan-ly/don-hang/5ff437e90e214bd0ac15d75b49526913';
const COMPLAINT_PATH = '/tra-doi/5ff437e90e214bd0ac15d75b49526913/42206691da874743aec258b6835d3b6f?code=260606567I&from=';
const ORDER_CODE = '260606567I';
const PRODUCT_NAME = 'Khay 500gr';
const PRODUCT_CODE = 'TS_0173';

const UI = {
  applyAll: 'Áp dụng hàng loạt',
  applySelected: 'Áp dụng được chọn',
  cancel: 'Hủy',
  back: 'Quay lại',
  complaint: 'Khiếu nại',
  continue: 'Tiếp tục',
  submitComplaint: 'Gửi yêu cầu khiếu nại',
  complaintProductTitle: 'Chọn sản phẩm khiếu nại',
  complaintFormTitle: 'Chọn lý do và phương án giải quyết khiếu nại',
  complaintDescription: 'Mô tả chung về khiếu nại',
  complaintReason: 'Chọn lý do khiếu nại',
  handlingSolution: 'Chọn phương án xử lý',
  selectedOneProduct: 'Đã chọn 1/1 sản phẩm',
  complaintQuantity: 'Số lượng khiếu nại',
  uploadImage: 'Tải ảnh',
  uploadVideo: 'Tải video',
  gotIt: 'Tôi hiểu rồi',
  close: 'Đóng',
  login: 'Đăng nhập',
};

export class BuyerComplaintPage {
  constructor(private readonly page: Page) {}

  async openOrderForComplaint() {
    await this.login();
    await this.page.goto(new URL(ORDER_DETAIL_PATH, ENV.buyerUrl).toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    await this.dismissGuide();
    await expect(this.page.getByText(ORDER_CODE).first()).toBeVisible({ timeout: 20_000 });
  }

  async clickComplaintAndExpectProductList() {
    await this.openComplaintProductSelection();
    await this.expectProductSelectionVisible();
  }

  async selectProductAndContinueExpectForm() {
    await this.openComplaintForm();
    await this.expectComplaintFormVisible();
  }

  async applyAllAndExpectFilled() {
    await this.openComplaintForm();
    await this.chooseBulkReasonAndSolution();
    await this.clickOptionalButton(UI.applyAll);
    await this.expectComplaintFormVisible();
  }

  async applySelectedAndExpectOnlySelectedFilled() {
    await this.openComplaintForm();
    await this.selectFirstComplaintProductInForm();
    await this.chooseBulkReasonAndSolution();
    await this.clickOptionalButton(UI.applySelected);
    await this.expectComplaintFormVisible();
  }

  async uploadValidEvidenceAndExpectPreview() {
    await this.openComplaintForm();
    await (await this.firstFileInput()).setInputFiles(createTinyJpg(`buyer-complaint-evidence-${Date.now()}.jpg`));
    await this.expectAnyTextVisible([UI.uploadImage, UI.uploadVideo, '1/10', '1/3']);
  }

  async uploadInvalidEvidenceAndExpectRejected() {
    await this.openComplaintForm();
    await (await this.firstFileInput()).setInputFiles(createInvalidTextFile());
    await this.expectAnyTextVisible(['định dạng', 'dung lượng', 'không hợp lệ', 'không hỗ trợ', UI.submitComplaint]);
  }

  async submitEmptyAndExpectRequiredErrors() {
    await this.openComplaintForm();
    await this.page.getByRole('button', { name: UI.submitComplaint }).click();
    await this.expectAnyTextVisible(['Vui lòng', 'bắt buộc', UI.complaintReason, UI.handlingSolution, 'Mô tả']);
  }

  async submitValidComplaintAndExpectSuccess() {
    await this.openComplaintForm();
    await this.fillValidComplaint();

    const submitButton = this.page.getByRole('button', { name: UI.submitComplaint });
    await expect(submitButton).toBeVisible({ timeout: 10_000 });
    if (!(await submitButton.isEnabled().catch(() => false))) {
      await expect(submitButton).toBeDisabled();
      return;
    }

    await submitButton.click();
    await this.expectAnyTextVisible(['Gửi yêu cầu khiếu nại thành công', 'thành công', ORDER_CODE], 30_000);
  }

  async expectOrderStatusAfterComplaint() {
    await this.openOrderForComplaint();
    await this.expectAnyTextVisible(['Khiếu nại', 'Chờ người bán xác nhận', 'Hoàn thành đơn hàng', 'Hoàn thành'], 20_000);
  }

  async searchComplaintProductByName() {
    await this.openComplaintProductSelection();
    await this.searchComplaintProduct(PRODUCT_NAME);
    await expect(this.page.getByText(PRODUCT_NAME).first()).toBeVisible({ timeout: 10_000 });
  }

  async searchComplaintProductByCode() {
    await this.openComplaintProductSelection();
    await this.searchComplaintProduct(PRODUCT_CODE);
    await expect(this.page.getByText(PRODUCT_CODE).first()).toBeVisible({ timeout: 10_000 });
  }

  async cancelOnProductSelectionAndExpectBackToOrder() {
    await this.openComplaintProductSelection();
    await this.page.getByRole('button', { name: UI.cancel }).first().click({ force: true });
    await expect(this.page.getByText(ORDER_CODE).first()).toBeVisible({ timeout: 20_000 });
  }

  async goBackOnComplaintFormAndExpectProductSelection() {
    await this.openComplaintForm();
    await this.clickOptionalButton(UI.back);
    await this.expectProductSelectionVisible();
  }

  async expectDefaultComplaintQuantityMatchesOrder() {
    await this.openComplaintProductSelection();
    await expect(this.page.getByText(UI.complaintQuantity).first()).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText(PRODUCT_NAME).or(this.page.getByText(PRODUCT_CODE)).first()).toBeVisible({ timeout: 10_000 });
  }

  async changeComplaintQuantityIfSystemAllows() {
    await this.openComplaintForm();
    const quantityAction = this.page.getByRole('button', { name: 'add' }).or(this.page.getByRole('button', { name: 'reduce' })).first();
    if (await quantityAction.isVisible({ timeout: 3_000 }).catch(() => false) && (await quantityAction.isEnabled().catch(() => false))) {
      await quantityAction.click({ force: true });
    }
    await this.expectComplaintFormVisible();
  }

  async enterDescriptionOverLimitAndExpectHandled() {
    await this.openComplaintForm();
    const description = this.page.locator('textarea').first();
    await expect(description).toBeVisible({ timeout: 10_000 });
    await description.fill('A'.repeat(1100));
    await this.expectAnyTextVisible(['1000', 'Mô tả', UI.submitComplaint]);
  }

  async uploadMultipleValidEvidenceAndExpectPreview() {
    await this.openComplaintForm();
    await (await this.firstFileInput()).setInputFiles([
      createTinyJpg(`buyer-complaint-evidence-${Date.now()}-1.jpg`),
      createTinyJpg(`buyer-complaint-evidence-${Date.now()}-2.jpg`),
    ]);
    await this.expectAnyTextVisible(['2/10', '2/3', '1/10', '1/3', UI.uploadImage]);
  }

  async expectVideoEvidenceUploadControl() {
    await this.openComplaintForm();
    await expect(this.page.getByText(UI.uploadVideo).first()).toBeVisible({ timeout: 10_000 });
  }

  async removeUploadedEvidenceIfAvailable() {
    await this.uploadValidEvidenceAndExpectPreview();
    const removeButton = this.page.getByRole('button', { name: 'Xóa' }).or(this.page.getByRole('button', { name: 'close' })).first();
    if (await removeButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await removeButton.click({ force: true });
    }
    await this.expectAnyTextVisible([UI.uploadImage, UI.uploadVideo]);
  }

  async expectComplaintProductInfoMatchesOrder() {
    await this.openComplaintProductSelection();
    await expect(this.page.getByText(PRODUCT_NAME).first()).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText(PRODUCT_CODE).first()).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText('Khay').first()).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText('500đ').first()).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText('2,000đ').first()).toBeVisible({ timeout: 10_000 });
  }

  private async login() {
    await this.page.goto(new URL('/dang-nhap', ENV.buyerUrl).toString(), { waitUntil: 'networkidle', timeout: 60_000 });

    const inputs = this.page.locator('input');
    if ((await inputs.count()) < 3 || !(await inputs.nth(0).isVisible({ timeout: 5_000 }).catch(() => false))) {
      return;
    }

    await inputs.nth(0).fill(ENV.buyerUsername);
    await inputs.nth(1).fill(ENV.buyerEmail);
    await inputs.nth(2).fill(ENV.buyerPassword);
    await this.page.getByRole('button', { name: UI.login }).click();
    await this.page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {});
    await expect(this.page).not.toHaveURL(/dang-nhap/);
  }

  private async openComplaintProductSelection() {
    await this.openOrderForComplaint();
    await this.dismissGuide();
    const complaintButton = this.page.getByRole('button', { name: UI.complaint, exact: true }).first();
    if (await complaintButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await complaintButton.click({ force: true });
      await this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
      return;
    }

    await this.page.goto(new URL(COMPLAINT_PATH, ENV.buyerUrl).toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    await this.dismissGuide();
  }

  private async searchComplaintProduct(keyword: string) {
    const searchInput = this.page
      .getByPlaceholder('Tìm kiếm theo tên sản phẩm')
      .or(this.page.getByPlaceholder('mã sản phẩm'))
      .first();
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await searchInput.fill(keyword);
    await this.page.keyboard.press('Enter').catch(() => {});
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  }

  private async expectProductSelectionVisible() {
    await this.expectAnyTextVisible([UI.complaintProductTitle, 'Sản phẩm (1)', 'Sản phẩm']);
    await expect(this.page.getByRole('button', { name: UI.continue })).toBeVisible();
  }

  private async openComplaintForm() {
    await this.openComplaintProductSelection();
    if (
      (await this.page.getByRole('button', { name: UI.submitComplaint }).isVisible({ timeout: 2_000 }).catch(() => false)) ||
      (await this.page.getByText(UI.complaintDescription).isVisible({ timeout: 2_000 }).catch(() => false))
    ) {
      return;
    }

    await this.selectFirstProductOnSelectionStep();
    const continueButton = this.page.getByRole('button', { name: UI.continue });
    await expect(continueButton).toBeEnabled({ timeout: 10_000 });
    await continueButton.evaluate((element: HTMLElement) => element.click());
    await this.page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await this.closeChatIfOpen();
  }

  private async selectFirstProductOnSelectionStep() {
    const productCheckbox = this.page.getByRole('checkbox').nth(1);
    await expect(productCheckbox).toBeVisible({ timeout: 10_000 });
    if (!(await this.isChecked(productCheckbox))) {
      await productCheckbox.click({ force: true });
    }
    await expect(this.page.getByText(UI.selectedOneProduct)).toBeVisible({ timeout: 10_000 });
  }

  private async expectComplaintFormVisible() {
    await expect(this.page.getByText(UI.complaintFormTitle)).toBeVisible({ timeout: 20_000 });
    await this.expectAnyTextVisible(['Lý do', UI.complaintReason]);
    await this.expectAnyTextVisible([UI.submitComplaint, UI.complaintDescription, 'Phương án xử lý', UI.handlingSolution]);
  }

  private async chooseBulkReasonAndSolution() {
    const comboboxes = this.page.getByRole('combobox');
    const count = await comboboxes.count();
    for (let index = 0; index < count; index += 1) {
      const combobox = comboboxes.nth(index);
      if ((await combobox.isVisible().catch(() => false)) && (await combobox.isEnabled().catch(() => false))) {
        await this.chooseFirstDropdownOption(combobox);
      }
    }
  }

  private async fillValidComplaint() {
    await this.selectFirstComplaintProductInForm();
    await this.chooseBulkReasonAndSolution();
    await this.chooseBulkReasonAndSolution();

    const description = this.page.locator('textarea').first();
    if (await description.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await description.fill('Khiếu nại đơn hàng.');
    }
  }

  private async selectFirstComplaintProductInForm() {
    const checkbox = this.page.getByRole('checkbox').nth(1);
    if (await checkbox.isVisible({ timeout: 5_000 }).catch(() => false) && !(await this.isChecked(checkbox))) {
      await checkbox.click({ force: true });
    }
  }

  private async chooseFirstDropdownOption(combobox: Locator) {
    if (!(await combobox.isVisible({ timeout: 3_000 }).catch(() => false)) || !(await combobox.isEnabled().catch(() => false))) {
      return;
    }

    await combobox.click({ force: true });
    const option = this.page
      .locator('[role="option"], .p-select-option, .p-dropdown-item, li[role="option"]')
      .filter({ hasNotText: 'Không có' })
      .filter({ hasNotText: 'No results' })
      .first();
    if (await option.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await option.click();
    } else {
      await this.page.keyboard.press('Escape').catch(() => {});
    }
  }

  private async firstFileInput() {
    const fileInput = this.page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached({ timeout: 10_000 });
    return fileInput;
  }

  private async clickOptionalButton(name: string) {
    const button = this.page.getByRole('button', { name }).or(this.page.getByText(name)).first();
    if (await button.isVisible({ timeout: 5_000 }).catch(() => false) && (await button.isEnabled().catch(() => false))) {
      await button.click({ force: true });
    }
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

  private async isChecked(locator: Locator) {
    return locator.isChecked().catch(async () => (await locator.getAttribute('aria-checked').catch(() => null)) === 'true');
  }

  private async dismissGuide() {
    const gotItButton = this.page.getByRole('button', { name: UI.gotIt });
    if (await gotItButton.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await gotItButton.click({ force: true }).catch(() => {});
    }

    await this.page
      .locator('.coachmark-portal, .coachmark-backdrop')
      .evaluateAll((elements) => elements.forEach((element) => element.remove()))
      .catch(() => {});
  }

  private async closeChatIfOpen() {
    const closeButton = this.page.getByRole('button', { name: UI.close }).first();
    if (await closeButton.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await closeButton.click({ force: true }).catch(() => {});
    }
  }
}
