import { Page } from '@playwright/test';
import { test, expect } from '../../../framework/fixtures/base.fixture';
import { ENV } from '../../../framework/config/env';
import { SellerLoginPage } from '../../../framework/pages/seller/SellerLoginPage';
import { QuotationDetailPage } from '../../../framework/pages/seller/QuotationDetailPage';
import { AddProductPricePage } from '../../../framework/pages/seller/AddProductPricePage';

const hasSellerCredentials = Boolean(ENV.sellerUrl && ENV.sellerUsername && ENV.sellerPassword && ENV.sellerCode);

async function loginSeller(page: Page) {
  const loginPage = new SellerLoginPage(page);
  await loginPage.login();
}

async function openQuotationDetail(page: Page) {
  await loginSeller(page);
  const quotationDetailPage = new QuotationDetailPage(page);
  await quotationDetailPage.openExistingQuotationDetail();
  return quotationDetailPage;
}

async function openAddProductPrice(page: Page) {
  const quotationDetailPage = await openQuotationDetail(page);
  await quotationDetailPage.chooseSingleProductAndConfirm();
  const addProductPricePage = new AddProductPricePage(page);
  await addProductPricePage.expectLoaded();
  return { quotationDetailPage, addProductPricePage };
}

test.beforeEach(() => {
  test.skip(!hasSellerCredentials, 'Missing SELLER_USERNAME, SELLER_PASSWORD, or SELLER_CODE in .env');
});

test('TC_SELLER_01_01 - Truy cap chi tiet bao gia', async ({ page }) => {
  await openQuotationDetail(page);
});

test('TC_SELLER_01_02 - Mo popup them san pham', async ({ page }) => {
  const quotationDetailPage = await openQuotationDetail(page);

  await quotationDetailPage.openAddProductPopup();
});

test('TC_SELLER_01_03 - Chon them san pham don le', async ({ page }) => {
  const quotationDetailPage = await openQuotationDetail(page);

  await quotationDetailPage.chooseSingleProductAndConfirm();

  await expect(page).toHaveURL(/\/seller\/product\/product-price\/new-product-price/);
});

test('TC_SELLER_01_04 - Chon san pham', async ({ page }) => {
  const { addProductPricePage } = await openAddProductPrice(page);

  await addProductPricePage.selectFirstProduct();

  await addProductPricePage.expectProductFieldsAutoFilled();
});

test('TC_SELLER_01_05 - Luu bao gia thanh cong', async ({ page }) => {
  const { addProductPricePage } = await openAddProductPrice(page);

  await addProductPricePage.fillValidPrice();
  await addProductPricePage.save();

  await addProductPricePage.expectSuccessAndBackToQuotationDetail();
});

test('TC_SELLER_01_06 - Kiem tra tu dong tinh gia sau thue', async ({ page }) => {
  const { addProductPricePage } = await openAddProductPrice(page);

  await addProductPricePage.selectFirstProduct();
  await addProductPricePage.selectProcessingStatus();
  await addProductPricePage.fillPriceBeforeTax('5000');
  await addProductPricePage.fillTaxRate('5');

  await addProductPricePage.expectTaxIncludedPrice('5250');
});

test('TC_SELLER_01_07 - Kiem tra san pham xuat hien trong bao gia', async ({ page }) => {
  const { quotationDetailPage, addProductPricePage } = await openAddProductPrice(page);

  await addProductPricePage.fillValidPrice();
  const productName = addProductPricePage.getSelectedProductName();
  await addProductPricePage.save();
  await addProductPricePage.expectSuccessAndBackToQuotationDetail();

  await quotationDetailPage.expectProductVisible(productName);
});

test('TC_SELLER_01_08 - Khong chon san pham', async ({ page }) => {
  const { addProductPricePage } = await openAddProductPrice(page);

  await addProductPricePage.save();

  await addProductPricePage.expectValidationMessage('Vui lòng chọn tên sản phẩm');
});

test('TC_SELLER_01_09 - Khong chon tinh trang che bien', async ({ page }) => {
  const { addProductPricePage } = await openAddProductPrice(page);

  await addProductPricePage.selectFirstProduct();
  await addProductPricePage.save();

  await addProductPricePage.expectValidationMessage('Vui lòng chọn tình trạng chế biến');
});

test('TC_SELLER_01_10 - Bo trong gia truoc thue', async ({ page }) => {
  const { addProductPricePage } = await openAddProductPrice(page);

  await addProductPricePage.selectFirstProduct();
  await addProductPricePage.selectProcessingStatus();
  await addProductPricePage.fillTaxRate('5');
  await addProductPricePage.save();

  await addProductPricePage.expectValidationMessage('Vui lòng nhập giá trước thuế');
});

test('TC_SELLER_01_11 - Bo trong thue suat', async ({ page }) => {
  const { addProductPricePage } = await openAddProductPrice(page);

  await addProductPricePage.selectFirstProduct();
  await addProductPricePage.selectProcessingStatus();
  await addProductPricePage.fillPriceBeforeTax('5000');
  await addProductPricePage.save();

  await addProductPricePage.expectValidationMessage('Vui lòng nhập thuế suất');
});

test('TC_SELLER_01_12 - Nhap gia truoc thue nho hon 0', async ({ page }) => {
  const { addProductPricePage } = await openAddProductPrice(page);

  await addProductPricePage.selectFirstProduct();
  await addProductPricePage.selectProcessingStatus();
  await addProductPricePage.fillPriceBeforeTax('-1');
  await addProductPricePage.fillTaxRate('5');
  await addProductPricePage.save();

  await addProductPricePage.expectValidationMessage('không hợp lệ');
});

test('TC_SELLER_01_13 - Nhap thue suat am hoac sai dinh dang', async ({ page }) => {
  for (const taxRate of ['-1', 'abc', '5%']) {
    const { addProductPricePage } = await openAddProductPrice(page);

    await addProductPricePage.selectFirstProduct();
    await addProductPricePage.selectProcessingStatus();
    await addProductPricePage.fillPriceBeforeTax('5000');
    await addProductPricePage.fillTaxRate(taxRate);
    await addProductPricePage.save();

    await addProductPricePage.expectValidationMessage('không hợp lệ');
  }
});

test('TC_SELLER_01_14 - Them san pham da ton tai', async ({ page }) => {
  const { addProductPricePage } = await openAddProductPrice(page);

  await addProductPricePage.fillValidPrice();
  await addProductPricePage.save();
  await addProductPricePage.expectValidationMessage('sản phẩm đã tồn tại');
});

test('TC_SELLER_01_15 - Nhan Huy bo', async ({ page }) => {
  const { addProductPricePage } = await openAddProductPrice(page);

  await addProductPricePage.selectFirstProduct();
  await addProductPricePage.cancel();

  await expect(page.getByText(/Chi ti\u1ebft b\u00e1o gi\u00e1/i).first()).toBeVisible({ timeout: 20_000 });
});

test('TC_SELLER_01_16 - Nhan Luu va them moi', async ({ page }) => {
  const { addProductPricePage } = await openAddProductPrice(page);

  await addProductPricePage.fillValidPrice();
  await addProductPricePage.saveAndAddNew();

  await addProductPricePage.expectValidationMessage('thành công');
  await addProductPricePage.expectFormReset();
});
