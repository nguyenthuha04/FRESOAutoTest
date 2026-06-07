import { expect, Locator, Page } from '@playwright/test';
import { CreateProductData } from '../../data/admin/create-product.data';

export class AddEditProductPage {
  constructor(private readonly page: Page) {}

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/admin\/product-management\/add-edit-product/);
    await expect(this.page.getByText('Thêm sản phẩm').first()).toBeVisible();
  }

  async fillValidProduct(data: CreateProductData) {
    await this.fillTextField('Tên sản phẩm', data.productName);
    await this.selectByLabel('Ngành hàng', data.industry);
    await this.selectByLabel('Nhóm sản phẩm', data.productGroup);
    await this.fillTextField('Đơn vị tính', data.unit);
    await this.fillTextField('Xuất xứ', data.origin);
    await this.fillDescription(data.description);
  }

  async fillWithoutProductName(data: CreateProductData) {
    await this.selectByLabel('Ngành hàng', data.industry);
    await this.selectByLabel('Nhóm sản phẩm', data.productGroup);
    await this.fillTextField('Đơn vị tính', data.unit);
    await this.fillTextField('Xuất xứ', data.origin);
    await this.fillDescription(data.description);
  }

  async fillWithoutIndustry(data: CreateProductData) {
    await this.fillTextField('Tên sản phẩm', data.productName);
    await this.fillTextField('Đơn vị tính', data.unit);
    await this.fillTextField('Xuất xứ', data.origin);
  }

  async fillWithoutProductGroup(data: CreateProductData) {
    await this.fillTextField('Tên sản phẩm', data.productName);
    await this.selectByLabel('Ngành hàng', data.industry);
    await this.fillTextField('Đơn vị tính', data.unit);
    await this.fillTextField('Xuất xứ', data.origin);
    await this.fillDescription(data.description);
  }

  async fillWithoutUnit(data: CreateProductData) {
    await this.fillTextField('Tên sản phẩm', data.productName);
    await this.selectByLabel('Ngành hàng', data.industry);
    await this.selectByLabel('Nhóm sản phẩm', data.productGroup);
    await this.fillTextField('Xuất xứ', data.origin);
    await this.fillDescription(data.description);
  }

  async fillWithoutOrigin(data: CreateProductData) {
    await this.fillTextField('Tên sản phẩm', data.productName);
    await this.selectByLabel('Ngành hàng', data.industry);
    await this.selectByLabel('Nhóm sản phẩm', data.productGroup);
    await this.fillTextField('Đơn vị tính', data.unit);
    await this.fillDescription(data.description);
  }

  async fillWithoutDescription(data: CreateProductData) {
    await this.fillTextField('Tên sản phẩm', data.productName);
    await this.selectByLabel('Ngành hàng', data.industry);
    await this.selectByLabel('Nhóm sản phẩm', data.productGroup);
    await this.fillTextField('Đơn vị tính', data.unit);
    await this.fillTextField('Xuất xứ', data.origin);
  }

  async uploadProductImages(paths: string[]) {
    if (paths.length === 0) {
      return;
    }

    await this.page.locator('input#coverImageInput').setInputFiles(paths[0]);
    if (paths.length > 1) {
      await this.page.locator('input#additionalImageInput').setInputFiles(paths.slice(1));
    }
  }

  async uploadInvalidImage(path: string) {
    await this.page.locator('input#coverImageInput').setInputFiles(path);
  }

  async save() {
    await this.page.getByRole('button', { name: 'Lưu thông tin' }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: 'Hủy bỏ' }).click();
    const confirmButton = this.page.getByRole('button', { name: 'Đồng ý' });
    if (await confirmButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await confirmButton.click();
    }
  }

  async expectCreateFormVisible() {
    await this.expectLoaded();
    await expect(this.page.getByText('Thông tin sản phẩm')).toBeVisible();
    await expect(this.page.getByText('Ảnh sản phẩm')).toBeVisible();
  }

  async expectValidationMessage(message: string) {
    await expect(this.page.getByText(message).first()).toBeVisible({ timeout: 10_000 });
  }

  async expectAnyValidationMessage(messages: string[]) {
    await expect
      .poll(
        async () => {
          const bodyText = await this.page.locator('body').innerText().catch(() => '');
          return messages.some((message) => bodyText.includes(message));
        },
        { timeout: 10_000 },
      )
      .toBe(true);
  }

  async expectSuccessMessageOrProductList(productName: string) {
    const successMessage = this.page.getByText('Tạo sản phẩm thành công').or(this.page.getByText('thành công')).first();
    const productInList = this.page.getByText(productName).first();

    if (await successMessage.isVisible({ timeout: 30_000 }).catch(() => false)) {
      await expect(successMessage).toBeVisible();
      return;
    }

    await expect(productInList).toBeVisible({ timeout: 30_000 });
  }

  private async fillTextField(label: string, value: string) {
    const input = this.inputByName(label);
    await expect(input).toBeVisible();
    await input.fill(value);
  }

  private inputByName(label: string) {
    return this.page.locator(`input[name="${label}"]`).first();
  }

  private async fillDescription(value: string) {
    const editor = this.page.locator('.ql-editor, [contenteditable="true"]').first();
    if (await editor.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await editor.fill(value);
      return;
    }

    const textarea = this.page.locator('textarea[name="Mô tả sản phẩm"], textarea').first();
    if (await textarea.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await textarea.fill(value);
    }
  }

  private async selectByLabel(label: string, preferredOption: string) {
    const select = this.selectContainer(label).locator('[role=combobox], p-select, .p-select').first();
    await select.click();
    await this.page.waitForTimeout(500);

    const preferred = this.page.getByRole('option', { name: preferredOption, exact: true });
    if (await preferred.count()) {
      await preferred.first().click();
      return;
    }

    const firstValidOption = this.page
      .locator('[role=option], .p-select-option, p-dropdownitem, li[role=option]')
      .filter({ hasNotText: 'No results found' })
      .first();
    await expect(firstValidOption).toBeVisible({ timeout: 10_000 });
    await firstValidOption.click();
  }

  private selectContainer(label: string): Locator {
    return this.page.locator('app-cus-select').filter({ hasText: label }).first();
  }
}
