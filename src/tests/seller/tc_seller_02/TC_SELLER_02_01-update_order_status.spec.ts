import { test } from '../../../framework/fixtures/base.fixture';

test('TC_SELLER_02_01 - Nguoi ban cap nhat trang thai don hang', async ({ sellerOrderPage }) => {
  test.setTimeout(180_000);

  await test.step('Don 2606062HVE - Xac nhan don hang va kiem tra chuyen sang Chuan bi hang', async () => {
    await sellerOrderPage.updateOrderStatusAndExpect({
      orderCode: '2606062HVE',
      actionName: 'Xác nhận',
      expectedStatus: 'Chuẩn bị hàng',
    });
  });

  await test.step('Don 260606B9EO - Tu choi don hang va kiem tra trang thai theo he thong', async () => {
    await sellerOrderPage.updateOrderStatusAndExpect({
      orderCode: '260606B9EO',
      actionName: 'Từ chối',
      expectedStatus: 'Đã từ chối',
    });
  });

  await test.step('Don 260606LIWO - San sang giao hang va kiem tra chuyen sang Xac nhan giao hang', async () => {
    await sellerOrderPage.updateOrderStatusAndExpect({
      orderCode: '260606LIWO',
      actionName: 'Sẵn sàng giao hàng',
      expectedStatus: 'Xác nhận giao hàng',
    });
  });

  await test.step('Don 2606065AD9 - Giao thanh cong va kiem tra trang thai theo man hinh', async () => {
    await sellerOrderPage.updateOrderStatusAndExpect({
      orderCode: '2606065AD9',
      actionName: 'Giao thành công',
    });
  });

  await test.step('Don 260606QBHB - Giao that bai va kiem tra trang thai theo man hinh', async () => {
    await sellerOrderPage.updateOrderStatusAndExpect({
      orderCode: '260606QBHB',
      actionName: 'Giao thất bại',
    });
  });
});
