import { test } from '../../../framework/fixtures/base.fixture';

test.describe('TC_BUYER_02 - Xac nhan va thanh toan', () => {
  test.setTimeout(90_000);

  test('TC_BUYER_02_01 - Truy cap man hinh Xac nhan va thanh toan', async ({ buyerCheckoutPage }) => {
    await test.step('Mo man hinh xac nhan va thanh toan tu gio hang', async () => {
      await buyerCheckoutPage.openConfirmAndPayment();
    });

    await test.step('Kiem tra day du thong tin don hang', async () => {
      await buyerCheckoutPage.expectFullConfirmAndPaymentInfoVisible();
    });
  });

  test('TC_BUYER_02_02 - Chon ngay giao hang hop le', async ({ buyerCheckoutPage }) => {
    await test.step('Mo man hinh xac nhan va thanh toan', async () => {
      await buyerCheckoutPage.openConfirmAndPayment();
    });

    await test.step('Chon ngay giao hang hop le va kiem tra khung gio kha dung', async () => {
      await buyerCheckoutPage.chooseValidDeliveryDate();
    });
  });

  test('TC_BUYER_02_03 - Chon khung gio giao hang hop le', async ({ buyerCheckoutPage }) => {
    await test.step('Mo man hinh xac nhan va thanh toan', async () => {
      await buyerCheckoutPage.openConfirmAndPayment();
    });

    await test.step('Chon khung gio giao hang hop le', async () => {
      await buyerCheckoutPage.chooseValidDeliveryTime();
    });
  });

  test('TC_BUYER_02_04 - Nhap day du thong tin hop le va nhan Thanh toan ngay', async ({ buyerCheckoutPage }) => {
    await test.step('Mo man hinh xac nhan va thanh toan', async () => {
      await buyerCheckoutPage.openConfirmAndPayment();
    });

    await test.step('Thanh toan ngay voi thong tin hop le', async () => {
      await buyerCheckoutPage.payNowWithValidInfo();
    });
  });

  test('TC_BUYER_02_05 - Hoan tat thanh toan thanh cong', async ({ buyerCheckoutPage }) => {
    await test.step('Mo man hinh xac nhan va thanh toan', async () => {
      await buyerCheckoutPage.openConfirmAndPayment();
    });

    await test.step('Hoan tat thanh toan va kiem tra thong bao ket qua', async () => {
      await buyerCheckoutPage.completePaymentSuccessfully();
    });
  });

  test('TC_BUYER_02_06 - Luu don cho thanh toan voi thong tin hop le', async ({ buyerCheckoutPage }) => {
    await test.step('Mo man hinh xac nhan va thanh toan', async () => {
      await buyerCheckoutPage.openConfirmAndPayment();
    });

    await test.step('Luu don cho thanh toan', async () => {
      await buyerCheckoutPage.saveOrderWaitingForPayment();
    });
  });

  test('TC_BUYER_02_07 - Khong chon khung gio giao hang va nhan Thanh toan ngay', async ({ buyerCheckoutPage }) => {
    await test.step('Mo man hinh xac nhan va thanh toan', async () => {
      await buyerCheckoutPage.openConfirmAndPayment();
    });

    await test.step('Nhan Thanh toan ngay khi chua chon khung gio giao hang', async () => {
      await buyerCheckoutPage.payNowWithoutDeliveryTime();
    });
  });

  test('TC_BUYER_02_08 - Khong chon khung gio giao hang va nhan Luu don cho thanh toan', async ({ buyerCheckoutPage }) => {
    await test.step('Mo man hinh xac nhan va thanh toan', async () => {
      await buyerCheckoutPage.openConfirmAndPayment();
    });

    await test.step('Nhan Luu don cho thanh toan khi chua chon khung gio giao hang', async () => {
      await buyerCheckoutPage.saveOrderWithoutDeliveryTime();
    });
  });
});
