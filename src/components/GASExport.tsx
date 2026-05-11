import React, { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';
import { SystemSettings } from '../types';

interface GASExportProps {
  settings: SystemSettings;
}

import htmlTemplate from '../gas/app.html?raw';
import jsTemplate from '../gas/app.js?raw';

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
              <p className="font-semibold mb-1">Full Vanilla JS Export</p>
              <p>The code exported below will generate a full single-page application (SPA) optimized for Google Apps Script, including the Dashboard, POS, Inventory, and User permissions!</p>
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

const getHtmlCode = (settings: SystemSettings) => {
  let html = htmlTemplate;
  html = html.replace(/__SYSTEM_NAME__/g, () => settings.systemName);
  html = html.replace(/__SYSTEM_SUBTITLE__/g, () => settings.systemSubtitle);
  html = html.replace(/__JS_CONTENT__/g, () => jsTemplate);
  html = html.replace(/__CSS_CONTENT__/g, () => '');
  return html;
};
