const $ = id => document.getElementById(id);

// Quotation & Bill fields
const fields = [
  'docType', 'docTemplate', 'billingMode', 'quoteNo', 'companyName',
  'logoModeSelect', 'aiLogoStyle', 'aiLogoColor', 'aiLogoSeed', 'aiLogoSymbol', 'aiCustomSvgData',
  'companyLogoText', 'companyLogoImgUrl', 'companyPhone', 'companyEmail', 'companyGst', 'companyAddress',
  'clientName', 'clientContact', 'clientPhone', 'quoteDate', 'dueDate', 'paymentStatusSelect', 'paymentModeSelect', 'poNumber',
  'projectName', 'siteLocation',
  'bankName', 'bankAccount', 'bankIfsc', 'bankBranch', 'bankUpi',
  'gstModeSelect', 'gstRate', 'discount', 'validity', 'paymentTerms', 'notes'
];

const TEMPLATES = {
  modern: { name: '🌟 Modern Executive', subtitle: 'Sleek Slate & Amber', color: '#f59e0b' },
  classic: { name: '🏛️ Classic Corporate', subtitle: 'Formal Tax Grid', color: '#0f172a' },
  industrial: { name: '🧱 Industrial Amber', subtitle: 'SBFB Construction', color: '#f59e0b' },
  sapphire: { name: '💎 Sapphire Clean', subtitle: 'Minimalist Blue', color: '#2563eb' },
  emerald: { name: '🌿 Emerald Green', subtitle: 'Eco Infrastructure', color: '#059669' },
  monochrome: { name: '🖤 Monochrome Sleek', subtitle: 'High-Contrast B&W', color: '#000000' }
};

const DOC_TYPES = {
  quotation: {
    name: 'Quotation',
    heading: 'Create & manage quotations',
    eyebrow: 'QUOTATION STUDIO & CLOUD DATABASE',
    tag: 'QUOTATION',
    dateLabel: 'Quotation date',
    noLabel: 'Quotation No.',
    noPrefix: 'QTN',
    clientHeader: 'BILL TO / CLIENT',
    clientSub: 'Date, quotation number, client contact, and project site location.',
    thirdBoxTag: 'VALIDITY',
    defaultTerms: '30% advance with work order. Balance as per measured progress / agreed milestones.',
    defaultNotes: 'Rates are quoted based on the specifications above. Final billing will be based on actual site measurements.',
    footer: 'Thank you for your valued business.'
  },
  invoice: {
    name: 'Tax Invoice',
    heading: 'Create & manage Tax Invoices',
    eyebrow: 'TAX INVOICE & BILLING STUDIO',
    tag: 'TAX INVOICE',
    dateLabel: 'Invoice date',
    noLabel: 'Invoice No.',
    noPrefix: 'INV',
    clientHeader: 'BILL TO / BUYER',
    clientSub: 'Invoice date, invoice number, payment due, client contact, and delivery location.',
    thirdBoxTag: 'PAYMENT DUE',
    defaultTerms: 'Payment is due within 7 days of invoice date. Please transfer to the bank account / UPI ID mentioned below.',
    defaultNotes: 'Goods / services delivered as per agreed specifications. All disputes subject to local jurisdiction.',
    footer: 'Thank you for your business! Please remit payment at your earliest convenience.'
  },
  cash_bill: {
    name: 'Cash Bill',
    heading: 'Create & manage Cash Bills',
    eyebrow: 'CASH BILL & RETAIL RECEIPT',
    tag: 'CASH BILL / RECEIPT',
    dateLabel: 'Bill date',
    noLabel: 'Bill No.',
    noPrefix: 'BILL',
    clientHeader: 'CUSTOMER / BUYER',
    clientSub: 'Bill date, bill number, payment mode, customer contact, and delivery site.',
    thirdBoxTag: 'PAYMENT STATUS',
    defaultTerms: 'Payment received in full. Verified by cashier / authorized signatory.',
    defaultNotes: 'Thank you for choosing us! Goods once sold and inspected are not returnable.',
    footer: 'Thank you for your purchase! Visit again.'
  }
};

const stateKey = 'sbfbQuotationState';
const companyDefaultsKey = 'sbfbCompanyDefaults';
const localQuotesKey = 'sbfbLocalCloudQuotes';
const supabaseConfigKey = 'sbfbSupabaseConfig';
const catalogStorageKey = 'sbfbItemCatalog';
const openAiKeyStorage = 'sbfbOpenAiKey';

const defaultCatalog = [
  { id: 'cat-1', desc: 'Building construction & structural civil work', rate: 1850 },
  { id: 'cat-2', desc: 'Fly ash brick masonry with cement mortar', rate: 450 },
  { id: 'cat-3', desc: 'Internal & external wall plastering', rate: 220 },
  { id: 'cat-4', desc: 'Bitumen road surfacing & laying', rate: 380 },
  { id: 'cat-5', desc: 'Earthwork excavation & site grading', rate: 140 },
  { id: 'cat-6', desc: 'Concrete flooring & PCC work', rate: 320 }
];

let items = [];
let itemCatalog = [];
let currentQuoteId = null;
let supabaseClient = null;
let savedQuotesCache = [];

/* --- Utilities --- */
function today() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  }
  return dateStr;
}

function money(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(Number(n) || 0);
}

function esc(s) {
  return String(s ?? '').replace(/[&<>\"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\\': '&#92;' }[m]));
}

function generateMonogram(name, customLetters) {
  const custom = (customLetters || '').trim();
  if (custom && custom.toUpperCase() !== 'TNP' && custom.toUpperCase() !== 'SBFA') {
    return custom.toUpperCase();
  }
  const cleanName = (name || 'Sri Balamurugan Fly Ash Bricks & Roadwork').trim();
  const lower = cleanName.toLowerCase();
  if (lower.includes('balamurugan') && (lower.includes('brick') || lower.includes('fly ash'))) {
    return 'SBFB';
  }

  const clean = cleanName.replace(/[^a-zA-Z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 4).toUpperCase();
  }

  const stopWords = new Set(['and', '&', 'of', 'the', 'in', 'co', 'pvt', 'ltd', 'inc', 'a', 'an', 'for', 'to', 'ash']);
  const meaningfulWords = words.filter(w => !stopWords.has(w.toLowerCase()));
  const targetWords = meaningfulWords.length ? meaningfulWords : words;

  const letters = targetWords.map(w => w[0]).join('').toUpperCase();
  return letters.slice(0, 4) || 'SBFB';
}

function showToast(message, type = 'success') {
  const toast = $('toastNotification');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type}`;
  setTimeout(() => {
    toast.className = 'toast hidden';
  }, 3500);
}

/* --- Item Library (Catalog) Storage & Sync --- */
async function loadItemCatalog() {
  try {
    const local = JSON.parse(localStorage.getItem(catalogStorageKey) || 'null');
    if (Array.isArray(local) && local.length) {
      itemCatalog = local;
    } else {
      itemCatalog = [...defaultCatalog];
      localStorage.setItem(catalogStorageKey, JSON.stringify(itemCatalog));
    }
  } catch {
    itemCatalog = [...defaultCatalog];
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('item_catalog').select('*').order('description');
      if (!error && Array.isArray(data) && data.length) {
        data.forEach(cloudItem => {
          const idx = itemCatalog.findIndex(x => x.desc.toLowerCase() === (cloudItem.description || '').toLowerCase());
          if (idx >= 0) {
            itemCatalog[idx].rate = Number(cloudItem.rate) || itemCatalog[idx].rate;
            itemCatalog[idx].id = cloudItem.id || itemCatalog[idx].id;
          } else {
            itemCatalog.push({
              id: cloudItem.id || crypto.randomUUID(),
              desc: cloudItem.description,
              rate: Number(cloudItem.rate) || 0
            });
          }
        });
        localStorage.setItem(catalogStorageKey, JSON.stringify(itemCatalog));
      }
    } catch (err) {
      console.warn('Catalog fetch error:', err);
    }
  }

  renderCatalogPills();
  renderCatalogDatalist();
  renderCatalogManager();
}

async function saveItemToCatalog(desc, rate, notify = true) {
  const trimmedDesc = (desc || '').trim();
  if (!trimmedDesc) return;
  const rateNum = Number(rate) || 0;

  const existingIdx = itemCatalog.findIndex(x => x.desc.toLowerCase() === trimmedDesc.toLowerCase());
  let itemId = crypto.randomUUID();
  if (existingIdx >= 0) {
    itemCatalog[existingIdx].rate = rateNum;
    itemId = itemCatalog[existingIdx].id;
  } else {
    itemCatalog.unshift({ id: itemId, desc: trimmedDesc, rate: rateNum });
  }

  localStorage.setItem(catalogStorageKey, JSON.stringify(itemCatalog));

  if (supabaseClient) {
    try {
      await supabaseClient.from('item_catalog').upsert({
        description: trimmedDesc,
        rate: rateNum,
        updated_at: new Date().toISOString()
      }, { onConflict: 'description' });
    } catch (err) {
      console.warn('Supabase catalog save error:', err);
    }
  }

  renderCatalogPills();
  renderCatalogDatalist();
  renderCatalogManager();

  if (notify) {
    showToast(`📚 Saved "${trimmedDesc}" (₹${rateNum}/sq.m) to Item Library!`);
  }
}

async function deleteItemFromCatalog(id, desc) {
  if (!confirm(`Delete "${desc}" from your reusable Item Library?`)) return;

  itemCatalog = itemCatalog.filter(x => x.id !== id && x.desc !== desc);
  localStorage.setItem(catalogStorageKey, JSON.stringify(itemCatalog));

  if (supabaseClient) {
    try {
      await supabaseClient.from('item_catalog').delete().or(`id.eq.${id},description.eq.${desc}`);
    } catch (err) {
      console.warn('Supabase catalog delete error:', err);
    }
  }

  renderCatalogPills();
  renderCatalogDatalist();
  renderCatalogManager();
  showToast(`🗑️ Removed "${desc}" from Item Library.`);
}

function renderCatalogPills() {
  const container = $('catalogPills');
  if (!container) return;
  if (!itemCatalog.length) {
    container.innerHTML = '<span style="font-size:11px;color:#94a3b8;">No saved items in library yet.</span>';
    return;
  }

  container.innerHTML = itemCatalog.map(item => `
    <button type="button" class="catalog-pill" data-cat-desc="${esc(item.desc)}" data-cat-rate="${item.rate}">
      ➕ ${esc(item.desc)} <strong style="color:#b45309;">(₹${Number(item.rate).toLocaleString('en-IN')}/sq.m)</strong>
    </button>
  `).join('');

  container.querySelectorAll('[data-cat-desc]').forEach(btn => {
    btn.addEventListener('click', () => {
      addItem(btn.dataset.catDesc, Number(btn.dataset.catRate) || 0);
      showToast(`➕ Added "${btn.dataset.catDesc}" to quotation!`);
    });
  });
}

function renderCatalogDatalist() {
  const dl = $('catalogDatalist');
  if (!dl) return;
  dl.innerHTML = itemCatalog.map(item => `<option value="${esc(item.desc)}">₹${Number(item.rate).toLocaleString('en-IN')} / sq.m</option>`).join('');
}

function renderCatalogManager() {
  const countEl = $('catalogCount');
  const count2El = $('catalogCount2');
  if (countEl) countEl.textContent = itemCatalog.length;
  if (count2El) count2El.textContent = itemCatalog.length;

  const listEl = $('catalogManagerList');
  if (!listEl) return;

  if (!itemCatalog.length) {
    listEl.innerHTML = '<div class="empty-state">No saved items in library. Add your frequently quoted civil and construction items above.</div>';
    return;
  }

  listEl.innerHTML = itemCatalog.map(item => `
    <div class="quote-card">
      <div class="quote-card-main">
        <strong>${esc(item.desc)}</strong>
        <p>📐 Quoted Rate: <strong style="color:#b45309;">${money(item.rate)} / sq.m</strong></p>
      </div>
      <div class="quote-card-right">
        <button class="btn small primary" data-insert-id="${item.id}">➕ Add to Quote</button>
        <button class="btn small ghost-dark" data-cat-del-id="${item.id}" data-cat-del-desc="${esc(item.desc)}" title="Delete item">&times;</button>
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('[data-insert-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = itemCatalog.find(x => x.id === btn.dataset.insertId);
      if (item) {
        addItem(item.desc, item.rate);
        $('cloudModal').classList.add('hidden');
        showToast(`➕ Added "${item.desc}" to quotation!`);
      }
    });
  });

  listEl.querySelectorAll('[data-cat-del-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteItemFromCatalog(btn.dataset.catDelId, btn.dataset.catDelDesc);
    });
  });
}

function syncCurrentQuoteToCatalog() {
  let savedCount = 0;
  items.forEach(item => {
    if (item.desc && item.desc.trim()) {
      saveItemToCatalog(item.desc, item.rate, false);
      savedCount++;
    }
  });
  if (savedCount > 0) {
    showToast(`💾 Stored ${savedCount} item(s) to Library! Available for all future quotations.`);
  } else {
    showToast('Add some work items with descriptions first to store them.', 'error');
  }
}

/* --- Work Items Logic (Rate per Sq.M or Itemized Quantity x Rate) --- */
function addItem(desc = '', rate = 450, qty = 1, unit = 'sq.m') {
  const r = Number(rate) || 0;
  const q = Number(qty) || 1;
  items.push({
    id: crypto.randomUUID(),
    desc,
    qty: q,
    unit: unit || 'sq.m',
    rate: r,
    amount: q * r
  });
  renderItems();
  updatePreview();
}

function renderItems() {
  const tbody = $('itemsBody');
  if (!tbody) return;

  const mode = val('billingMode') || 'sqm_rate';
  const isQtyMode = mode === 'qty_rate';

  if (!items.length) {
    const cols = isQtyMode ? 7 : 4;
    tbody.innerHTML = `<tr><td colspan="${cols}" style="padding:24px;text-align:center;color:#94a3b8;font-size:12px">No items added yet. Click "+ Add item" or pick from Stored Items library below.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map((x, i) => {
    const qty = Number(x.qty) || 1;
    const rate = Number(x.rate) || 0;
    const amount = qty * rate;
    x.amount = amount;

    if (isQtyMode) {
      return `
        <tr>
          <td style="text-align:center;color:#64748b;font-weight:700;font-size:12px">${i + 1}</td>
          <td>
            <input class="item-desc" list="catalogDatalist" data-id="${x.id}" data-k="desc" value="${esc(x.desc)}" placeholder="e.g. Fly ash brick masonry">
          </td>
          <td>
            <input class="num" type="number" min="0" step="0.01" data-id="${x.id}" data-k="qty" value="${qty}" placeholder="1">
          </td>
          <td>
            <select data-id="${x.id}" data-k="unit" style="padding:6px 4px;font-size:11px;">
              <option value="sq.m" ${x.unit === 'sq.m' ? 'selected' : ''}>sq.m</option>
              <option value="sq.ft" ${x.unit === 'sq.ft' ? 'selected' : ''}>sq.ft</option>
              <option value="nos" ${x.unit === 'nos' ? 'selected' : ''}>nos (pcs)</option>
              <option value="tons" ${x.unit === 'tons' ? 'selected' : ''}>tons</option>
              <option value="trips" ${x.unit === 'trips' ? 'selected' : ''}>trips</option>
              <option value="brass" ${x.unit === 'brass' ? 'selected' : ''}>brass</option>
              <option value="bags" ${x.unit === 'bags' ? 'selected' : ''}>bags</option>
              <option value="days" ${x.unit === 'days' ? 'selected' : ''}>days</option>
              <option value="hrs" ${x.unit === 'hrs' ? 'selected' : ''}>hrs</option>
              <option value="lots" ${x.unit === 'lots' ? 'selected' : ''}>lots</option>
            </select>
          </td>
          <td>
            <input class="num" type="number" min="0" step="0.01" data-id="${x.id}" data-k="rate" value="${rate}" placeholder="Rate ₹">
          </td>
          <td style="text-align:right;font-weight:700;font-size:11.5px;color:#0f172a;padding:0 8px;white-space:nowrap;">
            ${money(amount)}
          </td>
          <td style="text-align:center;">
            <button class="remove" data-remove="${x.id}" title="Remove item">&times;</button>
          </td>
        </tr>
      `;
    } else {
      return `
        <tr>
          <td style="text-align:center;color:#64748b;font-weight:700;font-size:12px">${i + 1}</td>
          <td>
            <input class="item-desc" list="catalogDatalist" data-id="${x.id}" data-k="desc" value="${esc(x.desc)}" placeholder="e.g. Fly ash brick masonry with cement mortar">
          </td>
          <td>
            <input class="num" type="number" min="0" step="0.01" data-id="${x.id}" data-k="rate" value="${rate}" placeholder="Rate in ₹ / sq.m">
          </td>
          <td style="text-align:center;">
            <button class="remove" data-remove="${x.id}" title="Remove item">&times;</button>
          </td>
        </tr>
      `;
    }
  }).join('');

  // Attach input listeners
  tbody.querySelectorAll('[data-id][data-k]').forEach(el => {
    el.addEventListener('input', e => {
      const x = items.find(a => a.id === e.target.dataset.id);
      if (!x) return;

      const key = e.target.dataset.k;
      if (key === 'rate') {
        x.rate = Number(e.target.value) || 0;
        x.amount = (Number(x.qty) || 1) * x.rate;
        // Auto-update catalog rate if exists
        if (x.desc && x.desc.trim()) {
          saveItemToCatalog(x.desc, x.rate, false);
        }
      } else if (key === 'qty') {
        x.qty = Number(e.target.value) || 1;
        x.amount = x.qty * (Number(x.rate) || 0);
      } else if (key === 'unit') {
        x.unit = e.target.value;
      } else if (key === 'desc') {
        x.desc = e.target.value;
        // Check if entered description matches a catalog item to autofill rate
        const matched = itemCatalog.find(c => c.desc.toLowerCase() === x.desc.trim().toLowerCase());
        if (matched && (!x.rate || x.rate === 450 || x.rate === 0)) {
          x.rate = matched.rate;
          x.amount = (Number(x.qty) || 1) * matched.rate;
          const row = e.target.closest('tr');
          const rateInput = row ? row.querySelector('[data-k="rate"]') : null;
          if (rateInput) rateInput.value = matched.rate;
        }
      }
      updatePreview();
    });

    el.addEventListener('change', e => {
      const x = items.find(a => a.id === e.target.dataset.id);
      if (!x) return;
      if (x.desc && x.desc.trim()) {
        saveItemToCatalog(x.desc, x.rate, false);
      }
    });
  });

  tbody.querySelectorAll('[data-remove]').forEach(el => {
    el.addEventListener('click', () => {
      items = items.filter(x => x.id !== el.dataset.remove);
      renderItems();
      updatePreview();
    });
  });

  disableWheelOnNumbers();
}

function preventWheelScroll(e) {
  e.preventDefault();
}

function disableWheelOnNumbers() {
  document.querySelectorAll('input[type="number"], .num').forEach(el => {
    el.removeEventListener('wheel', preventWheelScroll);
    el.addEventListener('wheel', preventWheelScroll, { passive: false });
  });
}

function val(id) {
  return $(id) ? $(id).value : '';
}

function adjustLogoFontSize(el, text) {
  if (!el || !text) return;
  if (text.length >= 5) {
    el.style.fontSize = '10px';
  } else if (text.length === 4) {
    el.style.fontSize = '12px';
  } else if (text.length === 3) {
    el.style.fontSize = '14px';
  } else {
    el.style.fontSize = '15px';
  }
}

/* --- AI Logo Generation Engine --- */

const AI_PALETTES = {
  amber_slate: {
    name: 'Amber Gold & Slate',
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
    bg1: '#0f172a',
    bg2: '#1e293b',
    border: '#f59e0b',
    text: '#ffffff'
  },
  sapphire_silver: {
    name: 'Sapphire & Platinum',
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    accent: '#60a5fa',
    bg1: '#0a192f',
    bg2: '#172a46',
    border: '#60a5fa',
    text: '#ffffff'
  },
  emerald_carbon: {
    name: 'Emerald & Dark Carbon',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    bg1: '#052317',
    bg2: '#064e3b',
    border: '#10b981',
    text: '#ffffff'
  },
  crimson_bronze: {
    name: 'Crimson & Bronze',
    primary: '#ef4444',
    secondary: '#b91c1c',
    accent: '#f87171',
    bg1: '#260b0b',
    bg2: '#450a0a',
    border: '#ef4444',
    text: '#ffffff'
  },
  purple_platinum: {
    name: 'Royal Purple',
    primary: '#a855f7',
    secondary: '#7e22ce',
    accent: '#c084fc',
    bg1: '#19082d',
    bg2: '#3b0764',
    border: '#a855f7',
    text: '#ffffff'
  },
  charcoal_mono: {
    name: 'Charcoal Monochrome',
    primary: '#e2e8f0',
    secondary: '#94a3b8',
    accent: '#cbd5e1',
    bg1: '#090d16',
    bg2: '#1e293b',
    border: '#94a3b8',
    text: '#ffffff'
  }
};

const AI_STYLES = [
  { id: 'industrial', name: 'Industrial & Bricks', badge: 'Civil & Roadwork' },
  { id: 'hexagon', name: 'Hexagon Shield', badge: 'Modern Engineering' },
  { id: 'architectural', name: 'Blueprint & Structure', badge: 'Architectural' },
  { id: 'gold_crest', name: 'Luxury Gold Crest', badge: 'Seal & Quality' },
  { id: 'gradient_tech', name: 'Dynamic Gradient', badge: 'High-Tech' },
  { id: 'eco_infra', name: 'Eco Infrastructure', badge: 'Sustainable' },
  { id: 'minimal_badge', name: 'Minimalist Badge', badge: 'Swiss Clean' }
];

function detectIndustryKeywords(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('brick') || n.includes('fly ash') || n.includes('masonry')) return 'bricks';
  if (n.includes('road') || n.includes('highway') || n.includes('asphalt') || n.includes('bitumen') || n.includes('tar') || n.includes('pave')) return 'road';
  if (n.includes('civil') || n.includes('crane') || n.includes('builder') || n.includes('construct') || n.includes('infra')) return 'crane';
  if (n.includes('architect') || n.includes('plan') || n.includes('design') || n.includes('structure') || n.includes('steel') || n.includes('complex') || n.includes('tower')) return 'building';
  if (n.includes('eco') || n.includes('green') || n.includes('earth') || n.includes('organic') || n.includes('nature') || n.includes('bio')) return 'eco';
  if (n.includes('tech') || n.includes('engine') || n.includes('machine') || n.includes('gear') || n.includes('industry') || n.includes('works') || n.includes('factory')) return 'gear';
  if (n.includes('survey') || n.includes('measure') || n.includes('consult') || n.includes('draft') || n.includes('cad')) return 'compass';
  return 'bricks';
}

function getSymbolSvg(symbolKey, p) {
  switch (symbolKey) {
    case 'road':
      return `
        <g>
          <!-- Modern Highway Horizon -->
          <polygon points="50,16 76,64 24,64" fill="${p.secondary}" opacity="0.95"/>
          <polygon points="48,16 52,16 58,64 42,64" fill="${p.primary}"/>
          <line x1="50" y1="20" x2="50" y2="60" stroke="${p.accent}" stroke-width="2" stroke-dasharray="5,4"/>
          <circle cx="50" cy="14" r="3.5" fill="${p.accent}"/>
        </g>`;
    case 'crane':
      return `
        <g stroke="${p.accent}" stroke-width="2" stroke-linecap="round">
          <line x1="32" y1="64" x2="32" y2="16" stroke-width="3" stroke="${p.primary}"/>
          <line x1="22" y1="18" x2="78" y2="18" stroke-width="3" stroke="${p.accent}"/>
          <line x1="32" y1="18" x2="70" y2="38" stroke-width="1.5"/>
          <line x1="32" y1="36" x2="52" y2="18" stroke-width="1.5"/>
          <line x1="70" y1="18" x2="70" y2="32" stroke-width="1.5"/>
          <circle cx="70" cy="35" r="2.5" fill="${p.accent}"/>
        </g>`;
    case 'building':
      return `
        <g>
          <rect x="22" y="30" width="22" height="34" rx="2" fill="${p.secondary}" stroke="${p.primary}" stroke-width="1.5"/>
          <rect x="48" y="16" width="28" height="48" rx="2" fill="${p.primary}" stroke="${p.accent}" stroke-width="1.5"/>
          <line x1="56" y1="24" x2="68" y2="24" stroke="${p.bg1}" stroke-width="2"/>
          <line x1="56" y1="34" x2="68" y2="34" stroke="${p.bg1}" stroke-width="2"/>
          <line x1="56" y1="44" x2="68" y2="44" stroke="${p.bg1}" stroke-width="2"/>
        </g>`;
    case 'shield':
      return `
        <path d="M50 14 L76 24 V44 C76 60 50 70 50 70 C50 70 24 60 24 44 V24 Z" fill="${p.primary}" stroke="${p.accent}" stroke-width="2.5"/>`;
    case 'gear':
      return `
        <g fill="${p.primary}">
          <circle cx="50" cy="40" r="18" fill="${p.secondary}" stroke="${p.accent}" stroke-width="2"/>
          <circle cx="50" cy="40" r="8" fill="${p.bg1}"/>
          <rect x="47" y="18" width="6" height="44" rx="2" fill="${p.accent}"/>
          <rect x="28" y="37" width="44" height="6" rx="2" fill="${p.accent}"/>
        </g>`;
    case 'compass':
      return `
        <g stroke="${p.accent}" stroke-width="2.5" stroke-linecap="round">
          <circle cx="50" cy="18" r="4" fill="${p.primary}"/>
          <line x1="48" y1="21" x2="30" y2="62"/>
          <line x1="52" y1="21" x2="70" y2="62"/>
          <path d="M38 48 Q50 44 62 48" fill="none" stroke="${p.primary}" stroke-width="1.5"/>
        </g>`;
    case 'eco':
      return `
        <g>
          <path d="M32 62 C32 38 52 20 70 16 C70 42 50 62 32 62 Z" fill="${p.primary}" stroke="${p.accent}" stroke-width="2"/>
          <path d="M32 62 Q50 42 70 16" stroke="${p.bg1}" stroke-width="2" fill="none"/>
        </g>`;
    case 'bricks':
    default:
      return `
        <g>
          <!-- Sleek 3D Isometric Interlocking Architectural Prism -->
          <polygon points="50,16 78,30 50,44 22,30" fill="${p.accent}" opacity="0.95"/>
          <polygon points="22,30 50,44 50,70 22,56" fill="${p.primary}"/>
          <polygon points="50,44 78,30 78,56 50,70" fill="${p.secondary}"/>
          <line x1="50" y1="44" x2="50" y2="70" stroke="${p.bg1}" stroke-width="1.5"/>
        </g>`;
  }
}

function generateAILogoSVG({ name = 'Sri Balamurugan Fly Ash Bricks & Roadwork', monogram = '', style = 'industrial', colorKey = 'amber_slate', symbolKey = 'auto', seed = 1 }) {
  const p = AI_PALETTES[colorKey] || AI_PALETTES.amber_slate;
  let effectiveSymbol = symbolKey;
  if (!effectiveSymbol || effectiveSymbol === 'auto') {
    effectiveSymbol = detectIndustryKeywords(name);
  }

  const uid = 'ai_' + Math.abs((Number(seed) || 1) * 31 + (style ? style.charCodeAt(0) : 0) + (colorKey ? colorKey.charCodeAt(0) : 0)).toString(36);
  const symbolMarkup = getSymbolSvg(effectiveSymbol, p);
  const cleanMono = (monogram || generateMonogram(name, '')).toUpperCase().slice(0, 4) || 'SBFB';

  let content = '';

  if (style === 'hexagon') {
    content = `
      <defs>
        <linearGradient id="${uid}_g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p.bg2}" />
          <stop offset="100%" stop-color="${p.bg1}" />
        </linearGradient>
      </defs>
      <polygon points="50,4 90,26 90,74 50,96 10,74 10,26" fill="url(#${uid}_g)" stroke="${p.primary}" stroke-width="3" />
      <polygon points="50,10 84,29 84,71 50,90 16,71 16,29" fill="none" stroke="${p.accent}" stroke-width="1" opacity="0.6" stroke-dasharray="3,3" />
      <g transform="translate(0, -6)">
        ${symbolMarkup}
      </g>
      <rect x="22" y="68" width="56" height="19" rx="4" fill="${p.bg1}" stroke="${p.accent}" stroke-width="1.5" />
      <text x="50" y="82" font-family="'Manrope', sans-serif" font-weight="800" font-size="${cleanMono.length > 3 ? '10.5' : '12.5'}" fill="${p.accent}" text-anchor="middle" letter-spacing="1.2">${esc(cleanMono)}</text>
    `;
  } else if (style === 'architectural') {
    content = `
      <defs>
        <linearGradient id="${uid}_g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${p.bg2}" />
          <stop offset="100%" stop-color="${p.bg1}" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="8" fill="url(#${uid}_g)" stroke="${p.primary}" stroke-width="2" />
      <!-- Blueprint grid -->
      <line x1="6" y1="28" x2="94" y2="28" stroke="${p.accent}" stroke-width="0.7" opacity="0.25" />
      <line x1="6" y1="50" x2="94" y2="50" stroke="${p.accent}" stroke-width="0.7" opacity="0.25" />
      <line x1="6" y1="72" x2="94" y2="72" stroke="${p.accent}" stroke-width="0.7" opacity="0.25" />
      <line x1="28" y1="6" x2="28" y2="94" stroke="${p.accent}" stroke-width="0.7" opacity="0.25" />
      <line x1="50" y1="6" x2="50" y2="94" stroke="${p.accent}" stroke-width="0.7" opacity="0.25" />
      <line x1="72" y1="6" x2="72" y2="94" stroke="${p.accent}" stroke-width="0.7" opacity="0.25" />
      <g transform="translate(0, -7)">
        ${symbolMarkup}
      </g>
      <rect x="18" y="66" width="64" height="20" rx="3" fill="${p.bg1}" stroke="${p.accent}" stroke-width="1.5" />
      <text x="50" y="80.5" font-family="'Manrope', sans-serif" font-weight="800" font-size="${cleanMono.length > 3 ? '10.5' : '13'}" fill="${p.text}" text-anchor="middle" letter-spacing="1.2">${esc(cleanMono)}</text>
    `;
  } else if (style === 'gold_crest') {
    content = `
      <defs>
        <radialGradient id="${uid}_r" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${p.bg2}" />
          <stop offset="100%" stop-color="${p.bg1}" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#${uid}_r)" stroke="${p.primary}" stroke-width="3" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="${p.accent}" stroke-width="1.5" stroke-dasharray="2,2" />
      <g transform="scale(0.8) translate(12, 4)">
        ${symbolMarkup}
      </g>
      <rect x="20" y="65" width="60" height="19" rx="9.5" fill="${p.primary}" />
      <text x="50" y="78.5" font-family="'Manrope', sans-serif" font-weight="800" font-size="${cleanMono.length > 3 ? '10' : '12'}" fill="${p.bg1}" text-anchor="middle" letter-spacing="1.5">${esc(cleanMono)}</text>
    `;
  } else if (style === 'gradient_tech') {
    content = `
      <defs>
        <linearGradient id="${uid}_gt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p.primary}" />
          <stop offset="100%" stop-color="${p.bg1}" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="20" fill="url(#${uid}_gt)" stroke="${p.accent}" stroke-width="2" />
      <g transform="translate(0, -6)">
        ${symbolMarkup}
      </g>
      <text x="50" y="81" font-family="'Manrope', sans-serif" font-weight="800" font-size="${cleanMono.length > 3 ? '13' : '16'}" fill="${p.accent}" text-anchor="middle" letter-spacing="1.5">${esc(cleanMono)}</text>
    `;
  } else if (style === 'eco_infra') {
    content = `
      <defs>
        <linearGradient id="${uid}_eco" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${p.bg2}" />
          <stop offset="100%" stop-color="${p.bg1}" />
        </linearGradient>
      </defs>
      <path d="M50 6 C78 6 90 22 90 52 C90 80 66 94 50 94 C34 94 10 80 10 52 C10 22 22 6 50 6 Z" fill="url(#${uid}_eco)" stroke="${p.primary}" stroke-width="2.5" />
      <g transform="translate(0, -6)">
        ${symbolMarkup}
      </g>
      <rect x="24" y="67" width="52" height="18" rx="8" fill="${p.primary}" />
      <text x="50" y="79.5" font-family="'Manrope', sans-serif" font-weight="800" font-size="${cleanMono.length > 3 ? '9.5' : '11.5'}" fill="${p.bg1}" text-anchor="middle" letter-spacing="1">${esc(cleanMono)}</text>
    `;
  } else if (style === 'minimal_badge') {
    content = `
      <defs>
        <linearGradient id="${uid}_min" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p.bg2}" />
          <stop offset="100%" stop-color="${p.bg1}" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#${uid}_min)" stroke="${p.primary}" stroke-width="2.5" />
      <g transform="scale(0.8) translate(12, 2)">
        ${symbolMarkup}
      </g>
      <line x1="24" y1="64" x2="76" y2="64" stroke="${p.accent}" stroke-width="1.5" />
      <text x="50" y="80" font-family="'Manrope', sans-serif" font-weight="800" font-size="${cleanMono.length > 3 ? '11' : '14'}" fill="${p.accent}" text-anchor="middle" letter-spacing="1.5">${esc(cleanMono)}</text>
    `;
  } else {
    // default: industrial
    content = `
      <defs>
        <linearGradient id="${uid}_ind" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p.bg2}" />
          <stop offset="100%" stop-color="${p.bg1}" />
        </linearGradient>
      </defs>
      <!-- Top/bottom tech notch accents -->
      <polygon points="6,18 18,6 24,6 6,24" fill="${p.primary}" opacity="0.8"/>
      <polygon points="76,94 94,76 94,82 82,94" fill="${p.primary}" opacity="0.8"/>
      <g transform="translate(0, -6)">
        ${symbolMarkup}
      </g>
      <rect x="18" y="66" width="64" height="20" rx="5" fill="${p.bg1}" stroke="${p.accent}" stroke-width="1.5" />
      <text x="50" y="80.5" font-family="'Manrope', sans-serif" font-weight="800" font-size="${cleanMono.length > 3 ? '11' : '13.5'}" fill="${p.accent}" text-anchor="middle" letter-spacing="1.2">${esc(cleanMono)}</text>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" style="display:block;">${content}</svg>`;
}

function updateLogo() {
  const compName = (val('companyName') || 'Sri Balamurugan Fly Ash Bricks & Roadwork').trim();
  const mode = val('logoModeSelect') || 'ai';
  const customLogoText = ($('companyLogoText') ? $('companyLogoText').value : '').trim();
  const imgUrl = ($('companyLogoImgUrl') ? $('companyLogoImgUrl').value : '').trim();

  const aiStyle = val('aiLogoStyle') || 'industrial';
  const aiColor = val('aiLogoColor') || 'amber_slate';
  const aiSymbol = val('aiLogoSymbol') || 'auto';
  const aiSeed = Number(val('aiLogoSeed')) || 1;
  const customSvg = val('aiCustomSvgData');

  // Toggle editor UI fields based on mode
  if (mode === 'image') {
    if ($('imageLogoGroup')) $('imageLogoGroup').classList.remove('hidden');
    if ($('textLogoGroup')) $('textLogoGroup').classList.add('hidden');
    if ($('aiLogoGroup')) $('aiLogoGroup').classList.add('hidden');

    const notice = $('imageAiFallbackNotice');
    if (notice) {
      if (!imgUrl) {
        notice.classList.remove('hidden');
      } else {
        notice.classList.add('hidden');
      }
    }
  } else if (mode === 'text') {
    if ($('imageLogoGroup')) $('imageLogoGroup').classList.add('hidden');
    if ($('textLogoGroup')) $('textLogoGroup').classList.remove('hidden');
    if ($('aiLogoGroup')) $('aiLogoGroup').classList.add('hidden');
  } else {
    // mode === 'ai' (Default)
    if ($('imageLogoGroup')) $('imageLogoGroup').classList.add('hidden');
    if ($('textLogoGroup')) $('textLogoGroup').classList.add('hidden');
    if ($('aiLogoGroup')) $('aiLogoGroup').classList.remove('hidden');
  }

  // Update Segmented Mode Pills
  const pillAi = $('pillModeAi');
  const pillImg = $('pillModeImage');
  const pillText = $('pillModeText');
  if (pillAi && pillImg && pillText) {
    pillAi.classList.toggle('active', mode === 'ai');
    pillImg.classList.toggle('active', mode === 'image');
    pillText.classList.toggle('active', mode === 'text');
  }

  // Update Status Badge
  const statusBadge = $('logoStatusBadge');
  if (statusBadge) {
    if (mode === 'ai') {
      statusBadge.textContent = '🤖 AI ACTIVE';
      statusBadge.style.background = '#fef3c7';
      statusBadge.style.color = '#b45309';
    } else if (mode === 'image') {
      if (imgUrl) {
        statusBadge.textContent = '🖼️ IMAGE LOGO';
        statusBadge.style.background = '#e0f2fe';
        statusBadge.style.color = '#0369a1';
      } else {
        statusBadge.textContent = '🤖 AI (NO FILE)';
        statusBadge.style.background = '#fef3c7';
        statusBadge.style.color = '#b45309';
      }
    } else {
      statusBadge.textContent = '🔤 MONOGRAM';
      statusBadge.style.background = '#f1f5f9';
      statusBadge.style.color = '#475569';
    }
  }

  const monogram = generateMonogram(compName, customLogoText);

  // If user does not give any file in image mode, or selects AI mode, automatically generate AI Logo!
  const useAiLogo = mode === 'ai' || (mode === 'image' && !imgUrl);
  let logoSvgMarkup = '';
  if (useAiLogo) {
    if (customSvg && customSvg.trim().startsWith('<svg')) {
      logoSvgMarkup = customSvg;
    } else {
      logoSvgMarkup = generateAILogoSVG({
        name: compName,
        monogram: monogram,
        style: aiStyle,
        colorKey: aiColor,
        symbolKey: aiSymbol,
        seed: aiSeed
      });
    }
  }

  // 1. Settings Card Live Preview
  const settingsLogoWrap = $('settingsLogoWrap');
  if (settingsLogoWrap) {
    if (mode === 'image' && imgUrl) {
      settingsLogoWrap.innerHTML = `<img src="${esc(imgUrl)}" class="company-logo-img" alt="Logo" onerror="this.src='';this.alt='Invalid Image';" />`;
    } else if (useAiLogo) {
      settingsLogoWrap.innerHTML = `<div class="company-logo" id="settingsLogoPreview" style="padding:0;background:transparent;border:0;box-shadow:none;">${logoSvgMarkup}</div>`;
    } else {
      settingsLogoWrap.innerHTML = `<div class="company-logo" id="settingsLogoPreview">${esc(monogram)}</div>`;
      const sLogo = $('settingsLogoPreview');
      if (sLogo) adjustLogoFontSize(sLogo, monogram);
    }
  }

  // 2. Printable Quotation Header Preview
  const pLogoWrap = $('pCompanyLogoWrap');
  if (pLogoWrap) {
    if (mode === 'image' && imgUrl) {
      pLogoWrap.innerHTML = `<img src="${esc(imgUrl)}" class="company-logo-img" alt="Logo" />`;
    } else if (useAiLogo) {
      pLogoWrap.innerHTML = `<div class="company-logo" id="pCompanyLogo" style="padding:0;background:transparent;border:0;box-shadow:none;">${logoSvgMarkup}</div>`;
    } else {
      pLogoWrap.innerHTML = `<div class="company-logo" id="pCompanyLogo">${esc(monogram)}</div>`;
      const pLogo = $('pCompanyLogo');
      if (pLogo) adjustLogoFontSize(pLogo, monogram);
    }
  }

  const topBrandTitle = $('topBrandTitle');
  if (topBrandTitle) {
    const firstWord = compName.split(/\s+/)[0] || 'SBFB';
    topBrandTitle.textContent = `${firstWord} Management`;
  }
}

/* --- Document Type, Template & Billing Mode Controllers --- */
function setDocumentType(type, userSwitched = false) {
  if (!DOC_TYPES[type]) type = 'quotation';
  const docTypeInput = $('docType');
  if (docTypeInput) docTypeInput.value = type;

  document.querySelectorAll('.doc-type-btn').forEach(btn => {
    if (btn.dataset.doctype === type) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const conf = DOC_TYPES[type];

  // Update editor headings & labels
  if ($('docEyebrow')) $('docEyebrow').textContent = conf.eyebrow;
  if ($('docMainHeading')) $('docMainHeading').textContent = conf.heading;
  if ($('labelDocDate')) $('labelDocDate').textContent = conf.dateLabel;
  if ($('labelDocNo')) $('labelDocNo').textContent = conf.noLabel;
  if ($('badgeDocTypeLabel')) $('badgeDocTypeLabel').textContent = conf.dateLabel.toUpperCase();
  if ($('cardClientTitle')) $('cardClientTitle').textContent = `${conf.name} & Client Details`;
  if ($('cardClientSub')) $('cardClientSub').textContent = conf.clientSub;

  const invoiceRow = $('invoiceFieldsRow');
  const validityGroup = $('validityInputGroup');
  if (type === 'invoice' || type === 'cash_bill') {
    if (invoiceRow) invoiceRow.classList.remove('hidden');
    if (validityGroup) validityGroup.classList.add('hidden');
  } else {
    if (invoiceRow) invoiceRow.classList.add('hidden');
    if (validityGroup) validityGroup.classList.remove('hidden');
  }

  // If user explicitly switched, update default terms/notes & generate a number if blank
  if (userSwitched) {
    if ($('paymentTerms')) $('paymentTerms').value = conf.defaultTerms;
    if ($('notes')) $('notes').value = conf.defaultNotes;
    if (type === 'invoice' && $('paymentStatusSelect')) $('paymentStatusSelect').value = 'pending';
    if (type === 'cash_bill' && $('paymentStatusSelect')) $('paymentStatusSelect').value = 'paid';
    if (type === 'cash_bill' && $('paymentModeSelect')) $('paymentModeSelect').value = 'Cash';
    autoGenerateNumber();
  }

  updatePreview();
}

function setDocumentTemplate(tpl) {
  if (!TEMPLATES[tpl]) tpl = 'modern';
  const docTemplateInput = $('docTemplate');
  if (docTemplateInput) docTemplateInput.value = tpl;

  document.querySelectorAll('.template-pill-btn').forEach(btn => {
    if (btn.dataset.tpl === tpl) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const preview = $('quotationPreview');
  if (preview) {
    preview.className = `quotation tpl-${tpl}`;
  }

  const badge = $('activeTemplateBadge');
  if (badge && TEMPLATES[tpl]) {
    badge.textContent = TEMPLATES[tpl].name;
  }

  const prevLbl = $('previewTplLabel');
  if (prevLbl && TEMPLATES[tpl]) {
    prevLbl.innerHTML = `A4 Document &bull; ${TEMPLATES[tpl].name}`;
  }

  saveDraftState();
}

function setBillingMode(mode) {
  if (!['sqm_rate', 'qty_rate'].includes(mode)) mode = 'sqm_rate';
  const bModeInput = $('billingMode');
  if (bModeInput) bModeInput.value = mode;

  if ($('modeSqmBtn')) {
    if (mode === 'sqm_rate') $('modeSqmBtn').classList.add('active');
    else $('modeSqmBtn').classList.remove('active');
  }
  if ($('modeQtyBtn')) {
    if (mode === 'qty_rate') $('modeQtyBtn').classList.add('active');
    else $('modeQtyBtn').classList.remove('active');
  }

  const thQty = $('thItemQty');
  const thUnit = $('thItemUnit');
  const thRate = $('thItemRate');
  const thAmount = $('thItemAmount');

  if (mode === 'qty_rate') {
    if (thQty) thQty.classList.remove('hidden');
    if (thUnit) thUnit.classList.remove('hidden');
    if (thAmount) thAmount.classList.remove('hidden');
    if (thRate) thRate.textContent = 'Unit Rate (₹)';
  } else {
    if (thQty) thQty.classList.add('hidden');
    if (thUnit) thUnit.classList.add('hidden');
    if (thAmount) thAmount.classList.add('hidden');
    if (thRate) thRate.textContent = 'Rate (₹ / sq.m)';
  }

  renderItems();
  updatePreview();
}

function autoGenerateNumber() {
  const docType = val('docType') || 'quotation';
  const conf = DOC_TYPES[docType] || DOC_TYPES.quotation;
  const d = new Date();
  const year = d.getFullYear();
  const rand = String(Math.floor(Math.random() * 900) + 100);
  const newNo = `${conf.noPrefix}-${year}-${rand}`;
  if ($('quoteNo')) $('quoteNo').value = newNo;
  updatePreview();
  showToast(`🎲 Generated ${conf.name} No: ${newNo}`);
}

/* --- Live Preview & Calculations --- */
function updatePreview() {
  const docType = val('docType') || 'quotation';
  const tpl = val('docTemplate') || 'modern';
  const mode = val('billingMode') || 'sqm_rate';
  const isQtyMode = mode === 'qty_rate';
  const conf = DOC_TYPES[docType] || DOC_TYPES.quotation;

  // Apply template class
  const preview = $('quotationPreview');
  if (preview) {
    preview.className = `quotation tpl-${tpl}`;
  }

  // Dates & Numbers
  const quoteDate = val('quoteDate') || today();
  const qNo = (val('quoteNo') || '').trim();
  const dueDate = val('dueDate');
  const poNo = (val('poNumber') || '').trim();

  $('quoteDateBadge').textContent = formatDate(quoteDate) || 'Today';
  $('pQuoteDate').textContent = formatDate(quoteDate) || 'Today';
  if ($('pDateLabel')) $('pDateLabel').textContent = `${conf.dateLabel}:`;

  // Title tag
  if ($('pDocTitleTag')) $('pDocTitleTag').textContent = conf.tag;

  // Document Number Wrap
  const pQuoteNoWrap = $('pQuoteNoWrap');
  const pQuoteNo = $('pQuoteNo');
  const pQuoteNoLabel = $('pQuoteNoLabel');
  if (pQuoteNoLabel) pQuoteNoLabel.textContent = `${conf.noLabel}:`;

  if (qNo) {
    if (pQuoteNo) pQuoteNo.textContent = qNo;
    if (pQuoteNoWrap) {
      pQuoteNoWrap.classList.remove('hidden');
      pQuoteNoWrap.style.display = '';
    }
    $('quoteDateBadge').textContent = `${formatDate(quoteDate)} (${qNo})`;
  } else {
    if (pQuoteNo) pQuoteNo.textContent = '';
    if (pQuoteNoWrap) {
      pQuoteNoWrap.classList.add('hidden');
      pQuoteNoWrap.style.display = 'none';
    }
    $('quoteDateBadge').textContent = formatDate(quoteDate) || 'Today';
  }

  // Due date wrap
  const pDueDateWrap = $('pDueDateWrap');
  const pDueDate = $('pDueDate');
  if (docType === 'invoice' && dueDate) {
    if (pDueDate) pDueDate.textContent = formatDate(dueDate);
    if (pDueDateWrap) {
      pDueDateWrap.classList.remove('hidden');
      pDueDateWrap.style.display = '';
    }
  } else {
    if (pDueDateWrap) {
      pDueDateWrap.classList.add('hidden');
      pDueDateWrap.style.display = 'none';
    }
  }

  // PO / Work Order wrap
  const pPoWrap = $('pPoWrap');
  const pPoNo = $('pPoNo');
  if (poNo && docType !== 'quotation') {
    if (pPoNo) pPoNo.textContent = poNo;
    if (pPoWrap) {
      pPoWrap.classList.remove('hidden');
      pPoWrap.style.display = '';
    }
  } else {
    if (pPoWrap) {
      pPoWrap.classList.add('hidden');
      pPoWrap.style.display = 'none';
    }
  }

  // Payment Status Stamp Badge (Optional / Toggleable)
  const showStatus = $('showPaymentStatusOnDoc') ? $('showPaymentStatusOnDoc').checked : true;
  const pDocStatusWrap = $('pDocStatusWrap');
  const pDocStatusStamp = $('pDocStatusStamp');
  const pStatus = val('paymentStatusSelect') || 'pending';
  if (pDocStatusStamp && pDocStatusWrap) {
    if (showStatus && pStatus !== 'none' && (docType === 'invoice' || docType === 'cash_bill')) {
      pDocStatusWrap.classList.remove('hidden');
      pDocStatusWrap.style.display = '';
      if (pStatus === 'paid') {
        pDocStatusStamp.className = 'doc-status-stamp status-paid';
        pDocStatusStamp.textContent = '✅ PAID IN FULL';
      } else if (pStatus === 'partial') {
        pDocStatusStamp.className = 'doc-status-stamp status-partial';
        pDocStatusStamp.textContent = '💳 PARTIALLY PAID';
      } else if (pStatus === 'overdue') {
        pDocStatusStamp.className = 'doc-status-stamp status-overdue';
        pDocStatusStamp.textContent = '⚠️ OVERDUE';
      } else if (pStatus === 'draft') {
        pDocStatusStamp.className = 'doc-status-stamp status-draft';
        pDocStatusStamp.textContent = '📝 DRAFT INVOICE';
      } else {
        pDocStatusStamp.className = 'doc-status-stamp status-pending';
        pDocStatusStamp.textContent = '⏳ PAYMENT DUE';
      }
    } else {
      pDocStatusWrap.classList.add('hidden');
      pDocStatusWrap.style.display = 'none';
    }
  }

  // Company details
  const compName = (val('companyName') || 'Sri Balamurugan Fly Ash Bricks & Roadwork').trim();
  updateLogo();

  $('pCompanyName').textContent = compName;
  $('pCompanyName2').textContent = compName;
  $('pCompanyAddress').textContent = val('companyAddress') || '';
  $('pCompanyPhone').textContent = val('companyPhone') || '';
  $('pCompanyEmail').textContent = val('companyEmail') || '';

  const compGst = (val('companyGst') || '').trim();
  const pCompGst = $('pCompanyGst');
  if (pCompGst) {
    if (compGst) {
      pCompGst.textContent = `GSTIN: ${compGst}`;
      pCompGst.style.display = '';
    } else {
      pCompGst.textContent = '';
      pCompGst.style.display = 'none';
    }
  }

  // Client details (Optional elements gracefully handled)
  if ($('pClientHeaderTag')) $('pClientHeaderTag').textContent = conf.clientHeader;
  $('pClientName').textContent = val('clientName') || 'Client Name';

  const cContact = (val('clientContact') || '').trim();
  const pClientContact = $('pClientContact');
  if (pClientContact) {
    if (cContact) {
      pClientContact.textContent = cContact;
      pClientContact.style.display = '';
    } else {
      pClientContact.textContent = '';
      pClientContact.style.display = 'none';
    }
  }

  const cPhone = (val('clientPhone') || '').trim();
  const pClientPhone = $('pClientPhone');
  if (pClientPhone) {
    if (cPhone) {
      pClientPhone.textContent = cPhone;
      pClientPhone.style.display = '';
    } else {
      pClientPhone.textContent = '';
      pClientPhone.style.display = 'none';
    }
  }

  $('pProjectName').textContent = val('projectName') || 'Project / Site Work';

  const sLocation = (val('siteLocation') || '').trim();
  const pSiteLocation = $('pSiteLocation');
  if (pSiteLocation) {
    if (sLocation) {
      pSiteLocation.textContent = sLocation;
      pSiteLocation.style.display = '';
    } else {
      pSiteLocation.textContent = '';
      pSiteLocation.style.display = 'none';
    }
  }

  // Third box in client strip
  if ($('pThirdBoxTag')) $('pThirdBoxTag').textContent = conf.thirdBoxTag;
  if (docType === 'quotation') {
    if ($('pThirdBoxValue')) $('pThirdBoxValue').textContent = `${val('validity') || 15} days`;
    if ($('pThirdBoxSub')) $('pThirdBoxSub').textContent = 'From quotation date';
  } else if (docType === 'invoice') {
    if ($('pThirdBoxValue')) $('pThirdBoxValue').textContent = dueDate ? formatDate(dueDate) : 'Due on Receipt';
    if ($('pThirdBoxSub')) $('pThirdBoxSub').textContent = val('paymentModeSelect') || 'Bank / UPI';
  } else {
    if ($('pThirdBoxValue')) $('pThirdBoxValue').textContent = 'PAID (CASH)';
    if ($('pThirdBoxSub')) $('pThirdBoxSub').textContent = 'Direct Receipt';
  }

  // Commercial / Payment Terms Box (Optional & Clickable Toggle)
  const showTerms = $('showPaymentTermsOnDoc') ? $('showPaymentTermsOnDoc').checked : true;
  const pTermsTextarea = $('paymentTerms');
  if (pTermsTextarea) pTermsTextarea.classList.toggle('toggle-dimmed', !showTerms);

  const pTerms = showTerms ? (val('paymentTerms') || '').trim() : '';
  const validityDays = val('validity') || 15;
  const showValidity = docType === 'quotation' && Number(validityDays) > 0;
  const pTermsBox = $('pTermsBox');
  const pTermsHeading = $('pTermsHeading');
  const pPaymentTerms = $('pPaymentTerms');
  const validityLine = $('pValidityLine');

  if (pTermsHeading) {
    pTermsHeading.textContent = docType === 'quotation' ? 'Commercial Terms' : 'Payment Terms';
  }

  if (pPaymentTerms) {
    if (pTerms) {
      pPaymentTerms.textContent = pTerms;
      pPaymentTerms.style.display = '';
    } else {
      pPaymentTerms.textContent = '';
      pPaymentTerms.style.display = 'none';
    }
  }

  if (validityLine) {
    if (showValidity) {
      validityLine.style.display = '';
      if ($('pValidity2')) $('pValidity2').textContent = `${validityDays} days`;
    } else {
      validityLine.style.display = 'none';
    }
  }

  if (pTermsBox) {
    if (pTerms || showValidity) {
      pTermsBox.style.display = '';
    } else {
      pTermsBox.style.display = 'none';
    }
  }

  // Notes & Declaration Box (Optional & Clickable Toggle)
  const showNotes = $('showNotesOnDoc') ? $('showNotesOnDoc').checked : true;
  const pNotesTextarea = $('notes');
  if (pNotesTextarea) pNotesTextarea.classList.toggle('toggle-dimmed', !showNotes);

  const notesText = showNotes ? (val('notes') || '').trim() : '';
  const pNotesBox = $('pNotesBox');
  const pNotes = $('pNotes');
  if (pNotesBox) {
    if (notesText) {
      if (pNotes) pNotes.textContent = notesText;
      pNotesBox.style.display = '';
    } else {
      pNotesBox.style.display = 'none';
    }
  }

  if ($('pDocFooter')) $('pDocFooter').textContent = conf.footer;

  // Taxes and subtotal calculation
  const gstMode = val('gstModeSelect') || '18';
  let gstRate = 0;
  if (gstMode === 'custom') {
    if ($('customGstGroup')) $('customGstGroup').classList.remove('hidden');
    gstRate = Math.max(Number(val('gstRate')) || 0, 0);
  } else {
    if ($('customGstGroup')) $('customGstGroup').classList.add('hidden');
    gstRate = Math.max(Number(gstMode) || 0, 0);
    if ($('gstRate')) $('gstRate').value = gstRate;
  }

  let subtotal = 0;
  if (isQtyMode) {
    subtotal = items.reduce((s, x) => s + ((Number(x.qty) || 1) * (Number(x.rate) || 0)), 0);
  } else {
    subtotal = items.reduce((s, x) => s + (Number(x.rate) || 0), 0);
  }

  const discount = Math.min(Math.max(Number(val('discount')) || 0, 0), subtotal);
  const taxable = Math.max(subtotal - discount, 0);
  const gst = taxable * (gstRate / 100);
  const total = taxable + gst;

  $('pSubtotal').textContent = money(subtotal);

  const pDiscountRow = $('pDiscountRow');
  if (pDiscountRow) {
    if (discount > 0) {
      $('pDiscount').textContent = money(discount);
      pDiscountRow.style.display = '';
    } else {
      $('pDiscount').textContent = money(0);
      pDiscountRow.style.display = 'none';
    }
  }

  const pGstRow = $('pGstRow');
  const pGstPercent = $('pGstPercent');
  if (pGstPercent) pGstPercent.textContent = `${gstRate}%`;

  if (gstRate > 0) {
    $('pGst').textContent = money(gst);
    if (pGstRow) pGstRow.style.display = '';
  } else {
    $('pGst').textContent = '₹0.00';
    if (pGstRow) pGstRow.style.display = gstMode === '0' ? 'none' : '';
  }

  $('pTotal').textContent = money(total);

  // Bank & UPI Details in Bottom Note Section (Optional)
  const showBank = $('showBankOnDoc') ? $('showBankOnDoc').checked : true;
  const bankBox = $('pBankDetailsBox');
  const bName = (val('bankName') || '').trim();
  const bAcc = (val('bankAccount') || '').trim();
  const bIfsc = (val('bankIfsc') || '').trim();
  const bBranch = (val('bankBranch') || '').trim();
  const bUpi = (val('bankUpi') || '').trim();

  if (bankBox) {
    const hasAnyBankData = bName || bAcc || bIfsc || bBranch || bUpi;
    if (showBank && (hasAnyBankData || docType !== 'quotation')) {
      bankBox.classList.remove('hidden');
      bankBox.style.display = 'flex';

      if ($('pBankNameVal')) $('pBankNameVal').textContent = bName || 'State Bank of India';
      if ($('pBankAccountVal')) $('pBankAccountVal').textContent = bAcc || '123456789012';
      if ($('pBankIfscVal')) $('pBankIfscVal').textContent = bIfsc || 'SBIN0001234';
      if ($('pBankBranchVal')) $('pBankBranchVal').textContent = bBranch || 'Main Branch';
      if ($('pBankUpiVal')) $('pBankUpiVal').textContent = bUpi || 'sbfb@upi';

      // Dynamic UPI QR Code Generator
      const upiId = bUpi || 'sbfb@upi';
      const upiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(compName)}&am=${total > 0 ? total.toFixed(2) : '100.00'}&cu=INR`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(upiPayload)}`;
      const qrHolder = $('pBankQrHolder');
      if (qrHolder) {
        qrHolder.innerHTML = `<img src="${qrUrl}" alt="UPI QR" style="width:100%;height:100%;object-fit:contain;" />`;
      }
    } else {
      bankBox.classList.add('hidden');
      bankBox.style.display = 'none';
    }
  }

  // Update preview table headers & columns
  const pThQty = $('pThQty');
  const pThUnit = $('pThUnit');
  const pThRate = $('pThRate');
  const pThAmount = $('pThAmount');

  if (isQtyMode) {
    if (pThQty) pThQty.classList.remove('hidden');
    if (pThUnit) pThUnit.classList.remove('hidden');
    if (pThAmount) pThAmount.classList.remove('hidden');
    if (pThRate) pThRate.textContent = 'Rate (₹)';
  } else {
    if (pThQty) pThQty.classList.add('hidden');
    if (pThUnit) pThUnit.classList.add('hidden');
    if (pThAmount) pThAmount.classList.add('hidden');
    if (pThRate) pThRate.textContent = 'Rate per Sq. Meter';
  }

  // Render preview table rows
  const previewTbody = $('previewItems');
  if (previewTbody) {
    if (!items.length) {
      const cols = isQtyMode ? 6 : 3;
      previewTbody.innerHTML = `<tr><td colspan="${cols}" style="text-align:center;color:#94a3b8;padding:25px">Add items to build ${conf.name.toLowerCase()} preview.</td></tr>`;
    } else {
      previewTbody.innerHTML = items.map((x, i) => {
        const qty = Number(x.qty) || 1;
        const rate = Number(x.rate) || 0;
        const amount = qty * rate;

        if (isQtyMode) {
          return `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${esc(x.desc || 'Work / Material description')}</strong></td>
              <td class="center"><strong>${qty}</strong></td>
              <td class="center"><span class="badge-sqm">${esc(x.unit || 'sq.m')}</span></td>
              <td class="right">${money(rate)}</td>
              <td class="right"><strong>${money(amount)}</strong></td>
            </tr>
          `;
        } else {
          return `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${esc(x.desc || 'Work description')}</strong></td>
              <td class="right"><strong>${money(rate)}</strong> <span style="font-size:8.5px;color:#64748b">/ sq.m</span></td>
            </tr>
          `;
        }
      }).join('');
    }
  }

  disableWheelOnNumbers();
  saveDraftState();
}

/* --- Local Draft State --- */
function saveDraftState() {
  const data = {
    currentQuoteId,
    fields: Object.fromEntries(fields.map(id => [id, val(id)])),
    items,
    showBankOnDoc: $('showBankOnDoc') ? $('showBankOnDoc').checked : true,
    showPaymentStatusOnDoc: $('showPaymentStatusOnDoc') ? $('showPaymentStatusOnDoc').checked : true,
    showPaymentTermsOnDoc: $('showPaymentTermsOnDoc') ? $('showPaymentTermsOnDoc').checked : true,
    showNotesOnDoc: $('showNotesOnDoc') ? $('showNotesOnDoc').checked : true
  };
  localStorage.setItem(stateKey, JSON.stringify(data));
}

function loadDraftState() {
  try {
    const data = JSON.parse(localStorage.getItem(stateKey) || 'null');
    if (data) {
      if (data.currentQuoteId) currentQuoteId = data.currentQuoteId;
      if (data.fields) {
        fields.forEach(id => {
          if ($(id) && data.fields[id] != null) {
            $(id).value = data.fields[id];
          }
        });
      }
      if (data.showBankOnDoc != null && $('showBankOnDoc')) {
        $('showBankOnDoc').checked = Boolean(data.showBankOnDoc);
      }
      if (data.showPaymentStatusOnDoc != null && $('showPaymentStatusOnDoc')) {
        $('showPaymentStatusOnDoc').checked = Boolean(data.showPaymentStatusOnDoc);
      }
      if (data.showPaymentTermsOnDoc != null && $('showPaymentTermsOnDoc')) {
        $('showPaymentTermsOnDoc').checked = Boolean(data.showPaymentTermsOnDoc);
      }
      if (data.showNotesOnDoc != null && $('showNotesOnDoc')) {
        $('showNotesOnDoc').checked = Boolean(data.showNotesOnDoc);
      }
      if (Array.isArray(data.items) && data.items.length) {
        items = data.items;
      }
    }
  } catch {}

  if (!$('quoteDate').value) {
    $('quoteDate').value = today();
  }

  if (!$('logoModeSelect').value || !['ai', 'image', 'text'].includes($('logoModeSelect').value)) {
    $('logoModeSelect').value = 'ai';
  }

  if ($('companyLogoText') && ($('companyLogoText').value === 'TNP' || $('companyLogoText').value === 'SBFA')) {
    $('companyLogoText').value = '';
  }

  // Restore document type and template
  const docType = val('docType') || 'quotation';
  const docTemplate = val('docTemplate') || 'modern';
  const billingMode = val('billingMode') || 'sqm_rate';

  setDocumentType(docType, false);
  setDocumentTemplate(docTemplate);
  setBillingMode(billingMode);
}

/* --- Cloud Database (Supabase Integration) --- */
function initSupabase() {
  try {
    const savedConfig = JSON.parse(localStorage.getItem(supabaseConfigKey) || 'null');
    const badge = $('cloudStatusBadge');

    if (savedConfig && savedConfig.url && savedConfig.key && window.supabase) {
      $('supabaseUrl').value = savedConfig.url;
      $('supabaseKey').value = savedConfig.key;

      supabaseClient = window.supabase.createClient(savedConfig.url, savedConfig.key);

      // Verify connection
      supabaseClient.from('quotations').select('id').limit(1).then(({ error }) => {
        if (!error) {
          if (badge) {
            badge.textContent = '● Cloud Online';
            badge.className = 'cloud-status-pill online';
          }
          loadCompanyDefaults();
          loadItemCatalog();
        } else {
          console.warn('Supabase connect check:', error.message);
          if (badge) {
            badge.textContent = '● Setup Needed';
            badge.className = 'cloud-status-pill local';
          }
        }
      }).catch(() => {
        if (badge) {
          badge.textContent = '● Local Mode';
          badge.className = 'cloud-status-pill local';
        }
      });
    } else {
      if (badge) {
        badge.textContent = '● Local Database';
        badge.className = 'cloud-status-pill local';
      }
    }
  } catch (err) {
    console.error('Supabase init error:', err);
  }
}

async function saveCompanyDefaults() {
  const companyData = {
    company_name: val('companyName'),
    logo_mode: val('logoModeSelect') || 'ai',
    ai_logo_style: val('aiLogoStyle') || 'industrial',
    ai_logo_color: val('aiLogoColor') || 'amber_slate',
    ai_logo_symbol: val('aiLogoSymbol') || 'auto',
    ai_logo_seed: val('aiLogoSeed') || '1',
    ai_custom_svg: val('aiCustomSvgData') || '',
    company_logo_text: val('companyLogoText'),
    company_logo_img: val('companyLogoImgUrl'),
    company_phone: val('companyPhone'),
    company_email: val('companyEmail'),
    company_gst: val('companyGst'),
    company_address: val('companyAddress'),
    bank_name: val('bankName'),
    bank_account: val('bankAccount'),
    bank_ifsc: val('bankIfsc'),
    bank_branch: val('bankBranch'),
    bank_upi: val('bankUpi')
  };

  // Always save locally
  localStorage.setItem(companyDefaultsKey, JSON.stringify(companyData));

  // If Supabase is connected, save in company_settings table
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from('company_settings').upsert({
        id: 'default',
        ...companyData,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      showToast('✅ Company & Bank details saved to Cloud Database as default!');
      return;
    } catch (err) {
      console.warn('Cloud company save fallback:', err);
    }
  }

  showToast('💾 Company & Bank details saved as default locally!');
}

async function loadCompanyDefaults() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('company_settings').select('*').eq('id', 'default').single();
      if (!error && data) {
        if (data.company_name) $('companyName').value = data.company_name;
        if (data.logo_mode) $('logoModeSelect').value = data.logo_mode;
        if (data.ai_logo_style && $('aiLogoStyle')) $('aiLogoStyle').value = data.ai_logo_style;
        if (data.ai_logo_color && $('aiLogoColor')) $('aiLogoColor').value = data.ai_logo_color;
        if (data.ai_logo_symbol && $('aiLogoSymbol')) $('aiLogoSymbol').value = data.ai_logo_symbol;
        if (data.ai_logo_seed && $('aiLogoSeed')) $('aiLogoSeed').value = data.ai_logo_seed;
        if (data.ai_custom_svg != null && $('aiCustomSvgData')) $('aiCustomSvgData').value = data.ai_custom_svg;
        if (data.company_logo_text != null) $('companyLogoText').value = data.company_logo_text;
        if (data.company_logo_img != null) $('companyLogoImgUrl').value = data.company_logo_img;
        if (data.company_phone) $('companyPhone').value = data.company_phone;
        if (data.company_email) $('companyEmail').value = data.company_email;
        if (data.company_gst) $('companyGst').value = data.company_gst;
        if (data.company_address) $('companyAddress').value = data.company_address;
        if (data.bank_name && $('bankName')) $('bankName').value = data.bank_name;
        if (data.bank_account && $('bankAccount')) $('bankAccount').value = data.bank_account;
        if (data.bank_ifsc && $('bankIfsc')) $('bankIfsc').value = data.bank_ifsc;
        if (data.bank_branch && $('bankBranch')) $('bankBranch').value = data.bank_branch;
        if (data.bank_upi && $('bankUpi')) $('bankUpi').value = data.bank_upi;
        updatePreview();
        return;
      }
    } catch {}
  }

  // Local defaults fallback
  try {
    const local = JSON.parse(localStorage.getItem(companyDefaultsKey) || 'null');
    if (local) {
      if (local.company_name) $('companyName').value = local.company_name;
      if (local.logo_mode) $('logoModeSelect').value = local.logo_mode;
      if (local.ai_logo_style && $('aiLogoStyle')) $('aiLogoStyle').value = local.ai_logo_style;
      if (local.ai_logo_color && $('aiLogoColor')) $('aiLogoColor').value = local.ai_logo_color;
      if (local.ai_logo_symbol && $('aiLogoSymbol')) $('aiLogoSymbol').value = local.ai_logo_symbol;
      if (local.ai_logo_seed && $('aiLogoSeed')) $('aiLogoSeed').value = local.ai_logo_seed;
      if (local.ai_custom_svg != null && $('aiCustomSvgData')) $('aiCustomSvgData').value = local.ai_custom_svg;
      if (local.company_logo_text != null) $('companyLogoText').value = local.company_logo_text;
      if (local.company_logo_img != null) $('companyLogoImgUrl').value = local.company_logo_img;
      if (local.company_phone) $('companyPhone').value = local.company_phone;
      if (local.company_email) $('companyEmail').value = local.company_email;
      if (local.company_gst) $('companyGst').value = local.company_gst;
      if (local.company_address) $('companyAddress').value = local.company_address;
      if (local.bank_name && $('bankName')) $('bankName').value = local.bank_name;
      if (local.bank_account && $('bankAccount')) $('bankAccount').value = local.bank_account;
      if (local.bank_ifsc && $('bankIfsc')) $('bankIfsc').value = local.bank_ifsc;
      if (local.bank_branch && $('bankBranch')) $('bankBranch').value = local.bank_branch;
      if (local.bank_upi && $('bankUpi')) $('bankUpi').value = local.bank_upi;
      updatePreview();
    }
  } catch {}
}

async function saveQuotationToCloud() {
  const mode = val('billingMode') || 'sqm_rate';
  const isQtyMode = mode === 'qty_rate';
  const docType = val('docType') || 'quotation';
  const docTemplate = val('docTemplate') || 'modern';
  const conf = DOC_TYPES[docType] || DOC_TYPES.quotation;

  let subtotal = 0;
  if (isQtyMode) {
    subtotal = items.reduce((s, x) => s + ((Number(x.qty) || 1) * (Number(x.rate) || 0)), 0);
  } else {
    subtotal = items.reduce((s, x) => s + (Number(x.rate) || 0), 0);
  }

  const discount = Math.min(Math.max(Number(val('discount')) || 0, 0), subtotal);
  const taxable = subtotal - discount;
  const gst = taxable * (Math.max(Number(val('gstRate')) || 0, 0) / 100);
  const total = taxable + gst;

  // Auto-sync items from this quotation to Item Library
  items.forEach(item => {
    if (item.desc && item.desc.trim()) {
      saveItemToCatalog(item.desc, item.rate, false);
    }
  });

  const quotePayload = {
    doc_type: docType,
    template_theme: docTemplate,
    billing_mode: mode,
    quote_no: (val('quoteNo') || '').trim() || null,
    quote_date: val('quoteDate') || today(),
    due_date: val('dueDate') || null,
    payment_status: val('paymentStatusSelect') || 'pending',
    payment_mode: val('paymentModeSelect') || 'UPI / QR Code',
    po_number: val('poNumber') || null,
    company_name: val('companyName'),
    logo_mode: val('logoModeSelect') || 'ai',
    ai_logo_style: val('aiLogoStyle') || 'industrial',
    ai_logo_color: val('aiLogoColor') || 'amber_slate',
    ai_logo_symbol: val('aiLogoSymbol') || 'auto',
    ai_logo_seed: val('aiLogoSeed') || '1',
    ai_custom_svg: val('aiCustomSvgData') || '',
    company_logo_text: val('companyLogoText'),
    company_logo_img: val('companyLogoImgUrl'),
    company_phone: val('companyPhone'),
    company_email: val('companyEmail'),
    company_gst: val('companyGst'),
    company_address: val('companyAddress'),
    bank_name: val('bankName'),
    bank_account: val('bankAccount'),
    bank_ifsc: val('bankIfsc'),
    bank_branch: val('bankBranch'),
    bank_upi: val('bankUpi'),
    show_bank_on_doc: $('showBankOnDoc') ? $('showBankOnDoc').checked : true,
    client_name: val('clientName') || 'Unnamed Client',
    client_contact: val('clientContact'),
    client_phone: val('clientPhone'),
    project_name: val('projectName') || 'Unspecified Project',
    site_location: val('siteLocation'),
    items: items,
    gst_rate: Number(val('gstRate')) || 18,
    discount: Number(val('discount')) || 0,
    validity: Number(val('validity')) || 15,
    payment_terms: val('paymentTerms'),
    notes: val('notes'),
    subtotal,
    total,
    updated_at: new Date().toISOString()
  };

  if (!currentQuoteId) {
    currentQuoteId = crypto.randomUUID();
  }
  quotePayload.id = currentQuoteId;

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from('quotations').upsert(quotePayload);
      if (error) throw error;
      showToast(`☁️ ${conf.name} & items saved to Cloud Database successfully!`);
      saveDraftState();
      return;
    } catch (err) {
      console.error('Supabase save error:', err);
      showToast(`Cloud save error: ${err.message || 'Check database'}. Saved locally.`, 'error');
    }
  }

  // Fallback to local storage cloud simulation
  let localQuotes = [];
  try {
    localQuotes = JSON.parse(localStorage.getItem(localQuotesKey) || '[]');
  } catch {}

  const existingIdx = localQuotes.findIndex(q => q.id === currentQuoteId);
  if (existingIdx >= 0) {
    localQuotes[existingIdx] = quotePayload;
  } else {
    localQuotes.unshift(quotePayload);
  }
  localStorage.setItem(localQuotesKey, JSON.stringify(localQuotes));
  saveDraftState();
  showToast(`💾 ${conf.name} & items saved to local cloud cache!`);
}

async function fetchSavedQuotations() {
  const listEl = $('savedQuotesList');
  if (!listEl) return;
  listEl.innerHTML = '<div class="empty-state">Loading documents...</div>';

  let quotes = [];

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('quotations').select('*').order('updated_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        quotes = data;
      } else if (error) {
        console.warn('Supabase fetch error, fallback to local:', error);
      }
    } catch (err) {
      console.warn('Supabase fetch exception:', err);
    }
  }

  if (!quotes.length) {
    try {
      quotes = JSON.parse(localStorage.getItem(localQuotesKey) || '[]');
    } catch {}
  }

  savedQuotesCache = quotes;
  $('savedCount').textContent = quotes.length;
  applyCloudFilterAndRender();
}

function applyCloudFilterAndRender() {
  const q = ($('searchQuoteInput') ? $('searchQuoteInput').value : '').toLowerCase();
  const filterType = ($('cloudDocFilter') ? $('cloudDocFilter').value : 'all');

  const filtered = savedQuotesCache.filter(item => {
    // Type filter
    const docType = item.doc_type || 'quotation';
    if (filterType !== 'all' && docType !== filterType) {
      return false;
    }
    // Search query filter
    if (!q) return true;
    return (item.client_name && item.client_name.toLowerCase().includes(q)) ||
           (item.project_name && item.project_name.toLowerCase().includes(q)) ||
           (item.site_location && item.site_location.toLowerCase().includes(q)) ||
           (item.quote_date && item.quote_date.includes(q)) ||
           (item.quote_no && item.quote_no.toLowerCase().includes(q));
  });

  renderSavedQuotesList(filtered);
}

function renderSavedQuotesList(quotes) {
  const listEl = $('savedQuotesList');
  if (!listEl) return;

  if (!quotes.length) {
    listEl.innerHTML = `
      <div class="empty-state">
        <p>No saved documents found in this filter.</p>
        <small>Click "Save to Cloud" on any quotation or bill to store it here.</small>
      </div>
    `;
    return;
  }

  listEl.innerHTML = quotes.map(q => {
    const docType = q.doc_type || 'quotation';
    const conf = DOC_TYPES[docType] || DOC_TYPES.quotation;
    const typeBadge = docType === 'invoice' ? '🧾 Invoice' : (docType === 'cash_bill' ? '💵 Cash Bill' : '📄 Quotation');
    const badgeColor = docType === 'invoice' ? '#2563eb' : (docType === 'cash_bill' ? '#059669' : '#b45309');

    const dateFormatted = formatDate(q.quote_date) || 'No date';
    const quoteNoTag = q.quote_no ? ` &bull; 🏷️ ${esc(q.quote_no)}` : '';
    const itemsCount = Array.isArray(q.items) ? q.items.length : 0;
    const client = esc(q.client_name || 'Unnamed Client');
    const project = esc(q.project_name || 'Project');
    const total = money(q.total || 0);

    return `
      <div class="quote-card">
        <div class="quote-card-main">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
            <span style="font-size:9.5px;font-weight:800;color:${badgeColor};background:#f8fafc;border:1px solid #e2e8f0;padding:1px 6px;border-radius:4px;">${typeBadge}</span>
            <strong>${client} — ${project}</strong>
          </div>
          <p>📅 ${dateFormatted}${quoteNoTag} &bull; 📦 ${itemsCount} items &bull; 📍 ${esc(q.site_location || 'Site not set')}</p>
        </div>
        <div class="quote-card-right">
          <div class="quote-card-amount">${total}</div>
          <button class="btn small primary" data-load-id="${q.id}">📂 Open</button>
          <button class="btn small ghost-dark" data-delete-id="${q.id}" title="Delete document">&times;</button>
        </div>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('[data-load-id]').forEach(btn => {
    btn.addEventListener('click', () => loadQuotationById(btn.dataset.loadId));
  });

  listEl.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', () => deleteQuotationById(btn.dataset.deleteId));
  });
}

function loadQuotationById(id) {
  const q = savedQuotesCache.find(x => x.id === id);
  if (!q) return;

  currentQuoteId = q.id;
  $('quoteNo').value = q.quote_no || q.quoteNo || '';
  $('quoteDate').value = q.quote_date || today();
  if ($('dueDate')) $('dueDate').value = q.due_date || '';
  if ($('paymentStatusSelect')) $('paymentStatusSelect').value = q.payment_status || 'pending';
  if ($('paymentModeSelect')) $('paymentModeSelect').value = q.payment_mode || 'UPI / QR Code';
  if ($('poNumber')) $('poNumber').value = q.po_number || '';

  $('companyName').value = q.company_name || 'Sri Balamurugan Fly Ash Bricks & Roadwork';
  if ($('logoModeSelect')) $('logoModeSelect').value = q.logo_mode || 'ai';
  if ($('aiLogoStyle')) $('aiLogoStyle').value = q.ai_logo_style || 'industrial';
  if ($('aiLogoColor')) $('aiLogoColor').value = q.ai_logo_color || 'amber_slate';
  if ($('aiLogoSymbol')) $('aiLogoSymbol').value = q.ai_logo_symbol || 'auto';
  if ($('aiLogoSeed')) $('aiLogoSeed').value = q.ai_logo_seed || '1';
  if ($('aiCustomSvgData')) $('aiCustomSvgData').value = q.ai_custom_svg || '';
  if ($('companyLogoText')) $('companyLogoText').value = q.company_logo_text || '';
  if ($('companyLogoImgUrl')) $('companyLogoImgUrl').value = q.company_logo_img || '';
  $('companyPhone').value = q.company_phone || '';
  $('companyEmail').value = q.company_email || '';
  $('companyGst').value = q.company_gst || '';
  $('companyAddress').value = q.company_address || '';

  if ($('bankName')) $('bankName').value = q.bank_name || '';
  if ($('bankAccount')) $('bankAccount').value = q.bank_account || '';
  if ($('bankIfsc')) $('bankIfsc').value = q.bank_ifsc || '';
  if ($('bankBranch')) $('bankBranch').value = q.bank_branch || '';
  if ($('bankUpi')) $('bankUpi').value = q.bank_upi || '';
  if ($('showBankOnDoc')) $('showBankOnDoc').checked = q.show_bank_on_doc != null ? Boolean(q.show_bank_on_doc) : true;

  $('clientName').value = q.client_name || '';
  $('clientContact').value = q.client_contact || '';
  $('clientPhone').value = q.client_phone || '';
  $('projectName').value = q.project_name || '';
  $('siteLocation').value = q.site_location || '';

  if ($('gstModeSelect')) {
    const r = q.gst_rate != null ? String(q.gst_rate) : '18';
    if (['0', '5', '12', '18', '28'].includes(r)) {
      $('gstModeSelect').value = r;
    } else {
      $('gstModeSelect').value = 'custom';
    }
  }
  $('gstRate').value = q.gst_rate ?? 18;
  $('discount').value = q.discount ?? 0;
  $('validity').value = q.validity ?? 15;
  $('paymentTerms').value = q.payment_terms || '30% advance with work order. Balance as per measured progress / agreed milestones.';
  $('notes').value = q.notes || 'Rates are quoted based on specifications above.';

  items = Array.isArray(q.items) ? q.items.map(item => ({
    id: item.id || crypto.randomUUID(),
    desc: item.desc || '',
    qty: Number(item.qty) || 1,
    unit: item.unit || 'sq.m',
    rate: Number(item.rate) || 0,
    amount: (Number(item.qty) || 1) * (Number(item.rate) || 0)
  })) : [];

  setDocumentType(q.doc_type || 'quotation', false);
  setDocumentTemplate(q.template_theme || 'modern');
  setBillingMode(q.billing_mode || 'sqm_rate');

  $('cloudModal').classList.add('hidden');
  showToast(`📂 Loaded ${DOC_TYPES[q.doc_type || 'quotation'].name} for ${q.client_name || 'Client'}!`);
}

async function deleteQuotationById(id) {
  if (!confirm('Are you sure you want to delete this saved quotation?')) return;

  if (supabaseClient) {
    try {
      await supabaseClient.from('quotations').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  try {
    let localQuotes = JSON.parse(localStorage.getItem(localQuotesKey) || '[]');
    localQuotes = localQuotes.filter(q => q.id !== id);
    localStorage.setItem(localQuotesKey, JSON.stringify(localQuotes));
  } catch {}

  showToast('🗑️ Quotation deleted from database.');
  fetchSavedQuotations();
}

/* --- AI Logo Studio Inline Box & Controls --- */
function openAiLogoStudio() {
  const inlineBox = $('inlineAiStudioBox');
  if (inlineBox) {
    inlineBox.classList.remove('hidden');
    renderAiVariationsGrid();
    initOpenAiApiKey();
    inlineBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('✨ Opened AI Logo Studio (near controls)!');
  }
}

function closeInlineStudio() {
  const inlineBox = $('inlineAiStudioBox');
  if (inlineBox) {
    inlineBox.classList.add('hidden');
  }
}

function openLogoPreviewModal(styleId, seed) {
  const modal = $('logoPreviewModal');
  if (!modal) return;

  const compName = val('companyName') || 'Sri Balamurugan Fly Ash Bricks & Roadwork';
  const customLogoText = ($('companyLogoText') ? $('companyLogoText').value : '').trim();
  const monogram = generateMonogram(compName, customLogoText);
  const colorKey = ($('modalAiColorSelect') ? $('modalAiColorSelect').value : null) || val('aiLogoColor') || 'amber_slate';
  const symbolKey = ($('modalAiSymbolSelect') ? $('modalAiSymbolSelect').value : null) || val('aiLogoSymbol') || 'auto';

  const svg = generateAILogoSVG({
    name: compName,
    monogram,
    style: styleId,
    colorKey,
    symbolKey,
    seed: Number(seed) || 1
  });

  const stObj = AI_STYLES.find(s => s.id === styleId);
  if ($('previewModalTitle')) $('previewModalTitle').textContent = `🔍 ${stObj ? stObj.name : 'Logo'} Preview`;
  if ($('previewModalBrandCode')) $('previewModalBrandCode').textContent = monogram;
  if ($('previewModalCompName')) $('previewModalCompName').textContent = compName;

  const logoBox = $('previewModalLogoBox');
  if (logoBox) logoBox.innerHTML = svg;

  const miniLogo = $('previewModalMiniLogo');
  if (miniLogo) miniLogo.innerHTML = svg;

  if ($('previewModalApplyBtn')) {
    $('previewModalApplyBtn').onclick = () => {
      $('logoModeSelect').value = 'ai';
      if ($('aiLogoStyle')) $('aiLogoStyle').value = styleId;
      if ($('aiLogoSeed')) $('aiLogoSeed').value = seed;
      if ($('aiLogoColor')) $('aiLogoColor').value = colorKey;
      if ($('aiLogoSymbol')) $('aiLogoSymbol').value = symbolKey;
      if ($('aiCustomSvgData')) $('aiCustomSvgData').value = '';
      updatePreview();
      modal.classList.add('hidden');
      renderAiVariationsGrid();
      showToast(`✨ Applied "${stObj ? stObj.name : 'AI'}" logo to quotation!`);
    };
  }

  if ($('previewModalCopyBtn')) {
    $('previewModalCopyBtn').onclick = () => {
      navigator.clipboard.writeText(svg).then(() => showToast('📋 Copied SVG markup to clipboard!'));
    };
  }

  modal.classList.remove('hidden');
}

function renderAiVariationsGrid() {
  const container = $('inlineVariationsGrid') || $('aiVariationsGrid');
  if (!container) return;

  const compName = val('companyName') || 'Sri Balamurugan Fly Ash Bricks & Roadwork';
  const customLogoText = ($('companyLogoText') ? $('companyLogoText').value : '').trim();
  const monogram = generateMonogram(compName, customLogoText);
  const colorKey = ($('modalAiColorSelect') ? $('modalAiColorSelect').value : null) || val('aiLogoColor') || 'amber_slate';
  const symbolKey = ($('modalAiSymbolSelect') ? $('modalAiSymbolSelect').value : null) || val('aiLogoSymbol') || 'auto';
  const seed = Number(val('aiLogoSeed')) || 1;
  const currentStyle = val('aiLogoStyle') || 'industrial';

  const variations = AI_STYLES.map((st, idx) => {
    const cardSeed = seed + idx * 7;
    const svg = generateAILogoSVG({
      name: compName,
      monogram,
      style: st.id,
      colorKey,
      symbolKey,
      seed: cardSeed
    });
    const isActive = (val('logoModeSelect') === 'ai' || (val('logoModeSelect') === 'image' && !val('companyLogoImgUrl'))) && currentStyle === st.id;
    return {
      styleId: st.id,
      styleName: st.name,
      badge: st.badge,
      seed: cardSeed,
      svg,
      isActive
    };
  });

  container.innerHTML = variations.map(v => `
    <div class="ai-card ${v.isActive ? 'active' : ''}" data-ai-style="${v.styleId}" data-ai-seed="${v.seed}">
      <div class="ai-card-preview" title="Click to view full preview">${v.svg}</div>
      <div class="ai-card-title" title="${esc(v.styleName)}">${v.styleName}</div>
      <div class="ai-card-badge">${v.badge}</div>
      <div class="ai-card-actions">
        <button type="button" class="btn small outline btn-preview-logo" data-ai-style="${v.styleId}" data-ai-seed="${v.seed}" title="Preview in large modal">
          👁️ View
        </button>
        <button type="button" class="btn small ${v.isActive ? 'primary' : 'outline'} btn-apply-logo" data-ai-style="${v.styleId}" data-ai-seed="${v.seed}">
          ${v.isActive ? '✓ Active' : 'Apply'}
        </button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.ai-card-preview, .btn-preview-logo').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = el.closest('.ai-card');
      if (card) {
        openLogoPreviewModal(card.dataset.aiStyle, card.dataset.aiSeed);
      }
    });
  });

  container.querySelectorAll('.btn-apply-logo').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.ai-card');
      const selectedStyle = card.dataset.aiStyle;
      const selectedSeed = card.dataset.aiSeed;

      $('logoModeSelect').value = 'ai';
      if ($('aiLogoStyle')) $('aiLogoStyle').value = selectedStyle;
      if ($('aiLogoSeed')) $('aiLogoSeed').value = selectedSeed;
      if ($('aiLogoColor')) $('aiLogoColor').value = colorKey;
      if ($('aiLogoSymbol')) $('aiLogoSymbol').value = symbolKey;
      if ($('aiCustomSvgData')) $('aiCustomSvgData').value = '';

      updatePreview();
      renderAiVariationsGrid();
      showToast(`✨ Applied "${card.querySelector('.ai-card-title').textContent}" AI logo!`);
    });
  });
}

/* --- Event Handlers & Initialization --- */
fields.forEach(id => {
  const el = $(id);
  if (el) {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  }
});

const logoInput = $('companyLogoText');
if (logoInput) {
  ['input', 'keyup', 'change', 'paste'].forEach(evt => {
    logoInput.addEventListener(evt, updatePreview);
  });
}

const companyNameInput = $('companyName');
if (companyNameInput) {
  ['input', 'keyup', 'change', 'paste'].forEach(evt => {
    companyNameInput.addEventListener(evt, () => {
      updatePreview();
      if ($('aiLogoModal') && !$('aiLogoModal').classList.contains('hidden')) {
        renderAiVariationsGrid();
      }
    });
  });
}

const logoModeSelect = $('logoModeSelect');
if (logoModeSelect) {
  logoModeSelect.addEventListener('change', updatePreview);
}

const logoImgInput = $('companyLogoImgUrl');
if (logoImgInput) {
  ['input', 'keyup', 'change', 'paste'].forEach(evt => {
    logoImgInput.addEventListener(evt, updatePreview);
  });
}

const logoFileInput = $('logoFileInput');
if (logoFileInput) {
  logoFileInput.addEventListener('change', e => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        if ($('companyLogoImgUrl')) $('companyLogoImgUrl').value = ev.target.result;
        if ($('logoModeSelect')) $('logoModeSelect').value = 'image';
        updatePreview();
        showToast('🖼️ Logo image uploaded!');
      };
      reader.readAsDataURL(file);
    }
  });
}

// Segmented Logo Mode Pills
document.querySelectorAll('.logo-mode-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const targetMode = pill.dataset.mode;
    if ($('logoModeSelect')) $('logoModeSelect').value = targetMode;
    updatePreview();
    if (targetMode === 'ai') {
      showToast('🤖 AI Smart Logo Mode active!');
    }
  });
});

if ($('headerAiLogoBtn')) {
  $('headerAiLogoBtn').addEventListener('click', openAiLogoStudio);
}

// AI Logo Quick Controls
if ($('aiLogoStyle')) $('aiLogoStyle').addEventListener('change', updatePreview);
if ($('aiLogoColor')) $('aiLogoColor').addEventListener('change', updatePreview);
if ($('aiLogoSymbol')) $('aiLogoSymbol').addEventListener('change', updatePreview);

if ($('aiRegenBtn')) {
  $('aiRegenBtn').addEventListener('click', () => {
    const currentSeed = Number(val('aiLogoSeed')) || 1;
    $('aiLogoSeed').value = currentSeed + 1;
    $('aiCustomSvgData').value = '';
    updatePreview();
    showToast('🎲 Generated fresh AI logo variation!');
  });
}

if ($('openAiStudioBtn')) {
  $('openAiStudioBtn').addEventListener('click', openAiLogoStudio);
}

if ($('closePreviewModalBtn')) {
  $('closePreviewModalBtn').addEventListener('click', () => {
    $('logoPreviewModal').classList.add('hidden');
  });
}

if ($('logoPreviewModal')) {
  $('logoPreviewModal').addEventListener('click', e => {
    if (e.target === $('logoPreviewModal')) {
      $('logoPreviewModal').classList.add('hidden');
    }
  });
}

if ($('previewBgDarkBtn')) {
  $('previewBgDarkBtn').addEventListener('click', () => {
    const box = $('previewModalLogoBox');
    if (box) box.style.background = '#0f172a';
    $('previewBgDarkBtn').classList.add('active');
    $('previewBgLightBtn').classList.remove('active');
  });
}

if ($('previewBgLightBtn')) {
  $('previewBgLightBtn').addEventListener('click', () => {
    const box = $('previewModalLogoBox');
    if (box) box.style.background = '#ffffff';
    $('previewBgLightBtn').classList.add('active');
    $('previewBgDarkBtn').classList.remove('active');
  });
}

if ($('closeAiModalBtn')) {
  $('closeAiModalBtn').addEventListener('click', () => {
    $('aiLogoModal').classList.add('hidden');
  });
}

if ($('aiLogoModal')) {
  $('aiLogoModal').addEventListener('click', e => {
    if (e.target === $('aiLogoModal')) {
      $('aiLogoModal').classList.add('hidden');
    }
  });
}

// OpenAI API Key management
function initOpenAiApiKey() {
  const savedKey = localStorage.getItem(openAiKeyStorage) || '';
  if ($('openAiApiKey') && savedKey) {
    $('openAiApiKey').value = savedKey;
  }
}

if ($('saveApiKeyBtn')) {
  $('saveApiKeyBtn').addEventListener('click', () => {
    const key = ($('openAiApiKey') ? $('openAiApiKey').value : '').trim();
    if (key) {
      localStorage.setItem(openAiKeyStorage, key);
      showToast('🔑 OpenAI API Key saved safely in browser!');
    } else {
      localStorage.removeItem(openAiKeyStorage);
      showToast('API Key cleared.');
    }
  });
}

if ($('toggleApiKeyVisibilityBtn')) {
  $('toggleApiKeyVisibilityBtn').addEventListener('click', () => {
    const inp = $('openAiApiKey');
    if (inp) {
      inp.type = inp.type === 'password' ? 'text' : 'password';
    }
  });
}

// Inline AI Studio Tab Switcher (Near controls)
function switchInlineAiTab(activeTabId) {
  const tabs = [
    { btn: $('inlineTabPresetsBtn'), content: $('inlineTabPresetsContent'), id: 'presets' },
    { btn: $('inlineTabChatGptBtn'), content: $('inlineTabChatGptContent'), id: 'chatgpt' },
    { btn: $('inlineTabCustomBtn'), content: $('inlineTabCustomContent'), id: 'custom' }
  ];

  tabs.forEach(t => {
    if (t.btn && t.content) {
      if (t.id === activeTabId) {
        t.btn.classList.add('active');
        t.content.classList.remove('hidden');
      } else {
        t.btn.classList.remove('active');
        t.content.classList.add('hidden');
      }
    }
  });

  if (activeTabId === 'presets') renderAiVariationsGrid();
  if (activeTabId === 'chatgpt') initOpenAiApiKey();
}

if ($('inlineTabPresetsBtn')) $('inlineTabPresetsBtn').addEventListener('click', () => switchInlineAiTab('presets'));
if ($('inlineTabChatGptBtn')) $('inlineTabChatGptBtn').addEventListener('click', () => switchInlineAiTab('chatgpt'));
if ($('inlineTabCustomBtn')) $('inlineTabCustomBtn').addEventListener('click', () => switchInlineAiTab('custom'));
if ($('closeInlineStudioBtn')) $('closeInlineStudioBtn').addEventListener('click', closeInlineStudio);

if ($('inlineRerollBtn')) {
  $('inlineRerollBtn').addEventListener('click', () => {
    const newSeed = Math.floor(Math.random() * 500) + 1;
    $('aiLogoSeed').value = newSeed;
    renderAiVariationsGrid();
    updatePreview();
    showToast('🎲 Re-rolled all 6 logo designs!');
  });
}

// Engine selection toggle (show/hide OpenAI API key row)
if ($('chatGptEngineSelect')) {
  $('chatGptEngineSelect').addEventListener('change', () => {
    const val = $('chatGptEngineSelect').value;
    const keyRow = $('openAiKeyRow');
    if (keyRow) {
      if (val === 'openai-api') {
        keyRow.classList.remove('hidden');
      } else {
        keyRow.classList.add('hidden');
      }
    }
  });
}

if ($('modalAiSymbolSelect')) {
  $('modalAiSymbolSelect').addEventListener('change', () => {
    if ($('aiLogoSymbol')) $('aiLogoSymbol').value = $('modalAiSymbolSelect').value;
    renderAiVariationsGrid();
  });
}

if ($('modalAiColorSelect')) {
  $('modalAiColorSelect').addEventListener('change', () => {
    if ($('aiLogoColor')) $('aiLogoColor').value = $('modalAiColorSelect').value;
    renderAiVariationsGrid();
  });
}

if ($('modalRerollAllBtn')) {
  $('modalRerollAllBtn').addEventListener('click', () => {
    const newSeed = Math.floor(Math.random() * 500) + 1;
    $('aiLogoSeed').value = newSeed;
    renderAiVariationsGrid();
    updatePreview();
    showToast('🎲 Re-rolled all AI logo designs!');
  });
}

document.querySelectorAll('.ai-industry-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const ind = pill.dataset.industry;
    if (ind === 'bricks') {
      if ($('modalAiSymbolSelect')) $('modalAiSymbolSelect').value = 'bricks';
      if ($('modalAiColorSelect')) $('modalAiColorSelect').value = 'amber_slate';
      if ($('aiLogoSymbol')) $('aiLogoSymbol').value = 'bricks';
      if ($('aiLogoColor')) $('aiLogoColor').value = 'amber_slate';
    } else if (ind === 'civil') {
      if ($('modalAiSymbolSelect')) $('modalAiSymbolSelect').value = 'crane';
      if ($('modalAiColorSelect')) $('modalAiColorSelect').value = 'amber_slate';
      if ($('aiLogoSymbol')) $('aiLogoSymbol').value = 'crane';
    } else if (ind === 'architecture') {
      if ($('modalAiSymbolSelect')) $('modalAiSymbolSelect').value = 'building';
      if ($('modalAiColorSelect')) $('modalAiColorSelect').value = 'sapphire_silver';
      if ($('aiLogoSymbol')) $('aiLogoSymbol').value = 'building';
      if ($('aiLogoColor')) $('aiLogoColor').value = 'sapphire_silver';
    } else if (ind === 'eco') {
      if ($('modalAiSymbolSelect')) $('modalAiSymbolSelect').value = 'eco';
      if ($('modalAiColorSelect')) $('modalAiColorSelect').value = 'emerald_carbon';
      if ($('aiLogoSymbol')) $('aiLogoSymbol').value = 'eco';
      if ($('aiLogoColor')) $('aiLogoColor').value = 'emerald_carbon';
    }
    renderAiVariationsGrid();
  });
});

if ($('switchBackToAiBtn')) {
  $('switchBackToAiBtn').addEventListener('click', () => {
    $('logoModeSelect').value = 'ai';
    updatePreview();
    openAiLogoStudio();
  });
}

// ChatGPT Prompt Copier for chatgpt.com
if ($('copyChatGptPromptBtn')) {
  $('copyChatGptPromptBtn').addEventListener('click', () => {
    const compName = val('companyName') || 'Sri Balamurugan Fly Ash Bricks & Roadwork';
    const monogram = generateMonogram(compName, val('companyLogoText'));
    const tone = ($('chatGptToneSelect') ? $('chatGptToneSelect').value : 'Modern Civil & Construction Emblem');
    const customExtra = ($('chatGptCustomPrompt') ? $('chatGptCustomPrompt').value : '').trim();

    const masterPrompt = `You are an elite graphic designer and SVG vector brand engineer.
Create a modern, luxury company logo for:
• Company Name: "${compName}"
• Monogram: "${monogram}"
• Style: ${tone.replace('_', ' ')}
${customExtra ? `• Additional Instructions: ${customExtra}` : ''}

Output Requirement:
Please write clean, self-contained SVG code formatted with:
1. <svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
2. Vibrant gradients (<linearGradient>), rounded badge framing, clean construction/civil vector elements, and bold monogram letters "${monogram}".
3. Return STRICTLY pure SVG markup without markdown or commentary so I can paste it into my invoice software.`;

    navigator.clipboard.writeText(masterPrompt).then(() => {
      showToast('📋 Copied master prompt! Paste it into ChatGPT.com');
    }).catch(() => {
      showToast('Prompt copied to clipboard!');
    });
  });
}

// Generate with ChatGPT (Free GPT-4o Vector Engine or OpenAI Account)
if ($('generateWithChatGptBtn')) {
  $('generateWithChatGptBtn').addEventListener('click', async () => {
    const engine = ($('chatGptEngineSelect') ? $('chatGptEngineSelect').value : 'free-gpt-4o');
    const compName = val('companyName') || 'Sri Balamurugan Fly Ash Bricks & Roadwork';
    const monogram = generateMonogram(compName, val('companyLogoText'));
    const tone = ($('chatGptToneSelect') ? $('chatGptToneSelect').value : 'modern_construction');
    const customPrompt = ($('chatGptCustomPrompt') ? $('chatGptCustomPrompt').value : '').trim();

    const loadingBox = $('chatGptLoadingBox');
    const resultBox = $('chatGptResultBox');
    const previewHolder = $('chatGptPreviewHolder');
    const statusMsg = $('chatGptStatusMsg');
    const loadingText = $('chatGptLoadingText');

    if (resultBox) resultBox.classList.add('hidden');
    if (loadingBox) loadingBox.classList.remove('hidden');
    if (loadingText) loadingText.textContent = 'ChatGPT (GPT-4o) is designing your logo...';

    try {
      if (engine === 'free-diffusion') {
        // Free AI Diffusion Graphic
        const seed = Math.floor(Math.random() * 999999);
        const fullPrompt = `${compName} ${tone.replace('_', ' ')} ${customPrompt} minimalist vector company logo emblem on solid white background`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=256&height=256&nologo=true&seed=${seed}`;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (loadingBox) loadingBox.classList.add('hidden');
          if (resultBox) resultBox.classList.remove('hidden');
          previewHolder.innerHTML = `<img src="${imageUrl}" style="width:120px;height:120px;border-radius:12px;object-fit:cover;box-shadow:0 4px 14px rgba(0,0,0,0.15);" alt="AI Logo" />`;
          statusMsg.textContent = `✨ Free AI Diffusion created a custom logo for ${compName}!`;

          $('applyChatGptLogoBtn').onclick = () => {
            $('companyLogoImgUrl').value = imageUrl;
            $('logoModeSelect').value = 'image';
            updatePreview();
            showToast('✅ Applied ChatGPT AI Image Logo!');
          };
          if ($('copyChatGptSvgBtn')) $('copyChatGptSvgBtn').style.display = 'none';
        };
        img.onerror = () => {
          if (loadingBox) loadingBox.classList.add('hidden');
          showToast('Image service offline. Please try the Free GPT-4o Vector engine.', 'error');
        };
        img.src = imageUrl;
        return;
      }

      let cleanSvg = '';

      if (engine === 'openai-api') {
        // Direct OpenAI API Key
        const apiKey = (($('openAiApiKey') ? $('openAiApiKey').value : '') || localStorage.getItem(openAiKeyStorage) || '').trim();
        if (!apiKey) {
          throw new Error('Please enter your OpenAI API key or select "Free GPT-4o Vector SVG" from the dropdown.');
        }

        const systemPrompt = `You are an elite vector logo artist and SVG programmer.
You must output ONLY valid, self-contained SVG markup starting with <svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"> and ending with </svg>.
Do NOT include markdown formatting, backticks, or explanation.
Use <linearGradient> with unique IDs, clean geometric civil/construction/infrastructure silhouettes, professional badges/shields, and monogram "${monogram}".`;

        const userPrompt = `Generate a high-end vector logo for "${compName}" (Monogram: "${monogram}"). Tone: ${tone}. ${customPrompt ? `Specs: ${customPrompt}` : ''}. Output raw SVG only.`;

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `OpenAI API error (${res.status})`);
        }

        const data = await res.json();
        let rawSvg = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (!rawSvg) throw new Error('No SVG returned from OpenAI.');

        rawSvg = rawSvg.replace(/```xml/gi, '').replace(/```svg/gi, '').replace(/```/g, '').trim();
        const svgStart = rawSvg.indexOf('<svg');
        const svgEnd = rawSvg.lastIndexOf('</svg>');
        if (svgStart === -1 || svgEnd === -1) throw new Error('Invalid SVG returned from OpenAI.');
        cleanSvg = rawSvg.substring(svgStart, svgEnd + 6);

      } else {
        // Free GPT-4o Vector SVG Engine (No API Key Required)
        const promptInstruction = `Create a standalone valid SVG logo for "${compName}" (Monogram "${monogram}"), style ${tone}. ${customPrompt}. Output ONLY raw <svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">...</svg> with gradients and modern geometry. No markdown backticks.`;

        try {
          const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(promptInstruction)}?model=openai&seed=${Math.floor(Math.random()*9999)}`);
          if (!res.ok) throw new Error('Free GPT service busy.');
          let text = await res.text();
          text = text.replace(/```xml/gi, '').replace(/```svg/gi, '').replace(/```/g, '').trim();
          const svgStart = text.indexOf('<svg');
          const svgEnd = text.lastIndexOf('</svg>');
          if (svgStart !== -1 && svgEnd !== -1) {
            cleanSvg = text.substring(svgStart, svgEnd + 6);
          } else {
            throw new Error('SVG format fallback');
          }
        } catch {
          // Fallback to our procedural vector engine with custom detected styling!
          let detectedStyle = 'industrial';
          if (tone.includes('hexagon') || tone.includes('shield')) detectedStyle = 'hexagon';
          else if (tone.includes('luxury') || tone.includes('crest')) detectedStyle = 'gold_crest';
          else if (tone.includes('minimal')) detectedStyle = 'minimal_badge';
          else if (tone.includes('eco')) detectedStyle = 'eco_infra';

          const detectedSymbol = detectIndustryKeywords(tone + ' ' + customPrompt + ' ' + compName);
          cleanSvg = generateAILogoSVG({
            name: compName,
            monogram,
            style: detectedStyle,
            colorKey: 'amber_slate',
            symbolKey: detectedSymbol,
            seed: Math.floor(Math.random() * 1000) + 1
          });
        }
      }

      if (loadingBox) loadingBox.classList.add('hidden');
      if (resultBox) resultBox.classList.remove('hidden');

      previewHolder.innerHTML = `<div class="ai-card-preview" style="width:120px;height:120px;border-radius:12px;">${cleanSvg}</div>`;
      statusMsg.textContent = `✨ ChatGPT (GPT-4o) crafted a custom vector SVG logo for ${compName}!`;

      $('applyChatGptLogoBtn').onclick = () => {
        $('aiCustomSvgData').value = cleanSvg;
        $('logoModeSelect').value = 'ai';
        updatePreview();
        showToast('✅ Applied ChatGPT Vector Logo to Quotation!');
      };

      if ($('copyChatGptSvgBtn')) {
        $('copyChatGptSvgBtn').style.display = '';
        $('copyChatGptSvgBtn').onclick = () => {
          navigator.clipboard.writeText(cleanSvg).then(() => showToast('📋 Copied SVG code to clipboard!'));
        };
      }

    } catch (err) {
      if (loadingBox) loadingBox.classList.add('hidden');
      showToast(`ChatGPT Error: ${err.message}`, 'error');
    }
  });
}

// Paste output directly from ChatGPT.com
if ($('applyPastedChatGptBtn')) {
  $('applyPastedChatGptBtn').addEventListener('click', () => {
    const input = ($('pasteChatGptInput') ? $('pasteChatGptInput').value : '').trim();
    if (!input) {
      showToast('Please paste SVG markup or an image URL.', 'error');
      return;
    }

    if (input.includes('<svg') && input.includes('</svg>')) {
      const svgStart = input.indexOf('<svg');
      const svgEnd = input.lastIndexOf('</svg>');
      const cleanSvg = input.substring(svgStart, svgEnd + 6);
      $('aiCustomSvgData').value = cleanSvg;
      $('logoModeSelect').value = 'ai';
      updatePreview();
      showToast('✅ Applied pasted ChatGPT Vector SVG Logo!');
    } else if (input.startsWith('http://') || input.startsWith('https://') || input.startsWith('data:image/')) {
      $('companyLogoImgUrl').value = input;
      $('logoModeSelect').value = 'image';
      updatePreview();
      showToast('✅ Applied pasted ChatGPT Image Logo!');
    } else {
      showToast('Invalid input. Please paste valid <svg> code or an image URL.', 'error');
    }
  });
}

// Procedural vector from custom prompt
if ($('generateCustomVectorBtn')) {
  $('generateCustomVectorBtn').addEventListener('click', () => {
    const prompt = ($('customAiPromptInput') ? $('customAiPromptInput').value : '').toLowerCase();
    const compName = val('companyName') || 'Sri Balamurugan Fly Ash Bricks & Roadwork';
    const monogram = generateMonogram(compName, $('companyLogoText') ? $('companyLogoText').value : '');

    let detectedStyle = 'industrial';
    if (prompt.includes('hexagon') || prompt.includes('shield')) detectedStyle = 'hexagon';
    else if (prompt.includes('blueprint') || prompt.includes('architect') || prompt.includes('structure')) detectedStyle = 'architectural';
    else if (prompt.includes('gold') || prompt.includes('crest') || prompt.includes('luxury') || prompt.includes('seal') || prompt.includes('crown')) detectedStyle = 'gold_crest';
    else if (prompt.includes('gradient') || prompt.includes('tech') || prompt.includes('future') || prompt.includes('dynamic')) detectedStyle = 'gradient_tech';
    else if (prompt.includes('eco') || prompt.includes('green') || prompt.includes('nature') || prompt.includes('leaf')) detectedStyle = 'eco_infra';
    else if (prompt.includes('minimal') || prompt.includes('clean') || prompt.includes('swiss') || prompt.includes('badge')) detectedStyle = 'minimal_badge';

    let detectedColor = 'amber_slate';
    if (prompt.includes('blue') || prompt.includes('sapphire') || prompt.includes('silver')) detectedColor = 'sapphire_silver';
    else if (prompt.includes('green') || prompt.includes('emerald') || prompt.includes('eco')) detectedColor = 'emerald_carbon';
    else if (prompt.includes('red') || prompt.includes('crimson') || prompt.includes('ruby')) detectedColor = 'crimson_bronze';
    else if (prompt.includes('purple') || prompt.includes('royal')) detectedColor = 'purple_platinum';
    else if (prompt.includes('white') || prompt.includes('black') || prompt.includes('mono') || prompt.includes('charcoal')) detectedColor = 'charcoal_mono';

    let detectedSymbol = detectIndustryKeywords(prompt + ' ' + compName);

    const newSeed = Math.floor(Math.random() * 1000) + 1;
    const svg = generateAILogoSVG({
      name: compName,
      monogram,
      style: detectedStyle,
      colorKey: detectedColor,
      symbolKey: detectedSymbol,
      seed: newSeed
    });

    const resultBox = $('customAiResultBox');
    const previewHolder = $('customAiPreviewHolder');
    const statusMsg = $('customAiStatusMsg');

    if (resultBox && previewHolder && statusMsg) {
      resultBox.classList.remove('hidden');
      previewHolder.innerHTML = `<div class="ai-card-preview" style="width:110px;height:110px;">${svg}</div>`;
      statusMsg.textContent = `Generated ${detectedStyle.replace('_', ' ')} vector mark with ${detectedColor.replace('_', ' ')} theme.`;

      $('applyCustomAiBtn').onclick = () => {
        $('logoModeSelect').value = 'ai';
        $('aiLogoStyle').value = detectedStyle;
        $('aiLogoColor').value = detectedColor;
        $('aiLogoSymbol').value = detectedSymbol;
        $('aiLogoSeed').value = newSeed;
        $('aiCustomSvgData').value = '';
        updatePreview();
        $('aiLogoModal').classList.add('hidden');
        showToast('✅ Applied Custom Vector AI Logo!');
      };
    }
  });
}

// AI Diffusion Image generator via Pollinations AI
if ($('generateAiDiffusionBtn')) {
  $('generateAiDiffusionBtn').addEventListener('click', () => {
    const compName = val('companyName') || 'SBFB Construction';
    const prompt = ($('customAiPromptInput') ? $('customAiPromptInput').value : '').trim() ||
      `Modern vector company logo for ${compName}, clean industrial construction and bricks emblem`;

    const resultBox = $('customAiResultBox');
    const previewHolder = $('customAiPreviewHolder');
    const statusMsg = $('customAiStatusMsg');

    if (!resultBox || !previewHolder || !statusMsg) return;

    resultBox.classList.remove('hidden');
    previewHolder.innerHTML = `<div class="ai-spinner"></div>`;
    statusMsg.textContent = 'Generating AI diffusion logo... please wait a moment.';

    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ' minimalist vector logo graphic mark on dark background')}?width=256&height=256&nologo=true&seed=${seed}`;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      previewHolder.innerHTML = `<img src="${imageUrl}" style="width:110px;height:110px;border-radius:12px;object-fit:cover;box-shadow:0 4px 12px rgba(0,0,0,0.15);" alt="AI Logo" />`;
      statusMsg.textContent = '✨ AI Diffusion logo generated successfully!';

      $('applyCustomAiBtn').onclick = () => {
        $('companyLogoImgUrl').value = imageUrl;
        $('logoModeSelect').value = 'image';
        updatePreview();
        $('aiLogoModal').classList.add('hidden');
        showToast('✅ Applied AI Diffusion Image Logo!');
      };
    };
    img.onerror = () => {
      previewHolder.innerHTML = `<div style="color:#64748b;font-size:12px;margin-bottom:8px;">Network image service offline. Switched to procedural vector generator!</div>`;
      if ($('generateCustomVectorBtn')) $('generateCustomVectorBtn').click();
    };
    img.src = imageUrl;
  });
}

const setTodayBtn = $('setTodayBtn');
if (setTodayBtn) {
  setTodayBtn.addEventListener('click', () => {
    $('quoteDate').value = today();
    updatePreview();
    showToast('📅 Date set to Today.');
  });
}

if ($('autoGenNoBtn')) {
  $('autoGenNoBtn').addEventListener('click', autoGenerateNumber);
}

// Document Type Toggle Buttons
document.querySelectorAll('.doc-type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setDocumentType(btn.dataset.doctype, true);
    showToast(`Switched mode to ${DOC_TYPES[btn.dataset.doctype].name}!`);
  });
});

// Template Design Switcher Buttons
document.querySelectorAll('.template-pill-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setDocumentTemplate(btn.dataset.tpl);
    showToast(`🎨 Template set to "${TEMPLATES[btn.dataset.tpl].name}"!`);
  });
});

// Billing Mode Switcher (Rate per Sq.M vs Qty x Rate)
if ($('modeSqmBtn')) {
  $('modeSqmBtn').addEventListener('click', () => {
    setBillingMode('sqm_rate');
    showToast('📐 Switched to Rate per Sq. Meter mode');
  });
}
if ($('modeQtyBtn')) {
  $('modeQtyBtn').addEventListener('click', () => {
    setBillingMode('qty_rate');
    showToast('📦 Switched to Quantity × Rate (Itemized Billing) mode');
  });
}

// Input change listeners for instant live preview updates
[
  'quoteNo', 'quoteDate', 'dueDate', 'paymentStatusSelect', 'paymentModeSelect', 'poNumber',
  'companyName', 'companyPhone', 'companyEmail', 'companyGst', 'companyAddress',
  'clientName', 'clientContact', 'clientPhone', 'projectName', 'siteLocation',
  'bankName', 'bankAccount', 'bankIfsc', 'bankBranch', 'bankUpi',
  'gstModeSelect', 'gstRate', 'discount', 'validity', 'paymentTerms', 'notes'
].forEach(id => {
  const el = $(id);
  if (el) {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  }
});

['showBankOnDoc', 'showPaymentStatusOnDoc', 'showPaymentTermsOnDoc', 'showNotesOnDoc'].forEach(id => {
  const el = $(id);
  if (el) {
    el.addEventListener('change', () => {
      updatePreview();
      const labels = {
        showBankOnDoc: 'Bank & UPI Details',
        showPaymentStatusOnDoc: 'Payment Status Stamp',
        showPaymentTermsOnDoc: 'Payment Terms',
        showNotesOnDoc: 'Notes & Declaration'
      };
      const name = labels[id] || 'Section';
      showToast(el.checked ? `✅ Included ${name} on document` : `🚫 Excluded ${name} from document`);
    });
  }
});

$('addItemBtn').addEventListener('click', () => {
  const mode = val('billingMode') || 'sqm_rate';
  if (mode === 'qty_rate') {
    addItem('New item / service', 450, 1, 'sq.m');
  } else {
    addItem('New work item', 450);
  }
});

$('saveCatalogBtn').addEventListener('click', syncCurrentQuoteToCatalog);
$('syncCatalogFromCurrentBtn').addEventListener('click', syncCurrentQuoteToCatalog);

$('addNewCatalogItemBtn').addEventListener('click', () => {
  const desc = $('newCatalogDesc').value.trim();
  const rate = Number($('newCatalogRate').value) || 0;
  if (!desc) {
    showToast('Please enter an item description.', 'error');
    return;
  }
  saveItemToCatalog(desc, rate, true);
  $('newCatalogDesc').value = '';
  $('newCatalogRate').value = '';
});

$('saveCompanyDefaultBtn').addEventListener('click', saveCompanyDefaults);
$('saveCloudBtn').addEventListener('click', saveQuotationToCloud);
$('printBtn').addEventListener('click', () => window.print());

// New document reset: saves previous draft and starts a clean blank document
$('resetBtn').addEventListener('click', async () => {
  // Automatically save current work to database if there's content
  if (items.length > 0 || (val('clientName') && val('clientName').trim()) || (val('projectName') && val('projectName').trim())) {
    try {
      await saveQuotationToCloud();
    } catch (e) {
      console.warn('Auto-save on reset error:', e);
    }
  }

  const docType = val('docType') || 'quotation';
  const conf = DOC_TYPES[docType] || DOC_TYPES.quotation;

  currentQuoteId = crypto.randomUUID();
  $('quoteDate').value = today();
  if ($('dueDate')) $('dueDate').value = '';
  if ($('poNumber')) $('poNumber').value = '';
  if ($('paymentStatusSelect')) $('paymentStatusSelect').value = docType === 'invoice' ? 'pending' : 'paid';

  $('clientName').value = '';
  $('clientContact').value = '';
  $('clientPhone').value = '';
  $('projectName').value = '';
  $('siteLocation').value = '';
  if ($('gstModeSelect')) $('gstModeSelect').value = '18';
  $('gstRate').value = 18;
  $('discount').value = 0;
  $('validity').value = 15;
  $('paymentTerms').value = conf.defaultTerms;
  $('notes').value = conf.defaultNotes;

  autoGenerateNumber();
  items = [];
  loadCompanyDefaults();
  renderItems();
  updatePreview();
  saveDraftState();
  showToast(`✨ Started a fresh new ${conf.name}.`);
});

// Cloud Modal Controls
$('cloudModalBtn').addEventListener('click', () => {
  $('cloudModal').classList.remove('hidden');
  fetchSavedQuotations();
  renderCatalogManager();
});

$('closeCloudModalBtn').addEventListener('click', () => {
  $('cloudModal').classList.add('hidden');
});

$('cloudModal').addEventListener('click', e => {
  if (e.target === $('cloudModal')) {
    $('cloudModal').classList.add('hidden');
  }
});

$('tabSavedBtn').addEventListener('click', () => {
  $('tabSavedBtn').classList.add('active');
  $('tabCatalogBtn').classList.remove('active');
  $('tabConfigBtn').classList.remove('active');
  $('tabSavedContent').classList.remove('hidden');
  $('tabCatalogContent').classList.add('hidden');
  $('tabConfigContent').classList.add('hidden');
  fetchSavedQuotations();
});

$('tabCatalogBtn').addEventListener('click', () => {
  $('tabCatalogBtn').classList.add('active');
  $('tabSavedBtn').classList.remove('active');
  $('tabConfigBtn').classList.remove('active');
  $('tabCatalogContent').classList.remove('hidden');
  $('tabSavedContent').classList.add('hidden');
  $('tabConfigContent').classList.add('hidden');
  renderCatalogManager();
});

$('tabConfigBtn').addEventListener('click', () => {
  $('tabConfigBtn').classList.add('active');
  $('tabSavedBtn').classList.remove('active');
  $('tabCatalogBtn').classList.remove('active');
  $('tabConfigContent').classList.remove('hidden');
  $('tabSavedContent').classList.add('hidden');
  $('tabCatalogContent').classList.add('hidden');
});

$('saveSupabaseConfigBtn').addEventListener('click', () => {
  const url = $('supabaseUrl').value.trim();
  const key = $('supabaseKey').value.trim();

  if (!url || !key) {
    showToast('Please enter both Supabase Project URL and Anon Key.', 'error');
    return;
  }

  localStorage.setItem(supabaseConfigKey, JSON.stringify({ url, key }));
  initSupabase();
  showToast('✅ Supabase configuration saved! Testing connection...');
  setTimeout(() => {
    fetchSavedQuotations();
    loadItemCatalog();
  }, 1000);
});

$('clearSupabaseConfigBtn').addEventListener('click', () => {
  localStorage.removeItem(supabaseConfigKey);
  supabaseClient = null;
  $('supabaseUrl').value = '';
  $('supabaseKey').value = '';
  const badge = $('cloudStatusBadge');
  if (badge) {
    badge.textContent = '● Local Database';
    badge.className = 'cloud-status-pill local';
  }
  showToast('Disconnected from Supabase. Running in local database mode.');
  fetchSavedQuotations();
  loadItemCatalog();
});

if ($('copySqlBtn')) {
  $('copySqlBtn').addEventListener('click', () => {
    const sql = $('sqlSchemaBox').textContent;
    navigator.clipboard.writeText(sql).then(() => {
      showToast('📋 SQL Schema copied to clipboard!');
    }).catch(() => {
      showToast('Could not copy automatically. Please select and copy the SQL box.', 'error');
    });
  });
}

$('searchQuoteInput').addEventListener('input', applyCloudFilterAndRender);
if ($('cloudDocFilter')) $('cloudDocFilter').addEventListener('change', applyCloudFilterAndRender);
$('refreshCloudListBtn').addEventListener('click', fetchSavedQuotations);

// Initialize on page load
loadDraftState();
loadItemCatalog();
initSupabase();
renderItems();
updatePreview();



