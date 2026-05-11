/** Default Data Config */
let appData = {
  products: [],
  categories: [],
  customers: [],
  sales: [],
  users: [],
  settings: []
};

let currentUser = null;
let currentView = null;
let cart = [];

/** Views and Permissions */
const views = [
  { id: 'dashboard', icon: 'layout-dashboard', text: 'Dashboard', perm: 'dashboard' },
  { id: 'pos', icon: 'shopping-cart', text: 'Sales Point', perm: 'pos' },
  { id: 'inventory', icon: 'package-search', text: 'Inventory', perm: 'inventory' },
  { id: 'categories', icon: 'tags', text: 'Categories', perm: 'inventory' },
  { id: 'customers', icon: 'users', text: 'Customers', perm: 'customers' },
  { id: 'users', icon: 'shield', text: 'Users', perm: 'users' },
  { id: 'settings', icon: 'settings', text: 'Settings', perm: 'settings' }
];

window.onload = () => {
  if (typeof google !== 'undefined' && google.script) {
    google.script.run.withSuccessHandler(initApp).getAppData();
  } else {
    // Mock for local dev
    initApp({
      users: [{ id: '1', email: 'admin@khaja.com', password: 'password123', name: 'Admin', role: 'admin', permissions: '{}' }],
      settings: [{ id: '1', systemName: 'Khaja Auto', systemSubtitle: 'POS', phone: '018XXXXXXXX', defaultLanguage: 'en' }]
    });
  }
};

function initApp(data) {
  appData = { ...appData, ...data };
  document.getElementById('loading-overlay').classList.add('hidden');
  
  if (localStorage.getItem('gas_user_id')) {
    const u = appData.users.find(u => u.id === localStorage.getItem('gas_user_id'));
    if (u) {
      handleLoginSuccess(u);
      return;
    }
  }
  showLogin();
}

/** Login Logic */
function showLogin() {
  document.getElementById('app-container').classList.add('hidden');
  document.getElementById('login-container').classList.remove('hidden');
}

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const eVal = document.getElementById('login-email').value;
  const pVal = document.getElementById('login-password').value;
  const u = appData.users.find(u => u.email === eVal && u.password === pVal);
  if (u) {
    localStorage.setItem('gas_user_id', u.id);
    handleLoginSuccess(u);
  } else {
    const err = document.getElementById('login-error');
    err.textContent = 'Invalid email or password';
    err.classList.remove('hidden');
  }
});

function handleLoginSuccess(u) {
  currentUser = u;
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('app-container').classList.remove('hidden');
  
  document.getElementById('user-name').textContent = u.name;
  document.getElementById('user-role').textContent = u.role;
  document.getElementById('user-avatar').textContent = u.name.charAt(0).toUpperCase();

  renderSidebar();
  
  // Navigate to first available view
  if (currentUser.role === 'admin') {
    navTo('dashboard');
  } else {
    let perms = {};
    try { perms = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions; } catch(e){}
    const firstPerm = views.find(v => perms[v.perm]);
    navTo(firstPerm ? firstPerm.id : 'pos');
  }
}

document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('gas_user_id');
  currentUser = null;
  showLogin();
});

function hasPerm(perm) {
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  let p = {};
  if(typeof currentUser.permissions === 'string') {
    try { p = JSON.parse(currentUser.permissions); } catch(e){}
  } else {
    p = currentUser.permissions || {};
  }
  return p[perm] === true || p[perm] === 'TRUE';
}

function renderSidebar() {
  const container = document.getElementById('nav-links');
  container.innerHTML = '';
  views.forEach(v => {
    if (hasPerm(v.perm)) {
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition';
      a.innerHTML = `<i data-lucide="${v.icon}" class="w-5 h-5"></i> ${v.text}`;
      a.dataset.id = v.id;
      a.onclick = (e) => { e.preventDefault(); navTo(v.id); };
      container.appendChild(a);
    }
  });
  lucide.createIcons();
}

/** Navigation logic */
function navTo(viewId) {
  currentView = viewId;
  const viewObj = views.find(v => v.id === viewId);
  document.getElementById('current-view-title').textContent = viewObj ? viewObj.text : viewId;
  
  // Highlight sidebar
  document.querySelectorAll('.nav-link').forEach(el => {
    if (el.dataset.id === viewId) {
      el.classList.add('bg-blue-50', 'text-blue-700');
      el.classList.remove('text-slate-600');
    } else {
      el.classList.remove('bg-blue-50', 'text-blue-700');
      el.classList.add('text-slate-600');
    }
  });

  // Hide all sections
  document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));

  // Logic per view
  if (viewId === 'dashboard') {
    document.getElementById('view-dashboard').classList.remove('hidden');
    renderDashboard();
  } else if (viewId === 'pos') {
    document.getElementById('view-pos').classList.remove('hidden');
    renderPOS();
  } else {
    document.getElementById('view-table').classList.remove('hidden');
    renderTableList();
  }
}

/** Render Table Lists (Inventory, Categories, etc) */
function renderTableList() {
  const tHead = document.getElementById('table-head');
  const tBody = document.getElementById('table-body');
  tHead.innerHTML = '';
  tBody.innerHTML = '';
  
  let config = { cols: [], data: [] };
  
  if (currentView === 'inventory') {
    config.data = appData.products || [];
    config.cols = [
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'price', label: 'Price' },
      { key: 'stock', label: 'Stock' }
    ];
  } else if (currentView === 'categories') {
    config.data = appData.categories || [];
    config.cols = [{ key: 'name', label: 'Name' }];
  } else if (currentView === 'customers') {
    config.data = appData.customers || [];
    config.cols = [{ key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' }, { key: 'totalPurchases', label: 'Purchases' }];
  } else if (currentView === 'users') {
    config.data = appData.users || [];
    config.cols = [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }];
  } else if (currentView === 'settings') {
    config.data = appData.settings || [];
    config.cols = [{ key: 'systemName', label: 'System Name' }, { key: 'phone', label: 'Phone' }];
  }

  // Head
  const hTr = document.createElement('tr');
  config.cols.forEach(c => {
    const th = document.createElement('th');
    th.className = 'px-4 py-3';
    th.textContent = c.label;
    hTr.appendChild(th);
  });
  tHead.appendChild(hTr);
  
  // Body
  config.data.forEach(row => {
    const tr = document.createElement('tr');
    config.cols.forEach(c => {
      const td = document.createElement('td');
      td.className = 'px-4 py-3';
      td.textContent = row[c.key] || '';
      tr.appendChild(td);
    });
    tBody.appendChild(tr);
  });
}

/** Dashboard logic */
function renderDashboard() {
  const stats = document.getElementById('dashboard-stats');
  const sales = (appData.sales || []);
  let totalRev = 0;
  sales.forEach(s => totalRev += Number(s.total || 0));
  
  stats.innerHTML = `
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div class="text-sm text-slate-500 mb-1">Total Revenue</div>
      <div class="text-2xl font-bold text-slate-800">৳${totalRev.toLocaleString()}</div>
    </div>
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div class="text-sm text-slate-500 mb-1">Total Sales</div>
      <div class="text-2xl font-bold text-slate-800">${sales.length}</div>
    </div>
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div class="text-sm text-slate-500 mb-1">Total Products</div>
      <div class="text-2xl font-bold text-slate-800">${(appData.products || []).length}</div>
    </div>
  `;
  
  const tb = document.getElementById('dash-sales-tb');
  tb.innerHTML = '';
  sales.slice(-10).reverse().forEach(s => {
    tb.innerHTML += `
      <tr>
        <td class="px-4 py-3 font-medium text-blue-600">${s.id || ''}</td>
        <td class="px-4 py-3">${new Date(s.date).toLocaleDateString()}</td>
        <td class="px-4 py-3">${s.customerName || 'Walk-in'}</td>
        <td class="px-4 py-3 font-bold">৳${s.total}</td>
      </tr>
    `;
  });
}

/** POS Logic */
function renderPOS() {
  const pc = document.getElementById('pos-products');
  pc.innerHTML = '';
  const prods = (appData.products || []);
  if(prods.length === 0) {
    pc.innerHTML = '<div class="col-span-full py-10 text-center text-slate-500">No products found</div>';
    return;
  }
  prods.forEach(p => {
    const div = document.createElement('div');
    div.className = 'border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-blue-500 hover:shadow-md transition bg-white flex flex-col';
    div.innerHTML = `
      <div class="text-xs font-bold text-blue-600 mb-1 truncate">${p.category || 'Uncategorized'}</div>
      <div class="font-medium text-slate-800 mb-1 leading-tight flex-1">${p.name}</div>
      <div class="flex justify-between items-end mt-2">
        <div class="font-bold text-lg text-slate-900">৳${p.price}</div>
        <div class="text-xs ${p.stock > 0 ? 'text-slate-500' : 'text-red-500 font-bold'}">Stock: ${p.stock}</div>
      </div>
    `;
    div.onclick = () => addCart(p);
    pc.appendChild(div);
  });
  renderCart();
}

function addCart(product) {
  if (product.stock <= 0) return alert('Out of stock');
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    if (existing.quantity >= product.stock) return alert('Cannot exceed stock');
    existing.quantity++;
  } else {
    cart.push({...product, quantity: 1});
  }
  renderCart();
}

function updateCartQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if(!item) return;
  const newQty = item.quantity + delta;
  if(newQty <= 0) {
    cart = cart.filter(i => i.id !== id);
  } else {
    if(newQty > item.stock) return alert('Cannot exceed stock');
    item.quantity = newQty;
  }
  renderCart();
}

function renderCart() {
  const c = document.getElementById('pos-cart');
  c.innerHTML = '';
  let total = 0;
  if (cart.length === 0) {
    c.innerHTML = '<div class="text-center text-slate-500 py-4 text-sm">Cart is empty</div>';
  } else {
    cart.forEach(item => {
      total += (item.price * item.quantity);
      c.innerHTML += `
        <div class="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div class="flex-1 min-w-0 pr-2">
            <div class="text-sm font-medium text-slate-800 truncate">${item.name}</div>
            <div class="text-xs text-slate-500">৳${item.price}</div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="updateCartQty('${item.id}', -1)" class="w-6 h-6 rounded bg-slate-200 flex items-center justify-center hover:bg-slate-300">-</button>
            <span class="text-sm font-medium w-4 text-center">${item.quantity}</span>
            <button onclick="updateCartQty('${item.id}', 1)" class="w-6 h-6 rounded bg-slate-200 flex items-center justify-center hover:bg-slate-300">+</button>
            <div class="w-16 text-right font-bold text-sm">৳${item.price * item.quantity}</div>
          </div>
        </div>
      `;
    });
  }
  document.getElementById('pos-total').textContent = '৳' + total;
}

document.getElementById('btn-checkout').addEventListener('click', () => {
  if (cart.length === 0) return alert('Cart is empty');
  
  const totalStr = document.getElementById('pos-total').textContent.replace('৳', '');
  document.getElementById('loading-text').textContent = 'Processing Sale...';
  document.getElementById('loading-overlay').classList.remove('hidden');

  const payload = {
    id: 'S-' + Date.now(),
    date: new Date().toISOString(),
    customerName: document.getElementById('pos-cust-name').value,
    customerPhone: document.getElementById('pos-cust-phone').value,
    items: cart,
    total: parseFloat(totalStr)
  };

  if(typeof google !== 'undefined' && google.script) {
    google.script.run.withSuccessHandler((res) => {
      if(res.success) {
        cart = [];
        document.getElementById('pos-cust-name').value = '';
        document.getElementById('pos-cust-phone').value = '';
        document.getElementById('loading-text').textContent = 'Fetching updated data...';
        google.script.run.withSuccessHandler((data) => {
          appData = data;
          document.getElementById('loading-overlay').classList.add('hidden');
          renderPOS();
        }).getAppData();
      } else {
        alert('Error recording sale');
        document.getElementById('loading-overlay').classList.add('hidden');
      }
    }).saveSale(payload);
  } else {
    // local testing
    setTimeout(()=> {
      cart = [];
      document.getElementById('loading-overlay').classList.add('hidden');
      renderPOS();
    }, 1000);
  }
});
