export const validProductData = {
  productName: `SP Test Auto ${Date.now()}`,
  productCode: `AUTO-${Date.now()}`,
  industry: 'Rau củ quả',
  productGroup: 'Rau củ',
  unit: 'Kg',
  classification: 'Loại 1',
  origin: 'Việt Nam',
  description: 'Sản phẩm được tạo tự động bằng Playwright',
};

export const duplicatedProductData = {
  productName: 'Củ cải trắng',
  productCode: `DUP-${Date.now()}`,
  industry: 'Rau củ quả',
  productGroup: 'Rau củ',
  unit: 'Kg',
  classification: 'phân loại 1',
  origin: 'Việt Nam',
  description: 'Dữ liệu test sản phẩm trùng tên',
};

export type CreateProductData = typeof validProductData;
