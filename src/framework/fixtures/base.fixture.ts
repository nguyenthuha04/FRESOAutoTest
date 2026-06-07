import { test as base, expect } from '@playwright/test';
import { AdminProductPage } from '../pages/admin/AdminProductPage';
import { BuyerCheckoutPage } from '../pages/buyer/BuyerCheckoutPage';
import { BuyerComplaintPage } from '../pages/buyer/BuyerComplaintPage';
import { SellerComplaintPage } from '../pages/seller/SellerComplaintPage';
import { SellerOrderPage } from '../pages/seller/SellerOrderPage';
import { SellerPricePage } from '../pages/seller/SellerPricePage';

type AppFixtures = {
  adminProductPage: AdminProductPage;
  sellerPricePage: SellerPricePage;
  sellerOrderPage: SellerOrderPage;
  sellerComplaintPage: SellerComplaintPage;
  buyerCheckoutPage: BuyerCheckoutPage;
  buyerComplaintPage: BuyerComplaintPage;
};

export const test = base.extend<AppFixtures>({
  adminProductPage: async ({ page }, use) => {
    await use(new AdminProductPage(page));
  },
  sellerPricePage: async ({ page }, use) => {
    await use(new SellerPricePage(page));
  },
  sellerOrderPage: async ({ page }, use) => {
    await use(new SellerOrderPage(page));
  },
  sellerComplaintPage: async ({ page }, use) => {
    await use(new SellerComplaintPage(page));
  },
  buyerCheckoutPage: async ({ page }, use) => {
    await use(new BuyerCheckoutPage(page));
  },
  buyerComplaintPage: async ({ page }, use) => {
    await use(new BuyerComplaintPage(page));
  },
});

export { expect };
