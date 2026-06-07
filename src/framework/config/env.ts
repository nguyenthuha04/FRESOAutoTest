/// <reference types="node" />
import 'dotenv/config';

export const ENV = {
  adminUrl: process.env.ADMIN_URL!,
  sellerUrl: process.env.SELLER_URL!,
  buyerUrl: process.env.BUYER_URL!,

  adminUsername: process.env.ADMIN_USERNAME!,
  adminPassword: process.env.ADMIN_PASSWORD!,

  sellerUsername: process.env.SELLER_USERNAME!,
  sellerPassword: process.env.SELLER_PASSWORD!,
  sellerCode: process.env.SELLER_CODE!,

  buyerUsername: process.env.BUYER_USERNAME!,
  buyerEmail: process.env.BUYER_EMAIL!,
  buyerPassword: process.env.BUYER_PASSWORD!,
};
