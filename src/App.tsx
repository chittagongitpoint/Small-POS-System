import React, { useState, useEffect } from 'react';
import { initialProducts, initialSales, initialCustomers, initialUsers, initialCategories, initialSettings } from './data';
import { Product, Sale, Customer, AppUser, CategoryItem, SystemSettings } from './types';
import POS from './components/POS';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import GASExport from './components/GASExport';
import Customers from './components/Customers';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import Categories from './components/Categories';
import AppSettings from './components/AppSettings';
import Login from './components/Login';
import { LayoutDashboard, ShoppingCart, PackageSearch, Settings, Code, Languages, Users, FileText, ShieldAlert, LogOut, Search, User, Tags } from 'lucide-react';

type Tab = 'dashboard' | 'pos' | 'inventory' | 'categories' | 'customers' | 'reports' | 'users' | 'settings' | 'profile' | 'gas';
type Lang = 'en' | 'bn';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('pos');
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('app_current_user') || null;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('app_settings');
    return saved ? { ...initialSettings, ...JSON.parse(saved) } : initialSettings;
  });
  const [lang, setLang] = useState<Lang>(settings.defaultLanguage);

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    document.title = settings.systemName;
  }, [settings]);

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem('app_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('app_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('app_sales');
    return saved ? JSON.parse(saved) : initialSales;
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('app_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  useEffect(() => {
    localStorage.setItem('app_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('app_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('app_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('app_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);
  
  const handleLogin = (user: AppUser) => {
    setCurrentUserId(user.id);
    localStorage.setItem('app_current_user', user.id);
    // Reset to generic active tab that everyone has (e.g. pos) 
    // or just leave it since the user will use navigation.
    if (!user.permissions[activeTab as keyof AppUser['permissions']] && activeTab !== 'profile') {
      setActiveTab(user.permissions.pos ? 'pos' : 'dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    localStorage.removeItem('app_current_user');
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentUser = users.find(u => u.id === currentUserId) || null; 

  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} systemName={settings.systemName} />;
  } 

  const handleSaleComplete = (sale: Sale) => {
    // confirmation logic inside POS component
    setSales(prev => [...prev, sale]);
    setProducts(prev => prev.map(p => {
      const soldItem = sale.items.find(i => i.id === p.id);
      if (soldItem) {
        return { ...p, stock: p.stock - soldItem.quantity };
      }
      return p;
    }));
    
    // Update customer total purchases if tied to a customer
    if (sale.customerId) {
        setCustomers(prev => prev.map(c => 
          c.id === sale.customerId ? { ...c, totalPurchases: c.totalPurchases + sale.total } : c
        ));
    }
  };

  const handleAddCategory = (c: CategoryItem) => setCategories(prev => [c, ...prev]);
  const handleUpdateCategory = (c: CategoryItem) => setCategories(prev => prev.map(item => item.id === c.id ? c : item));
  const handleDeleteCategory = (id: string) => setCategories(prev => prev.filter(c => c.id !== id));

  const handleAddProduct = (product: Product) => setProducts(prev => [product, ...prev]);
  const handleUpdateProduct = (updatedProduct: Product) => setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  const handleDeleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  const handleAddCustomer = (c: Customer) => setCustomers(prev => [c, ...prev]);
  const handleUpdateCustomer = (c: Customer) => setCustomers(prev => prev.map(item => item.id === c.id ? c : item));
  const handleDeleteCustomer = (id: string) => setCustomers(prev => prev.filter(c => c.id !== id));

  const handleAddUser = (u: AppUser) => setUsers(prev => [u, ...prev]);
  const handleUpdateUser = (u: AppUser) => setUsers(prev => prev.map(item => item.id === u.id ? u : item));
  const handleDeleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

  const handleUpdateProfile = (updatedData: Partial<AppUser>) => {
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
  };

  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    // Update the current language when default language changes
    setLang(newSettings.defaultLanguage);
  };

  const allTabs = [
    { id: 'dashboard', icon: LayoutDashboard, labelEn: 'Dashboard', labelBn: 'ড্যাশবোর্ড', requiredPerm: 'dashboard' },
    { id: 'pos', icon: ShoppingCart, labelEn: 'Sales Point', labelBn: 'বিক্রয় কেন্দ্র', requiredPerm: 'pos' },
    { id: 'inventory', icon: PackageSearch, labelEn: 'Inventory', labelBn: 'ইনভেন্টরি', requiredPerm: 'inventory' },
    { id: 'categories', icon: Tags, labelEn: 'Categories', labelBn: 'ক্যাটাগরি', requiredPerm: 'inventory' },
    { id: 'customers', icon: Users, labelEn: 'Customers', labelBn: 'গ্রাহক', requiredPerm: 'customers' },
    { id: 'reports', icon: FileText, labelEn: 'Reports', labelBn: 'রিপোর্ট', requiredPerm: 'reports' },
    { id: 'users', icon: ShieldAlert, labelEn: 'Users & Roles', labelBn: 'ইউজার', requiredPerm: 'users' },
    { id: 'settings', icon: Settings, labelEn: 'Settings', labelBn: 'সেটিংস', requiredPerm: 'settings' },
    { id: 'gas', icon: Code, labelEn: 'GAS Setup', labelBn: 'গ্যাস কোড', requiredPerm: 'dashboard' }, // Anyone with dashboard perm can see this for demo
  ] as const;

  // Filter tabs by permission and role
  const allowedTabs = allTabs.filter(tab => {
    if (currentUser.role === 'admin') return true; // Admin has access to all tabs
    return currentUser.permissions[tab.requiredPerm as keyof AppUser['permissions']];
  });

  return (
    <div className="h-screen bg-slate-50 flex text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-[80px] md:w-[220px] bg-[#1E293B] text-[#F1F5F9] h-full flex flex-col shrink-0 border-r border-slate-700">
        <div className="p-4 md:p-6 border-b border-slate-700 mb-4 flex flex-col gap-1 items-center md:items-start text-center md:text-left shrink-0 justify-center overflow-hidden w-full">
          <h1 className="text-lg font-bold leading-tight text-white hidden md:block whitespace-nowrap overflow-hidden text-ellipsis w-full" title={settings.systemName}>{settings.systemName}</h1>
          <h1 className="text-lg font-bold leading-tight text-white md:hidden" title={settings.systemName}>{settings.systemName.substring(0, 4)}</h1>
          <p className="text-[10px] text-slate-400 hidden md:block whitespace-nowrap overflow-hidden text-ellipsis w-full" title={settings.systemSubtitle}>{settings.systemSubtitle}</p>
        </div>
        
        <nav className="flex-1 px-3 flex flex-col gap-2 overflow-y-auto">
          {allowedTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                title={lang === 'en' ? tab.labelEn : tab.labelBn}
                className={`flex items-center md:space-x-3 p-3 rounded-lg transition-colors whitespace-nowrap justify-center md:justify-start ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Icon className={`${isActive ? 'text-white' : 'text-slate-400'} w-5 h-5 shrink-0`} />
                <span className="text-sm font-medium hidden md:block">{lang === 'en' ? tab.labelEn : tab.labelBn}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 w-full">
          <div className="flex items-center bg-slate-100 rounded-lg px-4 py-2 w-full max-w-md hidden md:flex">
            <Search className="text-slate-400 w-4 h-4 mr-2 shrink-0" />
            <input type="text" placeholder={lang === 'en' ? "Search products or sales..." : "খুঁজুন..."} className="bg-transparent border-none focus:outline-none text-sm w-full" />
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <button onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
              <Languages className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">{lang === 'en' ? 'English' : 'বাংলা'}</span>
              <span className="sm:hidden">{lang === 'en' ? 'EN' : 'BN'}</span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{currentUser.role}</p>
                </div>
                <div className="w-9 h-9 bg-blue-100 text-blue-700 font-bold rounded-full border border-blue-200 flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E2E8F0] overflow-hidden z-30">
                    <button 
                      onClick={() => { setActiveTab('profile'); setIsDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm font-medium border-b border-slate-100 transition-colors"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      {lang === 'en' ? 'My Profile' : 'আমার প্রোফাইল'}
                    </button>
                    <button 
                      onClick={() => { handleLogout(); setIsDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 text-sm font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {lang === 'en' ? 'Sign Out' : 'লগআউট'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full overflow-y-auto">
          {activeTab === 'pos' && <POS products={products} customers={customers} onCompleteSale={handleSaleComplete} lang={lang} />}
          {activeTab === 'dashboard' && <Dashboard products={products} sales={sales} lang={lang} />}
          {activeTab === 'inventory' && (
            <Inventory 
              categories={categories}
              products={products} 
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              lang={lang} 
            />
          )}
          {activeTab === 'categories' && (
            <Categories 
              categories={categories} 
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              lang={lang} 
            />
          )}
          {activeTab === 'customers' && (
            <Customers 
              customers={customers} 
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              lang={lang} 
            />
          )}
          {activeTab === 'reports' && <Reports sales={sales} products={products} lang={lang} />}
          {activeTab === 'users' && (
            <UserManagement 
              users={users} 
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              lang={lang} 
            />
          )}
          {activeTab === 'settings' && (
            <AppSettings
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              lang={lang}
            />
          )}
          {activeTab === 'profile' && <UserProfile user={currentUser} onUpdateUser={handleUpdateProfile} lang={lang} />}
          {activeTab === 'gas' && <GASExport settings={settings} />}
        </div>
      </main>
    </div>
  );
}
