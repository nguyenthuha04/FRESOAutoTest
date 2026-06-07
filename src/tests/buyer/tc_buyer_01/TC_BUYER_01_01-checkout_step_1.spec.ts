import { test } from '../../../framework/fixtures/base.fixture';

test.describe('TC_BUYER_01_01 - Gio hang checkout step 1', () => {
  test('TC_BUYER_01_01 - Truy cap trang gio hang', async ({ buyerCheckoutPage }) => {
    await test.step('Dang nhap buyer va mo gio hang', async () => {
      await buyerCheckoutPage.openCheckout();
    });
  });

  test('TC_BUYER_01_02 - Hien thi danh sach san pham trong gio hang', async ({ buyerCheckoutPage }) => {
    await test.step('Mo gio hang', async () => {
      await buyerCheckoutPage.openCheckout();
    });

    await test.step('Kiem tra danh sach san pham va cot thong tin', async () => {
      await buyerCheckoutPage.expectCartItemsVisible();
    });
  });

  test('TC_BUYER_01_03 - Chon san pham tu mot nha cung cap de mua hang', async ({ buyerCheckoutPage }) => {
    await test.step('Mo gio hang', async () => {
      await buyerCheckoutPage.openCheckout();
    });

    await test.step('Chon nha cung cap dau tien co san pham kha dung', async () => {
      await buyerCheckoutPage.selectFirstAvailableSupplier();
    });

    await test.step('Kiem tra thanh tong ket mua hang', async () => {
      await buyerCheckoutPage.expectSelectedSupplierSummaryVisible();
    });
  });

  test('TC_BUYER_01_04 - Tang so luong san pham trong gio hang', async ({ buyerCheckoutPage }) => {
    await test.step('Mo gio hang va chon san pham', async () => {
      await buyerCheckoutPage.openCheckout();
      await buyerCheckoutPage.selectFirstAvailableSupplier();
    });

    await test.step('Tang so luong san pham dau tien', async () => {
      await buyerCheckoutPage.increaseFirstItemQuantity();
    });
  });

  test('TC_BUYER_01_05 - Giam so luong san pham trong gio hang', async ({ buyerCheckoutPage }) => {
    await test.step('Mo gio hang va chon san pham', async () => {
      await buyerCheckoutPage.openCheckout();
      await buyerCheckoutPage.selectFirstAvailableSupplier();
    });

    await test.step('Giam so luong san pham dau tien', async () => {
      await buyerCheckoutPage.decreaseFirstItemQuantity();
    });
  });

  test('TC_BUYER_01_06 - Nhap ghi chu cho san pham', async ({ buyerCheckoutPage }) => {
    await test.step('Mo gio hang va chon san pham', async () => {
      await buyerCheckoutPage.openCheckout();
      await buyerCheckoutPage.selectFirstAvailableSupplier();
    });

    await test.step('Nhap ghi chu tai dong san pham dau tien', async () => {
      await buyerCheckoutPage.fillFirstItemNote('Giao trong gio hanh chinh');
    });
  });

  test('TC_BUYER_01_07 - Chi hien thi san pham da chon', async ({ buyerCheckoutPage }) => {
    await test.step('Mo gio hang va chon san pham', async () => {
      await buyerCheckoutPage.openCheckout();
      await buyerCheckoutPage.selectFirstAvailableSupplier();
    });

    await test.step('Bat bo loc chi hien thi san pham da chon', async () => {
      await buyerCheckoutPage.toggleOnlySelectedProducts();
    });
  });

  test('TC_BUYER_01_08 - Hien thi tong so san pham va tong thanh toan', async ({ buyerCheckoutPage }) => {
    await test.step('Mo gio hang va chon san pham', async () => {
      await buyerCheckoutPage.openCheckout();
      await buyerCheckoutPage.selectFirstAvailableSupplier();
    });

    await test.step('Kiem tra tong so san pham va tong tien tren thanh mua hang', async () => {
      await buyerCheckoutPage.expectOrderTotalVisible();
    });
  });

  test('TC_BUYER_01_09 - Bam Mua hang de sang buoc tiep theo', async ({ buyerCheckoutPage }) => {
    await test.step('Mo gio hang va chon san pham', async () => {
      await buyerCheckoutPage.openCheckout();
      await buyerCheckoutPage.selectFirstAvailableSupplier();
    });

    await test.step('Bam Mua hang', async () => {
      await buyerCheckoutPage.clickBuy();
    });
  });
});
