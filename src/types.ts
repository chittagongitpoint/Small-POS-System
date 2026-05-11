export interface CategoryItem {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
}

export interface Sale {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
}

export type Role = 'admin' | 'staff';

export interface SystemSettings {
  systemName: string;
  systemSubtitle: string;
  phone: string;
  defaultLanguage: 'en' | 'bn';
}

export interface Permission {
  dashboard: boolean;
  pos: boolean;
  inventory: boolean;
  customers: boolean;
  reports: boolean;
  users: boolean;
  settings: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: Role;
  permissions: Permission;
}

