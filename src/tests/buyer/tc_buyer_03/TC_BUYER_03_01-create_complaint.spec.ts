import { test } from '../../../framework/fixtures/base.fixture';

test.describe('TC_BUYER_03 - Nguoi mua tao khieu nai', () => {
  test.setTimeout(120_000);

  test('TC_BUYER_03_01 - Nhan nut Gui khieu nai hien thi danh sach san pham', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.clickComplaintAndExpectProductList();
  });

  test('TC_BUYER_03_02 - Chon san pham va nhan Tiep tuc hien thi form khieu nai', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.selectProductAndContinueExpectForm();
  });

  test('TC_BUYER_03_03 - Su dung tinh nang Ap dung hang loat', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.applyAllAndExpectFilled();
  });

  test('TC_BUYER_03_04 - Su dung tinh nang Ap dung duoc chon', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.applySelectedAndExpectOnlySelectedFilled();
  });

  test('TC_BUYER_03_05 - Upload hinh anh video minh chung hop le', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.uploadValidEvidenceAndExpectPreview();
  });

  test('TC_BUYER_03_06 - Upload tep tin sai dinh dang hoac vuot dung luong', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.uploadInvalidEvidenceAndExpectRejected();
  });

  test('TC_BUYER_03_07 - De trong thong tin bat buoc', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.submitEmptyAndExpectRequiredErrors();
  });

  test('TC_BUYER_03_08 - Gui yeu cau khieu nai khi day du thong tin', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.submitValidComplaintAndExpectSuccess();
  });

  test('TC_BUYER_03_09 - Kiem tra trang thai don hang sau khi gui khieu nai', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.expectOrderStatusAfterComplaint();
  });

  test('TC_BUYER_03_10 - Tim kiem san pham khieu nai theo ten san pham', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.searchComplaintProductByName();
  });

  test('TC_BUYER_03_11 - Tim kiem san pham khieu nai theo ma san pham', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.searchComplaintProductByCode();
  });

  test('TC_BUYER_03_13 - Nhan Huy tai buoc chon san pham', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.cancelOnProductSelectionAndExpectBackToOrder();
  });

  test('TC_BUYER_03_14 - Nhan Quay lai tai buoc nhap ly do va phuong an', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.goBackOnComplaintFormAndExpectProductSelection();
  });

  test('TC_BUYER_03_15 - Kiem tra so luong khieu nai mac dinh bang so luong san pham trong don', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.expectDefaultComplaintQuantityMatchesOrder();
  });

  test('TC_BUYER_03_16 - Tang giam so luong khieu nai neu he thong cho phep', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.changeComplaintQuantityIfSystemAllows();
  });

  test('TC_BUYER_03_17 - Nhap mo ta khieu nai vuot qua gioi han ky tu', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.enterDescriptionOverLimitAndExpectHandled();
  });

  test('TC_BUYER_03_18 - Upload nhieu hinh anh minh chung hop le', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.uploadMultipleValidEvidenceAndExpectPreview();
  });

  test('TC_BUYER_03_19 - Kiem tra control upload video minh chung', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.expectVideoEvidenceUploadControl();
  });

  test('TC_BUYER_03_20 - Xoa file minh chung da upload neu he thong cho phep', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.removeUploadedEvidenceIfAvailable();
  });

  test('TC_BUYER_03_24 - Kiem tra thong tin san pham hien thi dung voi don hang goc', async ({ buyerComplaintPage }) => {
    await buyerComplaintPage.expectComplaintProductInfoMatchesOrder();
  });
});
