import React, { useState, useMemo } from 'react';
import { Sale, Product } from '../types';
import { FileText, Download, Calendar, ArrowDownCircle } from 'lucide-react';

interface ReportsProps {
  sales: Sale[];
  products: Product[];
  lang: 'en' | 'bn';
}

const strings = {
  en: {
    title: 'Reports & Analytics',
    salesReport: 'Sales Report',
    inventoryReport: 'Inventory Export',
    startDate: 'Start Date',
    endDate: 'End Date',
    totalSales: 'Total Sales in Period',
    totalRevenue: 'Total Revenue',
    exportCSV: 'Export CSV',
    exportPDF: 'Export PDF',
    id: 'Sale ID',
    date: 'Date',
    customer: 'Customer',
    amount: 'Amount',
    noSales: 'No sales found in this period.',
    exportInventoryCSV: 'Export Inventory CSV',
  },
  bn: {
    title: 'রিপোর্ট এবং বিশ্লেষণ',
    salesReport: 'বিক্রয়ের রিপোর্ট',
    inventoryReport: 'ইনভেন্টরি এক্সপোর্ট',
    startDate: 'শুরুর তারিখ',
    endDate: 'শেষ তারিখ',
    totalSales: 'মোট বিক্রয়',
    totalRevenue: 'মোট আয়',
    exportCSV: 'CSV এক্সপোর্ট',
    exportPDF: 'PDF এক্সপোর্ট',
    id: 'বিক্রয় আইডি',
    date: 'তারিখ',
    customer: 'গ্রাহক',
    amount: 'পরিমাণ',
    noSales: 'এই সময়ে কোন বিক্রয় পাওয়া যায়নি।',
    exportInventoryCSV: 'ইনভেন্টরি CSV এক্সপোর্ট',
  }
};

export default function Reports({ sales, products, lang }: ReportsProps) {
  const t = strings[lang];
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const saleDate = s.date.split('T')[0];
      return saleDate >= startDate && saleDate <= endDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, startDate, endDate]);

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);

  const exportSalesCSV = () => {
    const headers = ['Sale ID', 'Date', 'Customer Name', 'Customer Phone', 'Total Amount', 'Items'];
    const rows = filteredSales.map(s => [
      s.id,
      new Date(s.date).toLocaleDateString(),
      s.customerName || 'Walk-in',
      s.customerPhone || '',
      s.total.toString(),
      s.items.map(i => `${i.name} (x${i.quantity})`).join('; ')
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(cell => `"${cell}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportInventoryCSV = () => {
    const headers = ['Product ID', 'Name', 'Category', 'Price', 'Current Stock'];
    const rows = products.map(p => [
      p.id,
      p.name,
      p.category,
      p.price.toString(),
      p.stock.toString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(cell => `"${cell}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-3 mb-2 shrink-0">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="font-bold text-2xl text-slate-800">{t.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 space-y-4">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {t.salesReport}
          </h3>
          
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.startDate}</label>
              <input 
                type="date" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.endDate}</label>
              <input 
                type="date" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 mt-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-500 mb-1">{t.totalSales}</div>
              <div className="text-2xl font-bold text-slate-800">{filteredSales.length}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-blue-600 mb-1">{t.totalRevenue}</div>
              <div className="text-2xl font-bold text-blue-900">৳{totalRevenue.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 space-y-4 flex flex-col justify-center">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-2">
            <Download className="w-5 h-5 text-blue-600" />
            {t.inventoryReport}
          </h3>
          <p className="text-sm text-slate-500 mb-4">Export your current inventory data, including stock levels and prices, to a CSV file for backup or analysis.</p>
          <button 
            onClick={exportInventoryCSV}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white w-full py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowDownCircle className="w-5 h-5" />
            {t.exportInventoryCSV}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col min-h-0 flex-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Sales Data</h3>
          <button 
            onClick={exportSalesCSV}
            disabled={filteredSales.length === 0}
            className="text-sm flex items-center gap-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {t.exportCSV}
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-sm z-10">
              <tr className="text-[#475569] text-[11px] uppercase tracking-wider">
                <th className="p-4 font-bold">{t.date}</th>
                <th className="p-4 font-bold">{t.id}</th>
                <th className="p-4 font-bold">{t.customer}</th>
                <th className="p-4 font-bold text-right">{t.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors text-sm">
                  <td className="p-4">{new Date(sale.date).toLocaleString()}</td>
                  <td className="p-4 font-medium text-slate-800">{sale.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{sale.customerName || '-'}</div>
                    <div className="text-xs text-slate-500">{sale.customerPhone}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-800 text-right">৳{sale.total.toLocaleString()}</td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    {t.noSales}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
