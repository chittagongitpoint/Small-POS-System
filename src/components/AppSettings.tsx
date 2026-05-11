import React, { useState } from 'react';
import { Settings, Save, Globe, Type } from 'lucide-react';
import { SystemSettings } from '../types';

interface AppSettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  lang: 'en' | 'bn';
}

const strings = {
  en: {
    title: 'System Settings',
    systemName: 'System Name',
    systemSubtitle: 'System Subtitle',
    phone: 'Phone Number',
    defaultLang: 'Default Language',
    save: 'Save Changes',
    success: 'Settings updated successfully!',
    english: 'English',
    bengali: 'Bangla (বাংলা)'
  },
  bn: {
    title: 'সিস্টেম সেটিংস',
    systemName: 'সিস্টেমের নাম',
    systemSubtitle: 'প্রতিষ্ঠানের উপশিরোনাম',
    phone: 'মোবাইল নম্বর',
    defaultLang: 'ডিফল্ট ভাষা',
    save: 'পরিবর্তন সংরক্ষণ করুন',
    success: 'সেটিংস সফলভাবে আপডেট হয়েছে!',
    english: 'English',
    bengali: 'Bangla (বাংলা)'
  }
};

export default function AppSettings({ settings, onUpdateSettings, lang }: AppSettingsProps) {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [showSuccess, setShowSuccess] = useState(false);

  const t = strings[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <Settings className="w-5 h-5" />
        </div>
        <h2 className="font-bold text-lg text-slate-800">{t.title}</h2>
      </div>

      <div className="p-6 flex-1 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {showSuccess && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 border border-green-200">
              <span className="font-medium text-sm">{t.success}</span>
            </div>
          )}

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Type className="w-4 h-4 text-slate-400" />
                {t.systemName}
              </label>
              <input
                type="text"
                value={formData.systemName}
                onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Type className="w-4 h-4 text-slate-400" />
                {t.systemSubtitle}
              </label>
              <input
                type="text"
                value={formData.systemSubtitle || ''}
                onChange={(e) => setFormData({ ...formData, systemSubtitle: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Type className="w-4 h-4 text-slate-400" />
                {t.phone}
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Globe className="w-4 h-4 text-slate-400" />
                {t.defaultLang}
              </label>
              <select
                value={formData.defaultLanguage}
                onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value as 'en' | 'bn' })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="en">{t.english}</option>
                <option value="bn">{t.bengali}</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {t.save}
          </button>
        </form>
      </div>
    </div>
  );
}
