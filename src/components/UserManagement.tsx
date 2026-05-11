import React, { useState } from 'react';
import { AppUser, Role } from '../types';
import { Plus, Edit2, Trash2, Search, X, ShieldAlert, Check } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface UserManagementProps {
  users: AppUser[];
  onAddUser: (user: AppUser) => void;
  onUpdateUser: (user: AppUser) => void;
  onDeleteUser: (id: string) => void;
  lang: 'en' | 'bn';
}

const strings = {
  en: {
    title: 'User Management',
    addBtn: 'Create User',
    search: 'Search users...',
    name: 'Full Name',
    role: 'Role',
    email: 'Email',
    phone: 'Phone',
    permissions: 'Permissions',
    actions: 'Actions',
    save: 'Save User',
    cancel: 'Cancel',
    editTitle: 'Edit User',
    addTitle: 'Create New User',
    confirmDelete: 'Are you sure you want to delete this user? They will lose access to the system.',
  },
  bn: {
    title: 'ইউজার ব্যবস্থাপনা',
    addBtn: 'ইউজার তৈরি করুন',
    search: 'ইউজার খুঁজুন...',
    name: 'পুরো নাম',
    role: 'রোল',
    email: 'ইমেইল',
    phone: 'ফোন',
    permissions: 'অনুমতিসমূহ',
    actions: 'অ্যাকশন',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    editTitle: 'ইউজার সম্পাদনা',
    addTitle: 'নতুন ইউজার তৈরি করুন',
    confirmDelete: 'আপনি কি নিশ্চিত যে আপনি এই ইউজার মুছে ফেলতে চান?',
  }
};

export default function UserManagement({ users, onAddUser, onUpdateUser, onDeleteUser, lang }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AppUser | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const t = strings[lang];

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteUser(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (user: AppUser) => {
    setEditingItem(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const role = formData.get('role') as Role;
    const isEditingMode = !!editingItem;
    
    // For simplicity in this demo, admin has all permissions. 
    // We could allow detailed checkbox selection, but a simple role-based or checkbox array is better.
    // Let's implement actual checkboxes for permissions.
    const permissions = {
      dashboard: formData.get('perm_dashboard') === 'on',
      pos: formData.get('perm_pos') === 'on',
      inventory: formData.get('perm_inventory') === 'on',
      customers: formData.get('perm_customers') === 'on',
      reports: formData.get('perm_reports') === 'on',
      users: formData.get('perm_users') === 'on',
      settings: formData.get('perm_settings') === 'on'
    };

    const userData: AppUser = {
      id: isEditingMode ? editingItem.id : `U-${Date.now()}`,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: role,
      password: (formData.get('password') as string) || (isEditingMode ? editingItem.password : 'defaultPass123'),
      permissions: permissions
    };

    if (isEditingMode) {
      onUpdateUser(userData);
    } else {
      onAddUser(userData);
    }
    closeModal();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
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
            <tr className="bg-slate-100 text-[#475569] text-[11px] uppercase tracking-wider sticky top-0 z-10">
              <th className="p-4 font-bold">{t.name}</th>
              <th className="p-4 font-bold">{t.role}</th>
              <th className="p-4 font-bold">{t.email}</th>
              <th className="p-4 font-bold">{t.permissions}</th>
              <th className="p-4 font-bold text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors text-sm">
                <td className="p-4">
                  <div className="font-medium text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.phone}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase \${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-slate-600">{user.email}</td>
                <td className="p-4">
                  <div className="flex gap-1 flex-wrap max-w-[200px]">
                    {Object.entries(user.permissions).map(([key, value]) => 
                      value ? (
                        <span key={key} className="text-[10px] bg-blue-50 border border-blue-100 text-blue-600 px-1.5 py-0.5 rounded capitalize">
                          {key}
                        </span>
                      ) : null
                    )}
                  </div>
                </td>
                <td className="p-4 flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-slate-800">
                {editingItem ? t.editTitle : t.addTitle}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.name}</label>
                    <input 
                      required
                      name="name"
                      defaultValue={editingItem?.name}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.role}</label>
                    <select 
                      name="role"
                      defaultValue={editingItem?.role || 'staff'}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm bg-white"
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.email}</label>
                    <input 
                      required
                      type="email"
                      name="email"
                      defaultValue={editingItem?.email}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.phone}</label>
                    <input 
                      required
                      type="tel"
                      name="phone"
                      defaultValue={editingItem?.phone}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input 
                      type="password"
                      name="password"
                      placeholder={editingItem ? "Leave blank to keep unchanged" : "Password"}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm" 
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-2">
                  <label className="block text-sm font-bold text-slate-800 mb-3">{t.permissions}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['dashboard', 'pos', 'inventory', 'customers', 'reports', 'users', 'settings'].map((perm) => (
                      <label key={perm} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name={`perm_${perm}`} 
                          defaultChecked={editingItem ? editingItem.permissions[perm as keyof AppUser['permissions']] : ['dashboard', 'pos'].includes(perm)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="text-sm font-medium text-slate-700 capitalize">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
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
        title={lang === 'en' ? "Delete User" : "ইউজার মুছুন"}
        message={t.confirmDelete}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
        confirmText={lang === 'en' ? "Delete" : "মুছুন"}
        cancelText={t.cancel}
      />
    </div>
  );
}
