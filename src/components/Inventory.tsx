import React, { useState } from 'react';
import { Product, CategoryItem } from '../types';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface InventoryProps {
  products: Product[];
  categories: CategoryItem[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  lang: 'en' | 'bn';
}

const strings = {
  en: {
    addBtn: 'Add Product',
    search: 'Search Inventory...',
    name: 'Product Name',
    category: 'Category',
    price: 'Price',
    stock: 'Stock',
    actions: 'Actions',
    save: 'Save',
    cancel: 'Cancel',
    editTitle: 'Edit Product',
    addTitle: 'Add New Product',
  },
  bn: {
    addBtn: 'পণ্য যোগ করুন',
    search: 'ইনভেন্টরি খুঁজুন...',
    name: 'পণ্যের নাম',
    category: 'বিভাগ',
    price: 'দাম',
    stock: 'স্টক',
    actions: 'অ্যাকশন',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    editTitle: 'পণ্য সম্পাদনা করুন',
    addTitle: 'নতুন পণ্য যোগ করুন',
  }
};

export default function Inventory({ products, categories, onAddProduct, onUpdateProduct, onDeleteProduct, lang }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const t = strings[lang];

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData: Product = {
      id: editingItem ? editingItem.id : `P-${Date.now()}`,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
    };

    if (editingItem) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteProduct(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingItem(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          {t.addBtn}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-[#475569] text-[11px] uppercase tracking-wider">
              <th className="p-4 font-bold">{t.name}</th>
              <th className="p-4 font-bold">{t.category}</th>
              <th className="p-4 font-bold">{t.price}</th>
              <th className="p-4 font-bold">{t.stock}</th>
              <th className="p-4 font-bold text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-800">{product.name}</td>
                <td className="p-4">
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded inline-block">
                    {product.category}
                  </span>
                </td>
                <td className="p-4 font-bold text-slate-800">৳{product.price}</td>
                <td className="p-4">
                  <span className={`font-bold ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="p-4 flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                {editingItem ? t.editTitle : t.addTitle}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.name}</label>
                <input 
                  required
                  name="name"
                  defaultValue={editingItem?.name}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.category}</label>
                <select 
                  required
                  name="category"
                  defaultValue={editingItem?.category || (categories[0]?.name || '')}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                >
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.price} (৳)</label>
                  <input 
                    required
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    defaultValue={editingItem?.price}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.stock}</label>
                  <input 
                    required
                    type="number"
                    name="stock"
                    min="0"
                    defaultValue={editingItem?.stock ?? 1}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!deleteConfirmId}
        title={lang === 'en' ? "Delete Product" : "পণ্য মুছুন"}
        message={lang === 'en' ? "Are you sure you want to delete this product? This action cannot be undone." : "আপনি কি নিশ্চিত যে আপনি এই পণ্যটি মুছে ফেলতে চান? এই অ্যাকশনটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।"}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
        confirmText={lang === 'en' ? "Delete" : "মুছুন"}
        cancelText={lang === 'en' ? "Cancel" : "বাতিল"}
      />
    </div>
  );
}
