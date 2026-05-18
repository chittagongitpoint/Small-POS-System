import React, { useState } from 'react';
import { Settings, Save, Globe, Type, Database, Link, Key, Server, Code, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { SystemSettings } from '../types';
import { ApiService } from '../services/apiService';

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
    bengali: 'Bangla (বাংলা)',
    mysqlSection: 'MySQL Database Configuration (External Hosting)',
    mysqlDesc: 'Enable this to store data in your external MySQL database (e.g., InfinityFree). You must upload the API Bridge script to your hosting.',
    mysqlEnabled: 'Enable MySQL Storage',
    apiUrl: 'API Bridge URL',
    dbHost: 'Database Host',
    dbName: 'Database Name',
    dbUser: 'Database User',
    dbPass: 'Database Password',
    downloadPhp: 'Download PHP API Bridge',
    testConn: 'Test Connection',
    testing: 'Testing...',
    connSuccess: 'Connection Successful!',
    connFail: 'Connection Failed',
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
    bengali: 'Bangla (বাংলা)',
    mysqlSection: 'মাইএসকিউএল ডাটাবেস কনফিগারেশন',
    mysqlDesc: 'আপনার এক্সটার্নাল মাইএসকিউএল ডাটাবেজে ডেটা সংরক্ষণ করতে এটি সক্রিয় করুন। আপনার হোস্টিংয়ে API Bridge স্ক্রিপ্টটি আপলোড করতে হবে।',
    mysqlEnabled: 'মাইএসকিউএল স্টোরেজ সক্রিয় করুন',
    apiUrl: 'API Bridge ইউআরএল',
    dbHost: 'ডাটাবেস হোস্ট',
    dbName: 'ডাটাবেস নাম',
    dbUser: 'ডাটাবেস ইউজার',
    dbPass: 'ডাটাবেস পাসওয়ার্ড',
    downloadPhp: 'PHP API Bridge ডাউনলোড করুন',
    testConn: 'কানেকশন টেস্ট করুন',
    testing: 'টেস্ট হচ্ছে...',
    connSuccess: 'কানেকশন সফল হয়েছে!',
    connFail: 'কানেকশন ব্যর্থ হয়েছে',
  }
};

export default function AppSettings({ settings, onUpdateSettings, lang }: AppSettingsProps) {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const t = strings[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const api = new ApiService(formData);
    const data = await api.getAllData();
    setIsTesting(false);
    
    if (data && !data.error) {
      setTestResult({ success: true, message: t.connSuccess });
    } else {
      setTestResult({ success: false, message: data?.message || t.connFail });
    }
  };

  const handleDownloadPhp = () => {
    const phpCode = `<?php
/**
 * POS System - PHP MySQL API Bridge
 * Upload this file to your hosting (e.g. InfinityFree)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Get credentials from POST (prioritized) or Headers
$host = !empty($_POST['dbHost']) ? $_POST['dbHost'] : ($_SERVER['HTTP_X_DB_HOST'] ?? 'localhost');
$dbname = !empty($_POST['dbName']) ? $_POST['dbName'] : ($_SERVER['HTTP_X_DB_NAME'] ?? 'my_database');
$user = !empty($_POST['dbUser']) ? $_POST['dbUser'] : ($_SERVER['HTTP_X_DB_USER'] ?? 'my_user');
$pass = !empty($_POST['dbPass']) ? $_POST['dbPass'] : ($_SERVER['HTTP_X_DB_PASS'] ?? '');

// Fallback for JSON body if still used
if (!$host || $host === 'localhost') {
    $input = json_decode(file_get_contents('php://input'), true);
    $host = !empty($input['dbHost']) ? $input['dbHost'] : $host;
    $dbname = !empty($input['dbName']) ? $input['dbName'] : $dbname;
    $user = !empty($input['dbUser']) ? $input['dbUser'] : $user;
    $pass = !empty($input['dbPass']) ? $input['dbPass'] : $pass;
}

if (!$host || !$dbname || !$user) {
    echo json_encode([
        'error' => true, 
        'message' => 'Missing database credentials. Please check your system settings and API URL.',
        'debug' => [
            'method' => $_SERVER['REQUEST_METHOD'],
            'has_post' => !empty($_POST),
            'has_input' => !!file_get_contents('php://input')
        ]
    ]);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo json_encode(['error' => true, 'message' => 'Database Connection failed: ' . $e->getMessage()]);
    exit;
}

// Create tables if they don't exist
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS products (id VARCHAR(100) PRIMARY KEY, name VARCHAR(255), category VARCHAR(100), price DECIMAL(10,2), stock INT, image LONGTEXT)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (id VARCHAR(100) PRIMARY KEY, name VARCHAR(255), icon VARCHAR(100))");
    $pdo->exec("CREATE TABLE IF NOT EXISTS customers (id VARCHAR(100) PRIMARY KEY, name VARCHAR(255), phone VARCHAR(100), email VARCHAR(255), address TEXT, totalPurchases DECIMAL(12,2))");
    $pdo->exec("CREATE TABLE IF NOT EXISTS sales (id VARCHAR(100) PRIMARY KEY, date VARCHAR(100), items LONGTEXT, total DECIMAL(12,2), customerId VARCHAR(100), customerName VARCHAR(255), customerPhone VARCHAR(100))");
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (id VARCHAR(100) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), phone VARCHAR(100), role VARCHAR(50), password VARCHAR(255), permissions LONGTEXT)");
} catch (PDOException $e) {
    echo json_encode(['error' => true, 'message' => 'Failed to build database tables: ' . $e->getMessage()]);
    exit;
}

// Simple router
$action = $_GET['action'] ?? '';
$input_data = !empty($_POST) ? $_POST : json_decode(file_get_contents('php://input'), true);

try {
    if ($action === 'get_data') {
        $data = [
            'products' => $pdo->query("SELECT * FROM products")->fetchAll(),
            'categories' => $pdo->query("SELECT * FROM categories")->fetchAll(),
            'customers' => $pdo->query("SELECT * FROM customers")->fetchAll(),
            'sales' => $pdo->query("SELECT * FROM sales")->fetchAll(),
            'users' => $pdo->query("SELECT * FROM users")->fetchAll()
        ];
        // Decode JSON fields if needed
        foreach($data['sales'] as &$sale) {
            if(isset($sale['items'])) $sale['items'] = json_decode($sale['items'], true);
        }
        foreach($data['users'] as &$u) {
            if(isset($u['permissions'])) $u['permissions'] = json_decode($u['permissions'], true);
        }
        echo json_encode($data);
    } else if ($action === 'sync') {
    if (isset($input_data['type'])) {
        $type = $input_data['type'];
        // Record might be a string (from form data) or object
        $record = is_string($input_data['data']) ? json_decode($input_data['data'], true) : $input_data['data'];
        
        if ($type === 'product') {
            $stmt = $pdo->prepare("REPLACE INTO products (id, name, category, price, stock, image) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$record['id'], $record['name'], $record['category'], $record['price'], $record['stock'], $record['image'] ?? null]);
        } else if ($type === 'sale') {
            $stmt = $pdo->prepare("REPLACE INTO sales (id, date, items, total, customerId, customerName, customerPhone) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$record['id'], $record['date'], json_encode($record['items']), $record['total'], $record['customerId'] ?? null, $record['customerName'] ?? null, $record['customerPhone'] ?? null]);
        } else if ($type === 'category') {
            $stmt = $pdo->prepare("REPLACE INTO categories (id, name, icon) VALUES (?, ?, ?)");
            $stmt->execute([$record['id'], $record['name'], $record['icon'] ?? null]);
        } else if ($type === 'customer') {
            $stmt = $pdo->prepare("REPLACE INTO customers (id, name, phone, email, address, totalPurchases) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$record['id'], $record['name'], $record['phone'], $record['email'] ?? null, $record['address'] ?? null, $record['totalPurchases']]);
        } else if ($type === 'user') {
            $stmt = $pdo->prepare("REPLACE INTO users (id, name, email, phone, role, password, permissions) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$record['id'], $record['name'], $record['email'], $record['phone'], $record['role'], $record['password'], json_encode($record['permissions'])]);
        }
    }
    echo json_encode(['success' => true]);
} else if ($action === 'delete') {
    $type = $input_data['type'];
    $id = $input_data['id'];
    $table = '';
    if ($type === 'product') $table = 'products';
    if ($type === 'category') $table = 'categories';
    if ($type === 'customer') $table = 'customers';
    if ($type === 'user') $table = 'users';
    
    if($table) {
        $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
}
} catch (Exception $e) {
    echo json_encode(['error' => true, 'message' => 'Query completely failed: ' . $e->getMessage()]);
}
?>`;
    const blob = new Blob([phpCode], { type: 'text/php' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pos_api.php';
    a.click();
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
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
          {showSuccess && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 border border-green-200">
              <span className="font-medium text-sm">{t.success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-blue-600" />
                General Settings
              </h3>
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

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4 lg:col-span-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-600" />
                {t.mysqlSection}
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-4">{t.mysqlDesc}</p>
              
              <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <input 
                  type="checkbox" 
                  id="mysql-enabled" 
                  checked={formData.mysql?.enabled} 
                  onChange={(e) => setFormData({ ...formData, mysql: { ...formData.mysql!, enabled: e.target.checked } })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="mysql-enabled" className="text-sm font-semibold text-blue-900">{t.mysqlEnabled}</label>
              </div>

              <div className="space-y-4 opacity-100 transition-opacity">
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    <Link className="w-3.5 h-3.5" />
                    {t.apiUrl}
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourdomain.com/pos_api.php"
                    value={formData.mysql?.apiUrl || ''}
                    onChange={(e) => setFormData({ ...formData, mysql: { ...formData.mysql!, apiUrl: e.target.value } })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    <Server className="w-3.5 h-3.5" />
                    {t.dbHost}
                  </label>
                  <input
                    type="text"
                    value={formData.mysql?.dbHost || ''}
                    onChange={(e) => setFormData({ ...formData, mysql: { ...formData.mysql!, dbHost: e.target.value } })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide block">
                      {t.dbName}
                    </label>
                    <input
                      type="text"
                      value={formData.mysql?.dbName || ''}
                      onChange={(e) => setFormData({ ...formData, mysql: { ...formData.mysql!, dbName: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide block">
                      {t.dbUser}
                    </label>
                    <input
                      type="text"
                      value={formData.mysql?.dbUser || ''}
                      onChange={(e) => setFormData({ ...formData, mysql: { ...formData.mysql!, dbUser: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    <Key className="w-3.5 h-3.5" />
                    {t.dbPass}
                  </label>
                  <input
                    type="password"
                    value={formData.mysql?.dbPass || ''}
                    onChange={(e) => setFormData({ ...formData, mysql: { ...formData.mysql!, dbPass: e.target.value } })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !formData.mysql?.apiUrl}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border shadow-sm ${
                      isTesting 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 active:scale-95'
                    }`}
                  >
                    {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {isTesting ? t.testing : t.testConn}
                  </button>

                  {testResult && (
                    <div className={`p-3 rounded-lg flex items-start gap-2 border text-[11px] font-medium animate-in fade-in slide-in-from-top-1 ${
                      testResult.success 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <div className="flex-1">
                        <p>{testResult.message}</p>
                        {!testResult.success && (
                          <div className="mt-1 opacity-80 leading-normal space-y-1">
                             <p><strong>Note for InfinityFree users:</strong> Free hosting blocks API requests from other domains. Your "test.php" works directly but fails here due to their security system.</p>
                             <p><strong>Solution:</strong> You need to host this POS system on your domain! You can download this project's code via the 'Export / Settings' menu in AI Studio. Read <code>SETUP_INSTRUCTIONS.md</code> inside the zip file for steps to build and upload it to your host.</p>
                             <p className="text-red-600 mt-2"><strong>If you see "HTTP Error: 500":</strong> The tables are likely missing. <strong>Download the PHP API Bridge again</strong> to get the newest version which creates tables automatically, and replace the uploaded file.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPhp}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all mt-2"
                >
                  <Code className="w-3.5 h-3.5" />
                  {t.downloadPhp}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Save className="w-4 h-4" />
            {t.save}
          </button>
        </form>
      </div>
    </div>
  );
}
