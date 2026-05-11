import React, { useState } from 'react';
import { Customer } from '../types';
import { Plus, Edit2, Trash2, Search, X, Users } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface CustomersProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  lang: 'en' | 'bn';
}

const strings = {
  en: {
    title: 'Customer Management',
    addBtn: 'Add Customer',
    search: 'Search Customers...',
    name: 'Customer Name',
    phone: 'Phone Number',
    email: 'Email',
    address: 'Address',
    purchases: 'Total Purchases',
    actions: 'Actions',
    save: 'Save',
    cancel: 'Cancel',
    editTitle: 'Edit Customer',
    addTitle: 'Add New Customer',
    confirmDelete: 'Are you sure you want to delete this customer?',
  },
  bn: {
    title: 'গ্রাহক ব্যবস্থাপনা',
    addBtn: 'গ্রাহক যোগ করুন',
    search: 'গ্রাহক খুঁজুন...',
    name: 'গ্রাহকের নাম',
    phone: 'ফোন নম্বর',
    email: 'ইমেইল',
    address: 'ঠিকানা',
    purchases: 'মোট ক্রয়',
    actions: 'অ্যাকশন',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    editTitle: 'গ্রাহক সম্পাদনা',
    addTitle: 'নতুন গ্রাহক যোগ করুন',
    confirmDelete: 'আপনি কি নিশ্চিত যে আপনি এই গ্রাহককে মুছে ফেলতে চান?',
  }
};

export default function Customers({ customers, onAddCustomer, onUpdateCustomer, onDeleteCustomer, lang }: CustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Customer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const t = strings[lang];

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerData: Customer = {
      id: editingItem ? editingItem.id : `C-${Date.now()}`,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      totalPurchases: editingItem ? editingItem.totalPurchases : 0,
    };

    if (editingItem) {
      onUpdateCustomer(customerData);
    } else {
      onAddCustomer(customerData);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteCustomer(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingItem(customer);
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
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Users className="w-5 h-5" />
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
              <th className="p-4 font-bold">{t.name}</th>
              <th className="p-4 font-bold">{t.phone}</th>
              <th className="p-4 font-bold">{t.email}</th>
              <th className="p-4 font-bold">{t.purchases}</th>
              <th className="p-4 font-bold text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(customer => (
              <tr key={customer.id} className="hover:bg-slate-50 transition-colors text-sm">
                <td className="p-4 font-medium text-slate-800">{customer.name}</td>
                <td className="p-4 font-medium text-slate-600">{customer.phone}</td>
                <td className="p-4 text-slate-500">{customer.email || '-'}</td>
                <td className="p-4 font-bold text-slate-800">৳{customer.totalPurchases.toLocaleString()}</td>
                <td className="p-4 flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(customer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(customer.id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  No customers found.
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
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.phone}</label>
                <input 
                  required
                  type="tel"
                  name="phone"
                  defaultValue={editingItem?.phone}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.email} (Optional)</label>
                <input 
                  type="email"
                  name="email"
                  defaultValue={editingItem?.email}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.address} (Optional)</label>
                <textarea 
                  name="address"
                  defaultValue={editingItem?.address}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500" 
                  rows={2}
                />
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
        title={lang === 'en' ? "Delete Customer" : "গ্রাহক মুছুন"}
        message={t.confirmDelete}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
        confirmText={lang === 'en' ? "Delete" : "মুছুন"}
        cancelText={t.cancel}
      />
    </div>
  );
}
