import React, { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';
import { SystemSettings } from '../types';

interface GASExportProps {
  settings: SystemSettings;
}

export default function GASExport({ settings }: GASExportProps) {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const scriptCode = getGasScriptCode(settings);
  const htmlDocCode = getHtmlCode(settings);

  const copyScript = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(htmlDocCode);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Code className="w-6 h-6 text-blue-600" />
            Google Apps Script Setup
          </h2>
          <p className="text-slate-600 mb-6">
            For your production environment, follow these steps to deploy this application to Google Apps Script. 
            This uses a vanilla HTML/JS approach for max compatibility within the Apps Script environment.
          </p>
          
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 flex gap-3 text-sm border border-blue-200">
            <Check className="w-5 h-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold mb-1">Lite Version Export</p>
              <p>The code exported below will generate a simplified, single-page POS and Inventory system optimized for Google Apps Script. It does not include the full Dashboard, Settings, or user permission management seen in this preview environment.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">1. Code.gs</h3>
          <p className="text-sm text-slate-600">Paste this code into the default <code>Code.gs</code> file in your script editor. This handles the doGet routing and API interactions with your Google Sheet.</p>
          <div className="relative group">
            <button onClick={copyScript} className="absolute right-4 top-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded transition opacity-0 group-hover:opacity-100 flex items-center gap-2 text-sm z-10">
              {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedScript ? 'Copied!' : 'Copy Code.gs'}
            </button>
            <pre className="bg-slate-900 text-slate-50 p-6 rounded-xl overflow-x-auto text-sm">
              <code>{scriptCode}</code>
            </pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">2. Index.html</h3>
          <p className="text-sm text-slate-600">Create a new HTML file named <code>Index.html</code> (exactly) and paste the following Vanilla JS/CSS/HTML code.</p>
          <div className="relative group">
            <button onClick={copyHtml} className="absolute right-4 top-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded transition opacity-0 group-hover:opacity-100 flex items-center gap-2 text-sm z-10">
              {copiedHtml ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedHtml ? 'Copied!' : 'Copy Index.html'}
            </button>
            <pre className="bg-slate-900 text-slate-50 p-6 rounded-xl overflow-x-auto text-sm">
              <code>{htmlDocCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

const getGasScriptCode = (settings: SystemSettings) => `const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your Sheet ID

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('${settings.systemName}')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Ensure columns match the sheets structure
function getAppData() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  const readSheet = (sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // Only headers or empty
    const headers = data[0];
    return data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });
  };

  return {
    products: readSheet('Products'),
    categories: readSheet('Categories'),
    customers: readSheet('Customers'),
    sales: readSheet('Sales'),
    users: readSheet('Users'),
    settings: readSheet('Settings')
  };
}

function saveProduct(product) {
  return saveRecord('Products', product, ['id', 'name', 'category', 'price', 'stock']);
}

function saveCategory(category) {
  return saveRecord('Categories', category, ['id', 'name']);
}

function saveCustomer(customer) {
  return saveRecord('Customers', customer, ['id', 'name', 'phone', 'totalPurchases']);
}

function saveUser(user) {
  return saveRecord('Users', user, ['id', 'name', 'email', 'phone', 'password', 'role', 'permissions']);
}

function saveSetting(setting) {
  return saveRecord('Settings', setting, ['systemName', 'systemSubtitle', 'phone', 'defaultLanguage']);
}

function saveRecord(sheetName, record, fields) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(fields); // Set headers if newly created
  }
  
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == record.id) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const rowData = fields.map(f => record[f]);
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  
  return { success: true };
}

function deleteRecord(sheetName, id) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'Sheet not found' };
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Record not found' };
}

function saveSale(saleData) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  // Save to sales sheet
  let salesSheet = ss.getSheetByName('Sales');
  if (!salesSheet) {
    salesSheet = ss.insertSheet('Sales');
    salesSheet.appendRow(['id', 'date', 'customerName', 'customerPhone', 'total', 'items']);
  }
  
  salesSheet.appendRow([
    saleData.id,
    saleData.date,
    saleData.customerName,
    saleData.customerPhone,
    saleData.total,
    JSON.stringify(saleData.items) // Store items array as JSON string
  ]);
  
  // Deduct stock from Products table
  const productSheet = ss.getSheetByName('Products');
  if (productSheet) {
    const pData = productSheet.getDataRange().getValues();
    const headers = pData[0];
    const idIdx = headers.indexOf('id');
    const stockIdx = headers.indexOf('stock');
    
    if (idIdx >= 0 && stockIdx >= 0) {
      saleData.items.forEach(item => {
        for (let r = 1; r < pData.length; r++) {
          if (pData[r][idIdx] == item.id) {
            let currentStock = pData[r][stockIdx];
            productSheet.getRange(r + 1, stockIdx + 1).setValue(Math.max(0, currentStock - item.quantity));
            break;
          }
        }
      });
    }
  }
  
  return { success: true };
}`;

const getHtmlCode = (settings: SystemSettings) => `<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <title>${settings.systemName} - ${settings.systemSubtitle}</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f1f5f9; margin: 0; }
      .header { background: #1e3a8a; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
      .container { padding: 2rem; }
      .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
      .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; border: 1px solid #e2e8f0; }
      h2 { margin-top: 0; color: #1e293b; font-size: 1.2rem; margin-bottom: 1rem; }
      .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }
      .product { border: 1px solid #e2e8f0; border-radius: 6px; padding: 1rem; cursor: pointer; transition: 0.2s; }
      .product:hover { border-color: #3b82f6; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
      .product-cat { font-size: 0.75rem; color: #2563eb; font-weight: bold; }
      .product-name { font-weight: 500; margin: 0.5rem 0; color: #334155; }
      .product-price { font-weight: bold; color: #0f172a; }
      .btn { background: #2563eb; color: white; border: none; padding: 0.75rem 1rem; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%; transition: background 0.2s; }
      .btn:hover { background: #1d4ed8; }
      select, input { width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box; }
      
      /* Cart Table */
      #cart-list { margin-bottom: 1rem; max-height: 400px; overflow-y: auto; }
      .cart-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; }
      .cart-item-name { font-weight: 500; color: #334155;}
      .loader { text-align: center; padding: 2rem; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1 style="margin: 0; font-size: 1.25rem;">${settings.systemName}</h1>
        <div style="font-size: 0.75rem; font-weight: normal; opacity: 0.8;">${settings.systemSubtitle} - ${settings.phone}</div>
      </div>
      <div id="status">Loading data...</div>
    </div>
    
    <div class="container">
      <div class="grid">
        <div class="card">
          <h2>Products</h2>
          <div id="products-container" class="product-grid">
            <div class="loader">Fetching products from Google Sheets...</div>
          </div>
        </div>
        
        <div class="card" style="display:flex; flex-direction:column;">
          <h2>Current Sale</h2>
          <div id="cart-list"></div>
          
          <div style="margin-top: auto; border-top: 1px solid #e2e8f0; padding-top: 1rem;">
            <input type="text" id="cust-name" placeholder="Customer Name">
            <input type="tel" id="cust-phone" placeholder="Phone Number">
            <div style="display:flex; justify-content:space-between; margin-bottom: 1rem; font-size: 1.25rem; font-weight: bold;">
              <span>Total:</span>
              <span id="cart-total">৳0</span>
            </div>
            <button class="btn" onclick="checkout()">Complete Sale</button>
          </div>
        </div>
      </div>
    </div>

    <script>
      let appData = { products: [], categories: [], customers: [], sales: [], users: [] };
      let cart = [];

      window.onload = () => {
        google.script.run.withSuccessHandler((data) => {
          appData = data;
          document.getElementById('status').innerText = 'Connected';
          renderProducts();
        }).getAppData();
      };

      function renderProducts() {
        const c = document.getElementById('products-container');
        c.innerHTML = appData.products.length ? appData.products.map(p => \`
          <div class="product" onclick="addToCart('\${p.id}')">
            <div class="product-cat">\${p.category}</div>
            <div class="product-name">\${p.name}</div>
            <div class="product-price">৳\${p.price}</div>
            <div style="font-size: 0.75rem; color: #64748b; margin-top:0.25rem;">Stock: \${p.stock}</div>
          </div>
        \`).join('') : '<div style="grid-column: 1/-1; text-align: center; color: #64748b;">No products found.</div>';
      }

      function addToCart(id) {
        const prod = appData.products.find(p => p.id === id);
        if(!prod || prod.stock <= 0) return alert('Out of stock');
        
        const exist = cart.find(i => i.id === id);
        if(exist) {
          if(exist.quantity >= prod.stock) return alert('Cannot exceed stock');
          exist.quantity++;
        } else {
          cart.push({...prod, quantity: 1});
        }
        renderCart();
      }

      function renderCart() {
        const c = document.getElementById('cart-list');
        let total = 0;
        c.innerHTML = cart.map(item => {
          total += (item.price * item.quantity);
          return \`
            <div class="cart-item">
              <div>
                <div class="cart-item-name">\${item.name}</div>
                <div style="font-size:0.8rem; color:#64748b;">\${item.quantity} x ৳\${item.price}</div>
              </div>
              <div style="font-weight:bold;">৳\${item.price * item.quantity}</div>
            </div>
          \`;
        }).join('');
        document.getElementById('cart-total').innerText = '৳' + total;
      }

      function checkout() {
        if(cart.length === 0) return alert('Cart is empty');
        
        document.getElementById('status').innerText = 'Processing Sale...';
        
        let total = 0;
        cart.forEach(i => total += i.price * i.quantity);
        
        const payload = {
          id: 'S-' + new Date().getTime(),
          date: new Date().toISOString(),
          customerName: document.getElementById('cust-name').value,
          customerPhone: document.getElementById('cust-phone').value,
          items: cart,
          total: total
        };

        google.script.run.withSuccessHandler((res) => {
          if(res.success) {
            alert('Sale Completed Successfully!');
            cart = [];
            document.getElementById('cust-name').value = '';
            document.getElementById('cust-phone').value = '';
            renderCart();
            document.getElementById('status').innerText = 'Updating stock...';
            google.script.run.withSuccessHandler((data) => {
              appData = data;
              document.getElementById('status').innerText = 'Connected';
              renderProducts();
            }).getAppData();
          } else {
            alert('Error recording sale');
            document.getElementById('status').innerText = 'Error';
          }
        }).saveSale(payload);
      }
    </script>
  </body>
</html>`;
