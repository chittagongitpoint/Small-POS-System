import React, { useState } from 'react';
import { AppUser } from '../types';
import { User, Lock, Mail, Phone, Save } from 'lucide-react';

interface UserProfileProps {
  user: AppUser;
  onUpdateUser: (updatedData: Partial<AppUser>) => void;
  lang: 'en' | 'bn';
}

const strings = {
  en: {
    title: 'Profile Settings',
    personalInfo: 'Personal Information',
    name: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    passwordParams: 'Security',
    newPassword: 'New Password',
    updateBtn: 'Update Profile',
    success: 'Profile updated successfully!',
  },
  bn: {
    title: 'প্রোফাইল সেটিংস',
    personalInfo: 'ব্যক্তিগত তথ্য',
    name: 'পুরো নাম',
    phone: 'ফোন নম্বর',
    email: 'ইমেইল ঠিকানা',
    passwordParams: 'নিরাপত্তা',
    newPassword: 'নতুন পাসওয়ার্ড',
    updateBtn: 'প্রোফাইল আপডেট করুন',
    success: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!',
  }
};

export default function UserProfile({ user, onUpdateUser, lang }: UserProfileProps) {
  const t = strings[lang];
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
    email: user.email,
    password: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatePayload: Partial<AppUser> = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
    };
    if (formData.password.trim() !== '') {
      updatePayload.password = formData.password;
    }
    onUpdateUser(updatePayload);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setFormData(prev => ({ ...prev, password: '' }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <User className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-lg text-slate-800">{t.title}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {showSuccess && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-lg font-medium text-sm">
              {t.success}
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              {t.personalInfo}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.name}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.phone}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              {t.passwordParams}
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.newPassword}</label>
              <div className="relative max-w-md">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  placeholder="Leave blank to keep unchanged"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              {t.updateBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
