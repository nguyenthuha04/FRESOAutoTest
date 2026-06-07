import { ENV } from '../config/env';

export type UserRole = 'admin' | 'seller' | 'buyer';

export type TestUser = {
  username: string;
  email?: string;
  password: string;
  code?: string;
};

export const users: Record<UserRole, TestUser> = {
  admin: {
    username: ENV.adminUsername,
    password: ENV.adminPassword,
  },
  seller: {
    username: ENV.sellerUsername,
    password: ENV.sellerPassword,
    code: ENV.sellerCode,
  },
  buyer: {
    username: ENV.buyerUsername,
    email: ENV.buyerEmail,
    password: ENV.buyerPassword,
  },
};
