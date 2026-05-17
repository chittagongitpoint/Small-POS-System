import React, { useState } from 'react';
import { Product, CartItem, Sale, Customer } from '../types';
import { ShoppingCart, Plus, Minus, Trash2, Search, User } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface POSProps {
  products: Product[];
  customers: Customer[];
  onCompleteSale: (sale: Sale) => void;
  lang: 'en' | 'bn';
}

const strings = {
  en: {
    searchPlaceholder: 'Search products...',
    addToCart: 'Add',
    cart: 'Current Sale (Cart)',
    emptyCart: 'Cart is empty',
    total: 'Total',
    customerSelect: 'Select Customer (Optional)',
    walkIn: 'Walk-in Customer',
    checkout: 'Complete Sale',
    qty: 'Qty',
    price: 'Price',
    outOfStock: 'Out of Stock',
    confirmSale: 'Complete this sale for ৳',
  },
  bn: {
    searchPlaceholder: 'পণ্য খুঁজুন...',
    addToCart: 'যোগ করুন',
    cart: 'বর্তমান বিক্রয় (কার্ট)',
    emptyCart: 'কার্ট খালি',
    total: 'মোট',
    customerSelect: 'গ্রাহক নির্বাচন করুন (ঐচ্ছিক)',
    walkIn: 'ওয়াক-ইন গ্রাহক',
    checkout: 'বিক্রয় সম্পন্ন করুন',
    qty: 'পরিমাণ',
    price: 'দাম',
    outOfStock: 'স্টক শেষ',
    confirmSale: 'এই বিক্রয় সম্পন্ন করবেন? মোট: ৳',
  }
};

export default function POS({ products, customers, onCompleteSale, lang }: POSProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isConfirmingSale, setIsConfirmingSale] = useState(false);

  const t = strings[lang];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item; 
          const productTarget = products.find(p => p.id === id);
          if (productTarget && newQty > productTarget.stock) return item; 
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setIsConfirmingSale(true);
  };

  const handleConfirmSale = () => {
    const total = calculateTotal();

    let customerDetails = {};
    if (selectedCustomerId) {
      const cust = customers.find(c => c.id === selectedCustomerId);
      if (cust) {
        customerDetails = {
          customerId: cust.id,
          customerName: cust.name,
          customerPhone: cust.phone,
        };
      }
    }

    const newSale: Sale = {
      id: `S-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString(),
      items: [...cart],
      total: total,
      ...customerDetails
    };
    onCompleteSale(newSale);
    setCart([]);
    setSelectedCustomerId('');
  };

  const handleCancelSale = () => {
    setIsConfirmingSale(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Products Section */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col overflow-hidden min-h-0">
        <div className="p-4 border-b border-slate-100 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => product.stock > 0 && addToCart(product)}
                className={`rounded-xl border ${product.stock > 0 ? 'bg-white cursor-pointer hover:border-blue-500 hover:shadow-md transition-all' : 'bg-slate-50 opacity-60 cursor-not-allowed'} border-[#E2E8F0] flex flex-col group overflow-hidden`}
              >
                <div className="h-28 bg-slate-100 relative overflow-hidden border-b border-slate-100 flex-shrink-0">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase py-4">No Image</div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-blue-100">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <div className="font-medium text-slate-800 text-sm mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug flex-1">{product.name}</div>
                  <div className="flex items-end justify-between">
                    <div className="font-bold text-slate-900">৳{product.price}</div>
                    <div className={`text-[10px] font-bold uppercase ${product.stock > 0 ? 'text-green-700 bg-green-50 border border-green-100' : 'text-red-700 bg-red-50 border border-red-100'} px-2 py-0.5 rounded shadow-sm`}>
                      {product.stock > 0 ? `${product.stock} Stock` : t.outOfStock}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col overflow-hidden min-h-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            {t.cart}
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
            {cart.length} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
              <p>{t.emptyCart}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3 justify-between font-sm">
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{item.name}</div>
                    <div className="text-slate-500 text-xs">৳{item.price} each</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-md border border-slate-200 p-0.5">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded text-slate-600" disabled={item.quantity <= 1}>
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-4 text-center font-medium text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded text-slate-600" disabled={item.quantity >= item.stock}>
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">৳{item.price * item.quantity}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-4 flex-shrink-0">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">{t.customerSelect}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">{t.walkIn}</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center py-2 text-lg font-bold border-t border-slate-200 mt-2">
            <span className="text-slate-700">{t.total}:</span>
            <span className="text-blue-600 text-2xl">৳{calculateTotal().toLocaleString()}</span>
          </div>
          
          <button 
            disabled={cart.length === 0}
            onClick={handleCheckoutClick}
            className="w-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-sm transition-colors text-lg flex items-center justify-center gap-2"
          >
            {t.checkout}
          </button>
        </div>
      </div>
      
      <ConfirmDialog 
        isOpen={isConfirmingSale}
        title={lang === 'en' ? 'Confirm Sale' : 'বিক্রয় নিশ্চিত করুন'}
        message={`${t.confirmSale}${calculateTotal().toLocaleString()}`}
        onConfirm={() => {
          handleConfirmSale();
          setIsConfirmingSale(false);
        }}
        onCancel={handleCancelSale}
        confirmText={lang === 'en' ? 'Confirm' : 'নিশ্চিত করুন'}
        cancelText={lang === 'en' ? 'Cancel' : 'বাতিল'}
      />
    </div>
  );
}
