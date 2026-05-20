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
  initialFilter?: 'all' | 'low-stock';
}

const strings = {
  en: {
    addBtn: 'Add Product',
    bulkBtn: 'Bulk Import',
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
    image: 'Image',
    upload: 'Upload Image',
    bulkTitle: 'Bulk Import (CSV)',
    bulkPlaceholder: 'name,category,price,stock\nCeiling Fan,Fan,2500,10\nBattery,Electronics,12000,5',
    import: 'Import',
    invalidData: 'Invalid data format. Please use: name,category,price,stock',
  },
  bn: {
    addBtn: 'পণ্য যোগ করুন',
    bulkBtn: 'বাল্ক ইম্পোর্ট',
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
    image: 'ছবি',
    upload: 'ছবি আপলোড করুন',
    bulkTitle: 'বাল্ক ইম্পোর্ট (CSV)',
    bulkPlaceholder: 'নাম,বিভাগ,দাম,স্টক\nপণ্য ১,বিভাগ ১,১০০,১০',
    import: 'ইম্পোর্ট',
    invalidData: 'ভুল ডেটা ফরম্যাট। ব্যবহার করুন: নাম,বিভাগ,দাম,স্টক',
  }
};

export default function Inventory({ products, categories, onAddProduct, onUpdateProduct, onDeleteProduct, lang, initialFilter = 'all' }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'low-stock'>(initialFilter);

  const t = strings[lang];

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterMode === 'all' || (p.stock > 0 && p.stock <= 5);
    return matchesSearch && matchesFilter;
  });

  const handleBulkImport = () => {
    const lines = bulkData.trim().split('\n');
    let importedCount = 0;
    
    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 4) {
        const [name, category, price, stock] = parts;
        if (name && category && !isNaN(Number(price)) && !isNaN(Number(stock))) {
          const productData: Product = {
            id: `P-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name,
            category,
            price: Number(price),
            stock: Number(stock),
          };
          onAddProduct(productData);
          importedCount++;
        }
      }
    });

    if (importedCount > 0) {
      alert(`Successfully imported ${importedCount} products!`);
      setIsBulkModalOpen(false);
      setBulkData('');
    } else {
      alert(t.invalidData);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 300;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            setImageBase64(compressed);
          } else {
            setImageBase64(reader.result as string);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData: Product = {
      id: editingItem ? editingItem.id : `P-${Date.now()}`,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      image: imageBase64 || editingItem?.image,
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
    setImageBase64('');
    setIsModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingItem(product);
    setImageBase64(product.image || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setImageBase64('');
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
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            {t.bulkBtn}
          </button>
          <button 
            onClick={openAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            {t.addBtn}
          </button>
        </div>
      </div>

      {filterMode === 'low-stock' && (
        <div className="px-6 py-2 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Showing Low Stock Items Only
          </span>
          <button 
            onClick={() => setFilterMode('all')}
            className="text-[10px] bg-rose-100 hover:bg-rose-200 text-rose-700 px-2 py-0.5 rounded font-bold transition-colors"
          >
            Show All
          </button>
        </div>
      )}

      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">{t.bulkTitle}</h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Paste your products below in CSV format. Each line should be: <code className="bg-slate-100 px-1 rounded font-bold text-blue-600">name,category,price,stock</code></p>
              <textarea 
                className="w-full h-64 px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 font-mono text-sm leading-relaxed"
                placeholder={t.bulkPlaceholder}
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={handleBulkImport}
                  className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {t.import}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-[#475569] text-[11px] uppercase tracking-wider">
              <th className="p-4 font-bold w-16">{t.image}</th>
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
                <td className="p-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">NO IMG</div>
                    )}
                  </div>
                </td>
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.image}</label>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                    {imageBase64 ? (
                      <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">Preview</div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
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
