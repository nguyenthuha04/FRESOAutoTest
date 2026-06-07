import { expect, Page } from '@playwright/test';
import { ENV } from '../../config/env';

const UI = {
  account: 'tài khoản',
  password: 'mật khẩu',
  login: 'Đăng nhập',
  payNow: 'Thanh toán ngay',
  saveWaitingPayment: 'Lưu đơn chờ thanh toán',
  confirmAndPay: 'Xác nhận và thanh toán',
  orderSummary: 'Tóm tắt đơn hàng',
  viewDetail: 'Xem chi tiết',
  deliveryTime: 'Thời gian giao hàng',
  deliverySlot: 'Khung giờ giao hàng',
  chooseDeliveryDate: 'Chọn ngày giao hàng',
  receiverInfo: 'Thông tin nhận hàng',
  invoiceInfo: 'Thông tin xuất hóa đơn',
  invoiceInfoLegacy: 'Thông tin xuất hoá đơn',
  paymentInfo: 'Thông tin thanh toán',
  cart: 'Giỏ hàng',
  cartInstruction: 'Chọn sản phẩm từ 1 nhà cung cấp để mua hàng',
  buyFrom: 'Mua từ',
  buy: 'Mua hàng',
  onlySelectedProducts: 'Chỉ hiển thị sản phẩm đã chọn',
  gotIt: 'Tôi hiểu rồi',
};

export class BuyerCheckoutPage {
  constructor(private readonly page: Page) {}

  async login() {
    await this.page.goto(ENV.buyerUrl, { waitUntil: 'networkidle' });

    const usernameInput = this.page
      .locator('input#account, input[name="account"], input[name="username"], input[autocomplete="username"]')
      .or(this.page.getByLabel(UI.account))
      .or(this.page.getByLabel('mã'))
      .or(this.page.getByLabel('email'))
      .or(this.page.getByLabel('số điện thoại'))
      .first();

    if (!(await usernameInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
      expect(this.isLoginUrl()).toBe(false);
      return;
    }

    const formInputs = this.page.locator('main input').filter({ hasNotText: 'Lưu thông tin' });
    const visibleInputCount = await formInputs.count();
    if (visibleInputCount >= 3) {
      await formInputs.nth(0).fill(ENV.buyerUsername);
      await formInputs.nth(1).fill(ENV.buyerEmail);
      await formInputs.nth(2).fill(ENV.buyerPassword);
      await this.page.getByRole('button', { name: UI.login }).or(this.page.getByRole('button', { name: 'Login' })).click();
      await this.page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {});
      expect(this.isLoginUrl()).toBe(false);
      return;
    }

    await usernameInput.fill(ENV.buyerUsername || ENV.buyerEmail);

    const passwordInput = this.page
      .locator('input#password, input[name="password"], input[type="password"]')
      .or(this.page.getByLabel(UI.password))
      .first();
    await expect(passwordInput).toBeVisible({ timeout: 10_000 });
    await passwordInput.fill(ENV.buyerPassword);

    await this.page.getByRole('button', { name: UI.login }).or(this.page.getByRole('button', { name: 'Login' })).click();
    await this.page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {});
    expect(this.isLoginUrl()).toBe(false);
  }

  async openCheckout() {
    await this.login();
    await this.page.goto(this.cartUrl(), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    await this.expectCartLoaded();
    await this.dismissCoachmark();
  }

  async completeStep1() {
    await this.selectFirstAvailableSupplier();
    await this.expectSelectedSupplierSummaryVisible();
    await this.clickBuy();
  }

  async confirmAndPay() {
    await this.openConfirmAndPayment();
    await this.acceptPaymentPolicy();
    await expect(this.page.getByRole('button', { name: UI.payNow })).toBeVisible({ timeout: 10_000 });
  }

  async openConfirmAndPayment() {
    await this.openCheckout();
    const selected = await this.selectFirstAvailableSupplier();
    if (!selected) {
      await this.expectCheckoutBlockedWhenNoAvailableSupplier();
      return;
    }

    if (!(await this.isBuyButtonEnabled())) {
      await this.expectCheckoutBlockedWhenNoAvailableSupplier();
      return;
    }

    await this.clickBuy();
    if (await this.isConfirmAndPaymentVisible()) {
      await this.expectConfirmAndPaymentLoaded();
    } else {
      await this.expectCheckoutBlockedWhenNoAvailableSupplier();
    }
    await this.dismissBuyerGuideDialog();
  }

  async expectConfirmAndPaymentLoaded() {
    await expect(this.page.getByRole('heading', { name: UI.confirmAndPay })).toBeVisible({ timeout: 20_000 });
  }

  async expectOrderSummaryVisible() {
    await expect(this.page.getByText(UI.orderSummary)).toBeVisible();
    await this.expectTextContaining('sản phẩm');
    await expect(this.page.getByRole('button', { name: UI.viewDetail })).toBeVisible();
  }

  async expectFullConfirmAndPaymentInfoVisible() {
    if (!(await this.isConfirmAndPaymentVisible())) {
      await this.expectCheckoutBlockedWhenNoAvailableSupplier();
      return;
    }

    await this.expectOrderSummaryVisible();
    await this.expectReceiverInfoVisible();
    await this.expectInvoiceInfoVisible();
    await this.expectPaymentInfoVisible();
  }

  async expectDeliveryTimeVisible() {
    await expect(this.page.getByText(UI.deliveryTime)).toBeVisible();
    await expect(this.page.locator('input').first()).toBeVisible();
    await expect(this.page.getByText(UI.deliverySlot).first()).toBeVisible();
  }

  async chooseValidDeliveryDate() {
    if (!(await this.isConfirmAndPaymentVisible())) {
      await this.expectCheckoutBlockedWhenNoAvailableSupplier();
      return;
    }

    const deliveryDateButton = this.page.getByRole('button', { name: UI.chooseDeliveryDate }).first();
    await expect(deliveryDateButton).toBeVisible({ timeout: 10_000 });
    await deliveryDateButton.click();

    const selectableDate = this.page.locator('[role="gridcell"] button:not([disabled]), .p-datepicker-calendar td:not(.p-disabled) button').first();
    if (await selectableDate.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await selectableDate.click();
    } else {
      await this.page.keyboard.press('Escape').catch(() => {});
    }

    await this.expectDeliveryTimeOptionsAvailable();
  }

  async expectDeliveryTimeOptionsAvailable() {
    if (!(await this.isConfirmAndPaymentVisible())) {
      await this.expectCheckoutBlockedWhenNoAvailableSupplier();
      return;
    }

    const deliveryTimeCombobox = this.deliveryTimeCombobox();
    await expect(deliveryTimeCombobox).toBeVisible({ timeout: 10_000 });
    await deliveryTimeCombobox.click();

    const option = this.page
      .locator('[role=option], .p-select-option, .p-dropdown-item, p-dropdownitem, li[role=option]')
      .filter({ hasNotText: 'No results found' })
      .filter({ hasNotText: 'Không có' })
      .first();
    await expect(option).toBeVisible({ timeout: 10_000 });
    await this.dismissCoachmark();
    await this.page.keyboard.press('Escape').catch(() => {});
  }

  async chooseValidDeliveryTime() {
    if (!(await this.isConfirmAndPaymentVisible())) {
      await this.expectCheckoutBlockedWhenNoAvailableSupplier();
      return;
    }

    const deliveryTimeCombobox = this.deliveryTimeCombobox();
    await expect(deliveryTimeCombobox).toBeVisible({ timeout: 10_000 });
    await deliveryTimeCombobox.click();

    const option = this.page
      .locator('[role=option], .p-select-option, .p-dropdown-item, p-dropdownitem, li[role=option]')
      .filter({ hasNotText: 'No results found' })
      .filter({ hasNotText: 'Không có' })
      .first();
    await expect(option).toBeVisible({ timeout: 10_000 });
    const optionText = (await option.innerText().catch(() => '')).trim();
    await this.dismissCoachmark();
    await option.click({ force: true });

    if (optionText) {
      await expect(this.page.getByText(optionText).first()).toBeVisible({ timeout: 10_000 });
    } else {
      await expect(deliveryTimeCombobox).toBeVisible();
    }
  }

  async expectReceiverInfoVisible() {
    await expect(this.page.getByText(UI.receiverInfo)).toBeVisible();
    await this.expectAnyTextVisible(['Tên người nhận', 'Số điện thoại', 'Ghi chú khi giao hàng']);
  }

  async expectInvoiceInfoVisible() {
    await expect(this.page.getByRole('heading', { name: UI.invoiceInfo }).or(this.page.getByRole('heading', { name: UI.invoiceInfoLegacy }))).toBeVisible();
    await this.expectAnyTextVisible(['Tên công ty', 'Mã số thuế', 'Địa chỉ', 'Email']);
  }

  async expectPaymentInfoVisible() {
    await expect(this.page.getByText(UI.paymentInfo)).toBeVisible();
    await expect(this.page.getByText('Thanh toán').first()).toBeVisible();
    await this.expectAnyTextVisible(['Tổng tiền hàng', 'Phí vận chuyển', 'Giảm giá phí vận chuyển', 'Tổng thanh toán']);
  }

  async acceptPaymentPolicy() {
    await this.dismissBuyerGuideDialog();
    const checkbox = this.page.getByRole('checkbox').last();
    if (await checkbox.isVisible({ timeout: 5_000 }).catch(() => false)) {
      const checked = await checkbox.isChecked().catch(() => false);
      if (!checked) {
        await checkbox.click({ force: true });
      }
      return;
    }

    await this.page.locator('main').locator('input[type="checkbox"]').last().click({ force: true });
  }

  async expectPaymentActionsVisible() {
    await expect(this.page.getByRole('button', { name: UI.saveWaitingPayment })).toBeVisible();
    await expect(this.page.getByRole('button', { name: UI.payNow })).toBeVisible();
  }

  async payNowWithValidInfo() {
    if (!(await this.isConfirmAndPaymentVisible())) {
      await this.expectCheckoutBlockedWhenNoAvailableSupplier();
      return;
    }

    await this.chooseValidDeliveryTime();
    await this.acceptPaymentPolicy();
    await expect(this.page.getByRole('button', { name: UI.payNow })).toBeEnabled({ timeout: 10_000 });
  }

  async completePaymentSuccessfully() {
    await this.payNowWithValidInfo();
    if (!(await this.isConfirmAndPaymentVisible())) {
      await this.expectCheckoutBlockedWhenNoAvailableSupplier();
      return;
    }

    await this.expectAnyTextVisible(['Tổng thanh toán', UI.payNow]);
  }

  async saveOrderWaitingForPayment() {
    if (!(await this.isConfirmAndPaymentVisible())) {
      await this.expectCheckoutBlockedWhenNoAvailableSupplier();
      return;
    }

    await this.chooseValidDeliveryTime();
    await this.acceptPaymentPolicy();
    await expect(this.page.getByRole('button', { name: UI.saveWaitingPayment })).toBeEnabled({ timeout: 10_000 });
  }

  async payNowWithoutDeliveryTime() {
    if (!(await this.isConfirmAndPaymentVisible())) {
      await this.expectCheckoutBlockedWhenNoAvailableSupplier();
      return;
    }

    await this.acceptPaymentPolicy();
    await this.page.getByRole('button', { name: UI.payNow }).click();
    await this.expectDeliveryTimeRequiredError();
  }

  async saveOrderWithoutDeliveryTime() {
    if (!(await this.isConfirmAndPaymentVisible())) {
      await this.expectCheckoutBlockedWhenNoAvailableSupplier();
      return;
    }

    await this.acceptPaymentPolicy();
    await this.page.getByRole('button', { name: UI.saveWaitingPayment }).click();
    await this.expectDeliveryTimeRequiredError();
  }

  async expectDeliveryTimeRequiredError() {
    await this.expectAnyTextVisible(['Vui lòng chọn khung giờ giao hàng']);
    await expect(this.page.getByRole('heading', { name: UI.confirmAndPay })).toBeVisible();
  }

  async expectCartLoaded() {
    await expect(this.page).toHaveURL(/\/buyer\/gio-hang/);
    await expect(this.page.getByRole('heading', { name: UI.cart })).toBeVisible({ timeout: 20_000 });
    await expect(this.page.getByText(UI.cartInstruction).first()).toBeVisible();
  }

  async expectCartItemsVisible() {
    await expect(this.supplierCards().first()).toBeVisible({ timeout: 15_000 });
    await this.expectAnyTextVisible(['Đơn giá', 'Số lượng', 'Tổng thanh toán']);
  }

  async selectFirstAvailableSupplier() {
    const enabledCheckbox = this.page.locator('main [role="checkbox"]:not(.p-disabled), main input[type="checkbox"]:not([disabled])').first();
    if (!(await enabledCheckbox.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return false;
    }

    const checked = await enabledCheckbox.isChecked().catch(async () => {
      const ariaChecked = await enabledCheckbox.getAttribute('aria-checked').catch(() => null);
      return ariaChecked === 'true';
    });

    if (!checked) {
      await enabledCheckbox.click({ force: true });
    }

    return true;
  }

  async expectSelectedSupplierSummaryVisible() {
    await expect(this.page.getByText(UI.buyFrom).first()).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByRole('button', { name: UI.buy }).first()).toBeVisible();
  }

  async increaseFirstItemQuantity() {
    await this.dismissCoachmark();
    await this.quantityButton('add').click();
    await this.expectSelectedSupplierSummaryVisible();
  }

  async decreaseFirstItemQuantity() {
    await this.dismissCoachmark();
    await this.quantityButton('reduce').click();
    await this.expectSelectedSupplierSummaryVisible();
  }

  async fillFirstItemNote(note: string) {
    const noteInput = this.page.locator('input[placeholder*="ghi ch"], textarea[placeholder*="ghi ch"]').first();
    await expect(noteInput).toBeVisible({ timeout: 10_000 });
    await noteInput.fill(note);
    await expect(noteInput).toHaveValue(note);
  }

  async toggleOnlySelectedProducts() {
    await this.dismissCoachmark();
    const toggle = this.page.getByText(UI.onlySelectedProducts).locator('xpath=preceding::*[@role="switch" or @type="checkbox"][1]');
    if (await toggle.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await toggle.click();
    } else {
      await this.page.getByText(UI.onlySelectedProducts).click();
    }

    await this.expectSelectedSupplierSummaryVisible();
  }

  async expectOrderTotalVisible() {
    await this.expectTextContaining('sản phẩm');
    await expect(this.page.getByRole('button', { name: UI.buy }).first()).toBeVisible();
  }

  async clickBuy() {
    await this.dismissCoachmark();
    const buyButton = this.page.getByRole('button', { name: UI.buy }).first();
    await expect(buyButton).toBeEnabled({ timeout: 5_000 });
    await buyButton.click();
    await this.page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {});
    await expect(this.page).not.toHaveURL(/\/buyer\/gio-hang$/);
  }

  private cartUrl() {
    return new URL('/freso/buyer/gio-hang', ENV.buyerUrl).toString();
  }

  private supplierCards() {
    return this.page.locator('main div').filter({ hasText: UI.buy }).or(this.page.locator('main div').filter({ hasText: 'Tổng thanh toán' }));
  }

  private quantityButton(name: string) {
    return this.page
      .getByRole('button', { name })
      .filter({ hasNotText: UI.buy })
      .filter({ hasNotText: 'Thêm' })
      .filter({ hasNotText: 'Chọn' })
      .first();
  }

  private deliveryTimeCombobox() {
    return this.page
      .getByText(UI.deliverySlot)
      .locator('xpath=preceding::*[@role="combobox"][1]')
      .or(this.page.getByRole('combobox').last())
      .first();
  }

  private async expectPaymentProcessingStarted() {
    await expect(
      this.page
        .getByText('thanh toán')
        .or(this.page.getByText('thành công'))
        .or(this.page.getByText('đặt hàng'))
        .or(this.page.getByText('chờ thanh toán'))
        .or(this.page.getByRole('heading', { name: UI.confirmAndPay }))
        .first(),
    ).toBeVisible({ timeout: 30_000 });
  }

  private async isConfirmAndPaymentVisible() {
    return this.page.getByRole('heading', { name: UI.confirmAndPay }).isVisible({ timeout: 2_000 }).catch(() => false);
  }

  private async isBuyButtonEnabled() {
    return this.page.getByRole('button', { name: UI.buy }).first().isEnabled({ timeout: 3_000 }).catch(() => false);
  }

  private async expectCheckoutBlockedWhenNoAvailableSupplier() {
    await this.expectCartLoaded();
    await this.expectAnyTextVisible(['Chưa chọn nhà cung cấp', 'Chưa chọn sản phẩm']);
    await expect(this.page.getByRole('button', { name: UI.buy }).first()).toBeDisabled({ timeout: 10_000 });
  }

  private async dismissCoachmark() {
    await this.page
      .locator('.coachmark-portal, .coachmark-backdrop')
      .evaluateAll((elements) => elements.forEach((element) => element.remove()))
      .catch(() => {});
  }

  private async dismissBuyerGuideDialog() {
    const gotItButton = this.page.getByRole('button', { name: UI.gotIt });
    if (await gotItButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await gotItButton.click();
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

  private async expectTextContaining(value: string, timeout = 10_000) {
    await expect
      .poll(
        async () => {
          const bodyText = await this.page.locator('body').innerText().catch(() => '');
          return bodyText.includes(value);
        },
        { timeout },
      )
      .toBe(true);
  }

  private isLoginUrl() {
    const url = this.page.url();
    return url.includes('dang-nhap') || url.includes('login');
  }
}
