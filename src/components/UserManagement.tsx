import React, { useState } from 'react';
import { AppUser, Role } from '../types';
import { Plus, Edit2, Trash2, Search, X, ShieldAlert, Check } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface UserManagementProps {
  currentUser: AppUser;
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

export default function UserManagement({ currentUser, users, onAddUser, onUpdateUser, onDeleteUser, lang }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AppUser | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const t = strings[lang];
  const [view, setView] = useState<'users' | 'roles'>('users');

  const roleDefinitions = [
    {
      name: 'SuperAdmin',
      role: 'superAdmin',
      description: lang === 'en' ? 'Full system control. Can manage other users, permissions, and system-wide settings.' : 'সিস্টেমের পূর্ণ নিয়ন্ত্রণ। ইউজার, পারমিশন এবং সেটিংস পরিবর্তন করতে পারেন।',
      access: ['dashboard', 'pos', 'inventory', 'customers', 'reports', 'users', 'settings']
    },
    {
      name: 'Admin',
      role: 'admin',
      description: lang === 'en' ? 'Managerial access. Can manage inventory, products, and reports but cannot modify other user accounts or roles.' : 'ম্যানেজারিয়াল অ্যাক্সেস। ইনভেন্টরি, পণ্য এবং রিপোর্ট তদারকি করতে পারেন কিন্তু অন্য ইউজার পরিবর্তন করতে পারেন না।',
      access: ['dashboard', 'pos', 'inventory', 'customers', 'reports', 'settings']
    },
    {
      name: 'Staff',
      role: 'staff',
      description: lang === 'en' ? 'Operational access. Restricted to sales (POS), customers, and basic dashboard overview.' : 'অপারেশনাল অ্যাক্সেস। শুধুমাত্র বিক্রয় (POS), কাস্টমার এবং ড্যাশবোর্ড ব্যবহারের অনুমতি রয়েছে।',
      access: ['dashboard', 'pos', 'customers']
    }
  ];

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

  const [selectedRole, setSelectedRole] = useState<Role>('staff');
  const [permissions, setPermissions] = useState<AppUser['permissions']>(() => ({
    dashboard: true, pos: true, inventory: false, customers: true, reports: false, users: false, settings: false
  }));

  const getRolePermissions = (role: Role) => {
    switch(role) {
      case 'superAdmin':
        return { dashboard: true, pos: true, inventory: true, customers: true, reports: true, users: true, settings: true };
      case 'admin':
        return { dashboard: true, pos: true, inventory: true, customers: true, reports: true, users: false, settings: true };
      case 'staff':
      default:
        return { dashboard: true, pos: true, inventory: false, customers: true, reports: false, users: false, settings: false };
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setSelectedRole('staff');
    setPermissions(getRolePermissions('staff'));
    setIsModalOpen(true);
  };

  const openEdit = (user: AppUser) => {
    setEditingItem(user);
    setSelectedRole(user.role);
    setPermissions(user.permissions);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    setSelectedRole(newRole);
    setPermissions(getRolePermissions(newRole));
  };

  const handlePermissionChange = (perm: keyof AppUser['permissions']) => {
    setPermissions(prev => ({ ...prev, [perm]: !prev[perm] }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const isEditingMode = !!editingItem;
    
    const userData: AppUser = {
      id: isEditingMode ? editingItem.id : `U-${Date.now()}`,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: selectedRole,
      password: (formData.get('password') as string) || (isEditingMode ? editingItem.password : 'password123'),
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
          <div className="flex bg-slate-100 p-1 rounded-lg ml-2">
            <button 
              onClick={() => setView('users')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${view === 'users' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {lang === 'en' ? 'Users' : 'ইউজার'}
            </button>
            <button 
              onClick={() => setView('roles')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${view === 'roles' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {lang === 'en' ? 'Roles' : 'রোলসমূহ'}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {view === 'users' && (
            <>
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
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {view === 'users' ? (
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
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      user.role === 'superAdmin' ? 'bg-purple-100 text-purple-700' : 
                      user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 
                      'bg-slate-200 text-slate-700'
                    }`}>
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
                    {(currentUser.role === 'superAdmin' || user.role !== 'superAdmin') && (
                      <>
                        <button onClick={() => openEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {currentUser.role !== 'superAdmin' && user.role === 'superAdmin' && (
                      <span className="text-[10px] text-slate-400 italic italic">Protected</span>
                    )}
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
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roleDefinitions.map((def) => (
                <div key={def.role} className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800">{def.name}</h3>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      def.role === 'superAdmin' ? 'bg-purple-100 text-purple-700' : 
                      def.role === 'admin' ? 'bg-amber-100 text-amber-700' : 
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {def.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                    {def.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.permissions}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {def.access.map(perm => (
                        <div key={perm} className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-1">
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-[10px] font-medium text-slate-700 capitalize">{perm}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
                      value={selectedRole}
                      onChange={handleRoleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm bg-white"
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                      {currentUser.role === 'superAdmin' && <option value="superAdmin">SuperAdmin</option>}
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
                    {['dashboard', 'pos', 'inventory', 'customers', 'reports', 'users', 'settings'].map((perm) => {
                      const isSensitive = ['users', 'settings'].includes(perm);
                      const canManageSensitive = currentUser.role === 'superAdmin';
                      
                      if (isSensitive && !canManageSensitive) return null;
                      
                      return (
                        <label key={perm} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            name={`perm_${perm}`} 
                            checked={permissions[perm as keyof AppUser['permissions']]}
                            onChange={() => handlePermissionChange(perm as keyof AppUser['permissions'])}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span className="text-sm font-medium text-slate-700 capitalize">{perm}</span>
                        </label>
                      );
                    })}
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
