import { Page } from '@playwright/test';
import { validProductData } from '../../data/admin/create-product.data';
import { createTinyJpgFiles } from '../../utils/file-helper';
import { AddEditProductPage } from './AddEditProductPage';
import { AdminLoginPage } from './AdminLoginPage';
import { ProductManagementPage } from './ProductManagementPage';

export class AdminProductPage {
  constructor(private readonly page: Page) {}

  async openCreateProductPage() {
    const loginPage = new AdminLoginPage(this.page);
    const productManagementPage = new ProductManagementPage(this.page);

    await loginPage.login();
    await productManagementPage.expectLoaded();
    await productManagementPage.openAddProduct();
    await new AddEditProductPage(this.page).expectLoaded();
  }

  async fillProductInformation() {
    const addEditProductPage = new AddEditProductPage(this.page);

    await addEditProductPage.expectLoaded();
    await addEditProductPage.fillValidProduct(validProductData);
    await addEditProductPage.uploadProductImages(createTinyJpgFiles(4));
  }

  async submitProduct() {
    const addEditProductPage = new AddEditProductPage(this.page);

    await addEditProductPage.save();
    await addEditProductPage.expectSuccessMessageOrProductList(validProductData.productName);
  }
}
