import React from 'react';
import { Product, Sale } from '../types';
import { TrendingUp, Package, AlertTriangle, Coins } from 'lucide-react';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  lang: 'en' | 'bn';
  onNavigate: (tab: any, filter?: string) => void;
}

const strings = {
  en: {
    totalSalesText: 'Total Sales Revenue',
    totalItems: 'Total Inventory Items',
    lowStock: 'Low Stock Alert',
    todaySales: 'Today\'s Sales',
    recentSales: 'Recent Sales',
    topProducts: 'Top Products',
    id: 'ID',
    customer: 'Customer',
    amount: 'Amount',
    stock: 'Stock',
    viewInventory: 'View Inventory',
  },
  bn: {
    totalSalesText: 'মোট বিক্রয় আয়',
    totalItems: 'মোট ইনভেন্টরি পণ্য',
    lowStock: 'কম স্টকের সতর্কতা',
    todaySales: 'আজকের বিক্রয়',
    recentSales: 'সাম্প্রতিক বিক্রয়',
    topProducts: 'শীর্ষ পণ্য',
    id: 'আইডি',
    customer: 'গ্রাহক',
    amount: 'পরিমাণ',
    stock: 'স্টক',
    viewInventory: 'ইনভেন্টরি দেখুন',
  }
};

export default function Dashboard({ products, sales, lang, onNavigate }: DashboardProps) {
  const t = strings[lang];
  
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalProducts = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);
  
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.date.startsWith(today)).reduce((sum, s) => sum + s.total, 0);

  const recentSales = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg hidden lg:block">
            <Coins className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t.totalSalesText}</div>
            <div className="text-2xl font-bold text-slate-800">৳{totalRevenue.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg hidden lg:block">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t.todaySales}</div>
            <div className="text-2xl font-bold text-slate-800">৳{todaySales.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg hidden lg:block">
            <Package className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t.totalItems}</div>
            <div className="text-2xl font-bold text-slate-800">{totalProducts}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm flex items-center gap-4 hover:border-rose-200 transition-colors cursor-pointer" onClick={() => onNavigate('inventory', 'low-stock')}>
          <div className="p-3 bg-rose-100 text-rose-600 rounded-lg hidden lg:block">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t.lowStock}</div>
            <div className="text-2xl font-bold text-rose-500">{lowStockProducts.length.toString().padStart(2, '0')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">{t.recentSales}</h3>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto">
            {recentSales.map(sale => (
              <div key={sale.id} className="p-5 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <div className="font-medium text-slate-800">{sale.id}</div>
                  <div className="text-sm text-slate-500">{sale.customerName || 'Walk-in Customer'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">৳{sale.total.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">{new Date(sale.date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <div className="p-5 text-center text-slate-500 italic">No recent sales</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              {t.lowStock}
            </h3>
            <button 
              onClick={() => onNavigate('inventory', 'low-stock')}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
            >
              {t.viewInventory} →
            </button>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto">
            {lowStockProducts.map(current => (
              <div key={current.id} className="p-5 flex items-center justify-between hover:bg-rose-50 transition-colors">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                    {current.stock}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{current.name}</div>
                    <div className="text-xs font-semibold text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded">{current.category}</div>
                  </div>
                </div>
                <div className="font-bold text-slate-800">৳{current.price.toLocaleString()}</div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="p-5 text-center text-slate-500 italic">No low stock items!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
