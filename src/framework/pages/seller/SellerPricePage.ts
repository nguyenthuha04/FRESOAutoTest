import { Page } from '@playwright/test';
import { AddProductPricePage } from './AddProductPricePage';
import { QuotationDetailPage } from './QuotationDetailPage';
import { SellerLoginPage } from './SellerLoginPage';

export class SellerPricePage {
  constructor(private readonly page: Page) {}

  async openPriceUploadPage() {
    await new SellerLoginPage(this.page).login();
    const quotationDetailPage = new QuotationDetailPage(this.page);

    await quotationDetailPage.openExistingQuotationDetail();
    await quotationDetailPage.chooseSingleProductAndConfirm();
    await new AddProductPricePage(this.page).expectLoaded();
  }

  async uploadProductPrice() {
    const addProductPricePage = new AddProductPricePage(this.page);

    await addProductPricePage.expectLoaded();
    await addProductPricePage.fillValidPrice();
    await addProductPricePage.save();
    await addProductPricePage.expectSavedAndStayOnForm();
  }
}
