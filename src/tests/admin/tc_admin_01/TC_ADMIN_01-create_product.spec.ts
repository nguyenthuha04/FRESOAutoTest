import { Page } from '@playwright/test';
import { test, expect } from '../../../framework/fixtures/base.fixture';
import { validProductData, duplicatedProductData } from '../../../framework/data/admin/create-product.data';
import { createInvalidTextFile, createLargeJpgFile, createTinyJpgFiles } from '../../../framework/utils/file-helper';
import { AdminLoginPage } from '../../../framework/pages/admin/AdminLoginPage';
import { ProductManagementPage } from '../../../framework/pages/admin/ProductManagementPage';
import { AddEditProductPage } from '../../../framework/pages/admin/AddEditProductPage';

async function loginAndOpenProductList(page: Page) {
  const loginPage = new AdminLoginPage(page);
  const productManagementPage = new ProductManagementPage(page);

  await loginPage.login();
  await productManagementPage.expectLoaded();

  return productManagementPage;
}

async function loginAndOpenAddProduct(page: Page) {
  const productManagementPage = await loginAndOpenProductList(page);
  await productManagementPage.openAddProduct();

  const addEditProductPage = new AddEditProductPage(page);
  await addEditProductPage.expectLoaded();

  return { productManagementPage, addEditProductPage };
}

test('TC_ADMIN_01_01 - Nhan nut Them san pham', async ({ page }) => {
  const productManagementPage = await loginAndOpenProductList(page);

  await productManagementPage.openAddProduct();

  const addEditProductPage = new AddEditProductPage(page);
  await addEditProductPage.expectCreateFormVisible();
});

test('TC_ADMIN_01_02 - Nhap day du thong tin hop le va tai du 4 anh san pham', async ({ page }) => {
  const { addEditProductPage } = await loginAndOpenAddProduct(page);

  await addEditProductPage.fillValidProduct(validProductData);
  await addEditProductPage.uploadProductImages(createTinyJpgFiles(4));
  await addEditProductPage.save();

  await addEditProductPage.expectSuccessMessageOrProductList(validProductData.productName);
});

test('TC_ADMIN_01_03 - Bo trong ten san pham', async ({ page }) => {
  const { addEditProductPage } = await loginAndOpenAddProduct(page);

  await addEditProductPage.fillWithoutProductName(validProductData);
  await addEditProductPage.uploadProductImages(createTinyJpgFiles(4));
  await addEditProductPage.save();

  await addEditProductPage.expectAnyValidationMessage(['Vui lòng nhập Tên sản phẩm']);
});

test('TC_ADMIN_01_04 - Bo trong nganh hang', async ({ page }) => {
  const { addEditProductPage } = await loginAndOpenAddProduct(page);

  await addEditProductPage.fillWithoutIndustry(validProductData);
  await addEditProductPage.uploadProductImages(createTinyJpgFiles(4));
  await addEditProductPage.save();

  await addEditProductPage.expectAnyValidationMessage(['Vui lòng nhập Ngành hàng']);
});

test('TC_ADMIN_01_05 - Bo trong nhom san pham', async ({ page }) => {
  const { addEditProductPage } = await loginAndOpenAddProduct(page);

  await addEditProductPage.fillWithoutProductGroup(validProductData);
  await addEditProductPage.uploadProductImages(createTinyJpgFiles(4));
  await addEditProductPage.save();

  await addEditProductPage.expectAnyValidationMessage(['Vui lòng nhập Nhóm sản phẩm']);
});

test('TC_ADMIN_01_06 - Bo trong don vi tinh', async ({ page }) => {
  const { addEditProductPage } = await loginAndOpenAddProduct(page);

  await addEditProductPage.fillWithoutUnit(validProductData);
  await addEditProductPage.uploadProductImages(createTinyJpgFiles(4));
  await addEditProductPage.save();

  await addEditProductPage.expectAnyValidationMessage(['Vui lòng nhập Đơn vị tính']);
});

test('TC_ADMIN_01_07 - Bo trong xuat xu', async ({ page }) => {
  const { addEditProductPage } = await loginAndOpenAddProduct(page);

  await addEditProductPage.fillWithoutOrigin(validProductData);
  await addEditProductPage.uploadProductImages(createTinyJpgFiles(4));
  await addEditProductPage.save();

  await addEditProductPage.expectAnyValidationMessage(['Vui lòng nhập Xuất xứ']);
});

test('TC_ADMIN_01_08 - Bo trong mo ta san pham', async ({ page }) => {
  const { addEditProductPage } = await loginAndOpenAddProduct(page);

  await addEditProductPage.fillWithoutDescription(validProductData);
  await addEditProductPage.uploadProductImages(createTinyJpgFiles(4));
  await addEditProductPage.save();

  await addEditProductPage.expectAnyValidationMessage(['Vui lòng nhập Mô tả sản phẩm']);
});

test('TC_ADMIN_01_09 - Chua tai du 4 anh san pham', async ({ page }) => {
  const { addEditProductPage } = await loginAndOpenAddProduct(page);

  await addEditProductPage.fillValidProduct(validProductData);
  await addEditProductPage.uploadProductImages(createTinyJpgFiles(2));
  await addEditProductPage.save();

  await addEditProductPage.expectAnyValidationMessage(['Vui lòng tải lên ít nhất 4 ảnh', 'tối thiểu 4 ảnh']);
});

test('TC_ADMIN_01_10 - Tai len file anh sai dinh dang', async ({ page }) => {
  const { addEditProductPage } = await loginAndOpenAddProduct(page);

  await addEditProductPage.uploadInvalidImage(createInvalidTextFile());

  await addEditProductPage.expectAnyValidationMessage(['định dạng', 'JPG', 'JPEG', 'PNG', 'không hợp lệ']);
});

test('TC_ADMIN_01_11 - Tai len file anh vuot qua dung luong', async ({ page }) => {
  const { addEditProductPage } = await loginAndOpenAddProduct(page);

  await addEditProductPage.uploadInvalidImage(createLargeJpgFile());

  await addEditProductPage.expectAnyValidationMessage(['dung lượng', 'kích thước', '500KB', 'quá lớn', 'tối đa']);
});

test('TC_ADMIN_01_12 - Nhap ten san pham da ton tai', async ({ page }) => {
  const { addEditProductPage } = await loginAndOpenAddProduct(page);

  await addEditProductPage.fillValidProduct(duplicatedProductData);
  await addEditProductPage.uploadProductImages(createTinyJpgFiles(4));
  await addEditProductPage.save();

  await addEditProductPage.expectAnyValidationMessage(['đã tồn tại', 'trùng', 'kiểm tra lại']);
});

test('TC_ADMIN_01_13 - Nhan nut Huy bo khi dang nhap thong tin', async ({ page }) => {
  const { addEditProductPage } = await loginAndOpenAddProduct(page);

  await addEditProductPage.fillWithoutProductGroup(validProductData);
  await addEditProductPage.cancel();

  await expect(page).toHaveURL(/\/admin\/product-management$/);
});
