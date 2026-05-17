import React, { useState } from 'react';
import { CategoryItem } from '../types';
import { Plus, Edit2, Trash2, Search, X, Tags, 
  Package, ShoppingBag, Laptop, Smartphone, Speaker, Watch, 
  Zap, Sun, Battery, Settings, Users, Shield, LayoutDashboard,
  HardDrive, Cpu, MousePointer2, Keyboard, Monitor
} from 'lucide-react';
import * as Icons from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

const categoryIcons = [
  { name: 'Package', icon: Package },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Laptop', icon: Laptop },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Speaker', icon: Speaker },
  { name: 'Watch', icon: Watch },
  { name: 'Zap', icon: Zap },
  { name: 'Sun', icon: Sun },
  { name: 'Battery', icon: Battery },
  { name: 'HardDrive', icon: HardDrive },
  { name: 'Cpu', icon: Cpu },
  { name: 'MousePointer2', icon: MousePointer2 },
  { name: 'Keyboard', icon: Keyboard },
  { name: 'Monitor', icon: Monitor },
  { name: 'Settings', icon: Settings },
  { name: 'Users', icon: Users },
  { name: 'Shield', icon: Shield },
  { name: 'LayoutDashboard', icon: LayoutDashboard },
  { name: 'Tags', icon: Tags },
];

const IconRenderer = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (Icons as any)[name] || Package;
  return <IconComponent className={className} />;
};

interface CategoriesProps {
  categories: CategoryItem[];
  onAddCategory: (category: CategoryItem) => void;
  onUpdateCategory: (category: CategoryItem) => void;
  onDeleteCategory: (id: string) => void;
  lang: 'en' | 'bn';
}

const strings = {
  en: {
    title: 'Category Management',
    addBtn: 'Add Category',
    search: 'Search categories...',
    name: 'Category Name',
    actions: 'Actions',
    save: 'Save',
    cancel: 'Cancel',
    editTitle: 'Edit Category',
    addTitle: 'Add New Category',
    confirmDelete: 'Are you sure you want to delete this category?',
    noCategories: 'No categories found.',
    icon: 'Icon'
  },
  bn: {
    title: 'ক্যাটাগরি ব্যবস্থাপনা',
    addBtn: 'ক্যাটাগরি যোগ করুন',
    search: 'ক্যাটাগরি খুঁজুন...',
    name: 'ক্যাটাগরির নাম',
    actions: 'অ্যাকশন',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    editTitle: 'ক্যাটাগরি সম্পাদনা',
    addTitle: 'নতুন ক্যাটাগরি যোগ করুন',
    confirmDelete: 'আপনি কি নিশ্চিত যে আপনি এই ক্যাটাগরি মুছে ফেলতে চান?',
    noCategories: 'কোন ক্যাটাগরি পাওয়া যায়নি।',
    icon: 'আইকন'
  }
};

export default function Categories({ categories, onAddCategory, onUpdateCategory, onDeleteCategory, lang }: CategoriesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState('Package');

  const t = strings[lang];

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const categoryData: CategoryItem = {
      id: editingItem ? editingItem.id : `CAT-${Date.now()}`,
      name: formData.get('name') as string,
      icon: selectedIcon,
    };

    if (editingItem) {
      onUpdateCategory(categoryData);
    } else {
      onAddCategory(categoryData);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteCategory(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setSelectedIcon('Package');
    setIsModalOpen(true);
  };

  const openEdit = (category: CategoryItem) => {
    setEditingItem(category);
    setSelectedIcon(category.icon || 'Package');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <Tags className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-lg text-slate-800">{t.title}</h2>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <button 
            onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm"
          >
            <Plus className="w-4 h-4" />
            {t.addBtn}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-[#475569] text-[11px] uppercase tracking-wider sticky top-0">
              <th className="p-4 font-bold w-16">{t.icon}</th>
              <th className="p-4 font-bold">{t.name}</th>
              <th className="p-4 font-bold text-right rounded-tr-lg">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(category => (
              <tr key={category.id} className="hover:bg-slate-50 transition-colors text-sm">
                <td className="p-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-blue-600 border border-slate-200">
                    <IconRenderer name={category.icon || 'Package'} className="w-5 h-5" />
                  </div>
                </td>
                <td className="p-4 font-medium text-slate-800">{category.name}</td>
                <td className="p-4 flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={2} className="p-8 text-center text-slate-400">
                  {t.noCategories}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
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
                  autoFocus
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.icon}</label>
                <div className="grid grid-cols-6 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-40 overflow-y-auto">
                  {categoryIcons.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setSelectedIcon(item.name)}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                        selectedIcon === item.name 
                        ? 'bg-blue-600 text-white shadow-md scale-110' 
                        : 'bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600 border border-slate-200'
                      }`}
                      title={item.name}
                    >
                      <item.icon className="w-5 h-5" />
                    </button>
                  ))}
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
        title={lang === 'en' ? "Delete Category" : "ক্যাটাগরি মুছুন"}
        message={t.confirmDelete}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
        confirmText={lang === 'en' ? "Delete" : "মুছুন"}
        cancelText={t.cancel}
      />
    </div>
  );
}
