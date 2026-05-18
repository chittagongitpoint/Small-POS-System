import { Product, Sale, Customer, AppUser, CategoryItem, SystemSettings } from './types';

export const initialSettings: SystemSettings = {
  systemName: 'Khaja Auto',
  systemSubtitle: 'Electric & Solar Point',
  phone: '018XXXXXXXX',
  defaultLanguage: 'en',
  mysql: {
    enabled: typeof window !== 'undefined' && !window.location.hostname.includes('run.app') && window.location.hostname !== 'localhost',
    apiUrl: '/pos_api.php',
    dbHost: 'localhost',
    dbName: '',
    dbUser: '',
    dbPass: ''
  }
};

export const initialCategories: CategoryItem[] = [
  { id: 'CAT-1', name: 'Fan' },
  { id: 'CAT-2', name: 'Battery' },
  { id: 'CAT-3', name: 'IPS' },
  { id: 'CAT-4', name: 'Solar' },
  { id: 'CAT-5', name: 'Lights' },
];

export const initialProducts: Product[] = [
  { id: '1', name: 'Ceiling Fan 56"', category: 'Fan', price: 2500, stock: 15 },
  { id: '2', name: 'Table Fan 18"', category: 'Fan', price: 1800, stock: 10 },
  { id: '3', name: 'Tubular Battery 12V 200Ah', category: 'Battery', price: 18500, stock: 5 },
  { id: '4', name: 'Dry Cell Battery 12V 100Ah', category: 'Battery', price: 12000, stock: 8 },
  { id: '5', name: 'IPS Inverter 1000VA', category: 'IPS', price: 8500, stock: 4 },
  { id: '6', name: 'Solar Panel 150W', category: 'Solar', price: 4500, stock: 20 },
  { id: '7', name: 'LED Tube Light 18W', category: 'Lights', price: 350, stock: 50 },
];

export const initialSales: Sale[] = [
  { 
    id: 'S-1001', 
    date: new Date(Date.now() - 86400000).toISOString(), 
    items: [{ id: '1', name: 'Ceiling Fan 56"', category: 'Fan', price: 2500, stock: 15, quantity: 2 }],
    total: 5000,
    customerName: 'Rahim'
  }
];

export const initialCustomers: Customer[] = [
  { id: 'C-1001', name: 'Rahim Uddin', phone: '01711000000', totalPurchases: 5000 },
  { id: 'C-1002', name: 'Karim Hasan', phone: '01811000000', totalPurchases: 2500 }
];

export const initialUsers: AppUser[] = [
  {
    id: 'U-1001',
    name: 'Md. Khaja',
    email: 'admin@khaja.com',
    phone: '01911000000',
    role: 'superAdmin',
    password: 'password123',
    permissions: {
      dashboard: true,
      pos: true,
      inventory: true,
      customers: true,
      reports: true,
      users: true,
      settings: true
    }
  },
  {
    id: 'U-1002',
    name: 'Admin User',
    email: 'manager@khaja.com',
    phone: '01811000000',
    role: 'admin',
    password: 'password123',
    permissions: {
      dashboard: true,
      pos: true,
      inventory: true,
      customers: true,
      reports: true,
      users: false,
      settings: true
    }
  },
  {
    id: 'U-1003',
    name: 'Sales Staff',
    email: 'staff@khaja.com',
    phone: '01611000000',
    role: 'staff',
    password: 'password123',
    permissions: {
      dashboard: true,
      pos: true,
      inventory: false,
      customers: true,
      reports: false,
      users: false,
      settings: false
    }
  }
];
