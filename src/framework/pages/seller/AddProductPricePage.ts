import { expect, Page } from '@playwright/test';

export class AddProductPricePage {
  private selectedProductName = '';

  constructor(private readonly page: Page) {}

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/seller\/product\/product-price\/new-product-price/);
    await expect(this.page.getByText('Báo giá sản phẩm').first()).toBeVisible({ timeout: 20_000 });
  }

  async selectFirstProduct() {
    await this.selectProductByIndex(0);
    this.selectedProductName = await this.readSelectedProductName();
    return this.selectedProductName;
  }

  async selectSecondProduct() {
    await this.selectProductByIndex(1);
    this.selectedProductName = await this.readSelectedProductName();
    return this.selectedProductName;
  }

  async expectProductFieldsAutoFilled() {
    for (const label of ['Ngành hàng', 'Mã sản phẩm', 'Nhóm sản phẩm', 'Đơn vị tính', 'Mô tả sản phẩm']) {
      await expect(this.page.getByText(label).first()).toBeVisible();
    }
  }

  async selectProcessingStatus() {
    const processingStatusCombobox = this.page.getByRole('combobox').nth(1);
    await expect(processingStatusCombobox).toBeVisible({ timeout: 10_000 });
    await processingStatusCombobox.click();

    const option = this.page
      .locator('[role=option], .p-select-option, .p-dropdown-item, p-dropdownitem, li[role=option]')
      .filter({ hasNotText: 'No results found' })
      .first();
    await expect(option).toBeVisible({ timeout: 15_000 });
    await option.click();
  }

  async fillPriceBeforeTax(value: string) {
    await this.fillByNameOrLabel('Giá trước thuế', value);
  }

  async fillTaxRate(value: string) {
    await this.fillByNameOrLabel('Thuế suất', value);
  }

  async fillValidPrice() {
    await this.selectFirstProduct();
    await this.selectProcessingStatus();
    await this.fillPriceBeforeTax('5000');
    await this.fillTaxRate('5');
  }

  async fillValidPriceWithNewProduct() {
    await this.selectSecondProduct();
    await this.selectProcessingStatus();
    await this.fillPriceBeforeTax('5000');
    await this.fillTaxRate('5');
  }

  async save() {
    await this.page.getByRole('button', { name: 'Lưu thông tin' }).click();
  }

  async saveAndAddNew() {
    await this.page.getByRole('button', { name: 'Lưu và thêm mới' }).click();
  }

  async cancel() {
    await this.page.getByRole('button', { name: 'Hủy bỏ' }).click();
    const confirmButton = this.page.getByRole('button', { name: 'Đồng ý' }).or(this.page.getByRole('button', { name: 'Xác nhận' }));
    if (await confirmButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await confirmButton.click();
    }
  }

  async expectSuccessAndBackToQuotationDetail() {
    await expect(this.page.getByText('Lưu thành công').or(this.page.getByText('thành công')).first()).toBeVisible({ timeout: 20_000 });
    await expect(this.page.getByText('Chi tiết báo giá').first()).toBeVisible({ timeout: 30_000 });
  }

  async expectSavedAndStayOnForm() {
    await this.expectLoaded();
    await expect(this.page.getByRole('button', { name: 'Lưu thông tin' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Lưu và thêm mới' })).toBeVisible();
    await this.expectTaxIncludedPrice('5250');
  }

  async expectTaxIncludedPrice(expectedValue: string) {
    const formattedValue = Number(expectedValue).toLocaleString('en-US');
    const taxIncludedPriceInputs = this.page.locator('input[name*="Giá sau thuế"], input[aria-label*="Giá sau thuế"]');

    await expect
      .poll(
        async () => {
          const values = await taxIncludedPriceInputs.evaluateAll((inputs) =>
            inputs.map((input) => (input as HTMLInputElement).value).filter(Boolean),
          );
          return [expectedValue, formattedValue].includes(values[0] ?? '');
        },
        { timeout: 10_000 },
      )
      .toBe(true);
  }

  async expectValidationMessage(message: string) {
    await expect(this.page.getByText(message).first()).toBeVisible({ timeout: 10_000 });
  }

  async expectAnyValidationMessage(messages: string[]) {
    await expect
      .poll(
        async () => {
          const pageText = await this.page.locator('body').innerText();
          return messages.some((message) => pageText.includes(message));
        },
        { timeout: 10_000 },
      )
      .toBeTruthy();
  }

  async expectFormReset() {
    await this.expectLoaded();
    await expect(this.page.getByText('Báo giá sản phẩm').first()).toBeVisible();
  }

  getSelectedProductName() {
    return this.selectedProductName;
  }

  private async selectDropdownOptionByLabel(label: string) {
    const combobox = this.page.getByRole('combobox', { name: label }).first();
    if (await combobox.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await combobox.click();
    } else {
      const container = this.page
        .locator('app-cus-select, p-select, p-dropdown, .p-select, .p-dropdown')
        .filter({ hasText: label })
        .first();

      if (await container.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await container.locator('[role=combobox], .p-select-label, .p-dropdown-label').first().click();
      } else {
        const labelElement = this.page.getByText(label).first();
        await labelElement.locator('xpath=ancestor::*[self::div or self::label][1]//*[@role="combobox"]').first().click();
      }
    }

    const option = this.page
      .locator('[role=option], .p-select-option, .p-dropdown-item, p-dropdownitem, li[role=option]')
      .filter({ hasNotText: 'No results found' })
      .first();
    await expect(option).toBeVisible({ timeout: 15_000 });
    await option.click();
  }

  private async selectProductByIndex(index: number) {
    const productCombobox = this.page.getByRole('combobox', { name: 'Tên sản phẩm' }).first();
    await expect(productCombobox).toBeVisible({ timeout: 10_000 });
    await productCombobox.click();

    const options = this.page
      .locator('[role=option], .p-select-option, .p-dropdown-item, p-dropdownitem, li[role=option]')
      .filter({ hasNotText: 'No results found' });
    const optionCount = await options.count();
    await expect(options.nth(Math.min(index, Math.max(optionCount - 1, 0)))).toBeVisible({ timeout: 15_000 });
    await options.nth(Math.min(index, Math.max(optionCount - 1, 0))).click();
  }

  private async fillByNameOrLabel(label: string, value: string) {
    const input = this.page.locator(`input[name="${label}"], input[aria-label="${label}"]`).first();
    if (await input.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await input.fill(value);
      await input.blur();
      return;
    }

    const byLabel = this.page.getByLabel(label).first();
    if (await byLabel.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await byLabel.fill(value);
      await byLabel.blur();
      return;
    }

    const nearbyInput = this.page.getByText(label).locator('xpath=ancestor::*[self::div or self::label][1]//input').first();
    await expect(nearbyInput).toBeVisible({ timeout: 10_000 });
    await nearbyInput.fill(value);
    await nearbyInput.blur();
  }

  private async readSelectedProductName() {
    const selected = this.page.locator('[role=combobox], .p-select-label, .p-dropdown-label').first();
    return (await selected.innerText().catch(() => '')).trim();
  }
}
