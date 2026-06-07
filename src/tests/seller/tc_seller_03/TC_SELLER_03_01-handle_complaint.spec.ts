import { test } from '../../../framework/fixtures/base.fixture';
import { SELLER_COMPLAINT_RESOLUTIONS } from '../../../framework/pages/seller/SellerComplaintPage';

test.describe.serial('TC_SELLER_03 - Nguoi ban xu ly yeu cau khieu nai', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ sellerComplaintPage }) => {
    await sellerComplaintPage.openProvidedComplaintOrderDetail();
  });

  test('TC_SELLER_03_01 - Mo chi tiet don hang co yeu cau khieu nai', async ({ sellerComplaintPage }) => {
    await sellerComplaintPage.expectComplaintInfoVisible();
  });

  test('TC_SELLER_03_02 - Hien thi danh sach 10 san pham khieu nai trong chi tiet don', async ({ sellerComplaintPage }) => {
    await sellerComplaintPage.expectComplaintProductListVisible(10);
  });

  test('TC_SELLER_03_03 - Mo popup chon phuong an xu ly khieu nai', async ({ sellerComplaintPage }) => {
    await sellerComplaintPage.openHandleComplaintDialog();
    await sellerComplaintPage.expectHandleComplaintDialogProductCount(10);
  });

  test('TC_SELLER_03_04 - Hien thi day du cac phuong an xu ly cho san pham khieu nai', async ({ sellerComplaintPage }) => {
    await sellerComplaintPage.openHandleComplaintDialog();
    await sellerComplaintPage.expectResolutionOptionsAvailable();
  });

  test('TC_SELLER_03_05 - Chua chon phuong an thi nut Xac nhan bi vo hieu hoa', async ({ sellerComplaintPage }) => {
    await sellerComplaintPage.openHandleComplaintDialog();
    await sellerComplaintPage.expectConfirmDisabled();
  });

  test('TC_SELLER_03_06 - Chon phuong an Tra hang Hoan tien cho san pham dau tien', async ({ sellerComplaintPage }) => {
    await sellerComplaintPage.openHandleComplaintDialog();
    await sellerComplaintPage.selectResolutionForProduct(0, SELLER_COMPLAINT_RESOLUTIONS[0]);
  });

  test('TC_SELLER_03_07 - Chon phuong an Doi hang cho san pham thu hai', async ({ sellerComplaintPage }) => {
    await sellerComplaintPage.openHandleComplaintDialog();
    await sellerComplaintPage.selectResolutionForProduct(1, SELLER_COMPLAINT_RESOLUTIONS[1]);
  });

  test('TC_SELLER_03_08 - Chon phuong an Bo sung hang cho san pham thu ba', async ({ sellerComplaintPage }) => {
    await sellerComplaintPage.openHandleComplaintDialog();
    await sellerComplaintPage.selectResolutionForProduct(2, SELLER_COMPLAINT_RESOLUTIONS[2]);
  });

  test('TC_SELLER_03_09 - Chon phuong an Hoan tien khong can tra hang cho san pham thu tu', async ({ sellerComplaintPage }) => {
    await sellerComplaintPage.openHandleComplaintDialog();
    await sellerComplaintPage.selectResolutionForProduct(3, SELLER_COMPLAINT_RESOLUTIONS[3]);
  });

  test('TC_SELLER_03_10 - Chon phuong an Tu choi khieu nai cho san pham thu nam', async ({ sellerComplaintPage }) => {
    await sellerComplaintPage.openHandleComplaintDialog();
    await sellerComplaintPage.selectResolutionForProduct(4, SELLER_COMPLAINT_RESOLUTIONS[4]);
  });

  test('TC_SELLER_03_11 - Tu choi khieu nai va upload file sai dinh dang', async ({ sellerComplaintPage }) => {
    await sellerComplaintPage.openHandleComplaintDialog();
    await sellerComplaintPage.selectRejectResolutionForProduct(0);
    await sellerComplaintPage.uploadInvalidRejectEvidenceAndExpectRejected();
  });

  test('TC_SELLER_03_12 - Tu choi khieu nai va upload anh vuot dung luong', async ({ sellerComplaintPage }) => {
    await sellerComplaintPage.openHandleComplaintDialog();
    await sellerComplaintPage.selectRejectResolutionForProduct(0);
    await sellerComplaintPage.uploadOversizedRejectImageAndExpectRejected();
  });

  

  test('TC_SELLER_03_13 - Xac nhan xu ly khieu nai va cap nhat trang thai tung san pham', async ({ sellerComplaintPage }) => {
    await sellerComplaintPage.openHandleComplaintDialog();
    await sellerComplaintPage.selectMixedResolutionForAllComplaintProducts();
    await sellerComplaintPage.expectMixedResolutionsSelected();
    await sellerComplaintPage.expectConfirmEnabled();
    await sellerComplaintPage.confirmComplaintHandlingAndExpectProductStatusesUpdated();
  });

});
