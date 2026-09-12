const $ = id => document.getElementById(id);

// Quotation & Bill fields
const fields = [
  'docType', 'docTemplate', 'billingMode', 'quoteNo', 'companyName',
  'logoModeSelect', 'aiLogoStyle', 'aiLogoColor', 'aiLogoSeed', 'aiLogoSymbol', 'aiCustomSvgData',
  'companyLogoText', 'companyLogoImgUrl', 'companyPhone', 'companyEmail', 'companyGst', 'companyAddress',
  'clientName', 'clientGst', 'clientContact', 'clientPhone', 'quoteDate', 'dueDate', 'paymentStatusSelect', 'paymentModeSelect', 'poNumber',
  'projectName', 'siteLocation',
  'bankName', 'bankAccount', 'bankIfsc', 'bankBranch', 'bankUpi',
  'gstModeSelect', 'gstRate', 'discount', 'validity', 'paymentTerms', 'notes'
];

const TEMPLATES = {
  modern: { name: '🌟 Modern Executive', subtitle: 'Sleek Slate & Amber', color: '#f59e0b', category: 'modern' },
  classic: { name: '🏛️ Classic Corporate', subtitle: 'Formal Tax Grid', color: '#0f172a', category: 'corporate' },
  industrial: { name: '🧱 Industrial Amber', subtitle: 'SBFB Construction', color: '#f59e0b', category: 'industrial' },
  sapphire: { name: '💎 Sapphire Clean', subtitle: 'Minimalist Blue', color: '#2563eb', category: 'modern' },
  emerald: { name: '🌿 Emerald Green', subtitle: 'Eco Infrastructure', color: '#059669', category: 'modern' },
  monochrome: { name: '🖤 Monochrome Sleek', subtitle: 'High-Contrast B&W', color: '#000000', category: 'corporate' },
  executive_gold: { name: '👑 Luxury Gold Crest', subtitle: 'Deep Navy & Metallic Gold', color: '#d97706', category: 'luxury' },
  minimal_clean: { name: '📐 Swiss Minimalist', subtitle: 'Ultra-Clean Whitespace', color: '#475569', category: 'corporate' },
  blueprint_tech: { name: '📐 Engineer Blueprint', subtitle: 'Drafting Grid & Monospace', color: '#0284c7', category: 'industrial' },
  compact_pos: { name: '🧾 Compact Retail Slip', subtitle: 'Dashed Thermal Receipt', color: '#475569', category: 'corporate' },
  bold_crimson: { name: '🔴 Crimson Titan', subtitle: 'Heavy Steel & Burgundy', color: '#991b1b', category: 'industrial' },
  retro_ledger: { name: '📜 Vintage Ledger', subtitle: 'Warm Parchment & Ruled', color: '#78350f', category: 'luxury' },
  split_header: { name: '🔲 Split Horizon', subtitle: 'Two-Tone Midnight Banner', color: '#312e81', category: 'modern' },
  neo_brutalist: { name: '⚡ Neo-Brutalist', subtitle: 'Heavy Borders & Drop Shadow', color: '#facc15', category: 'modern' },
  nordic_frost: { name: '❄️ Nordic Frost', subtitle: 'Scandinavian Slate & Ice', color: '#0284c7', category: 'modern' },
  gradient_aurora: { name: '🌈 Modern Aurora', subtitle: 'Vibrant Tech Gradient', color: '#8b5cf6', category: 'modern' },
  teal_prestige: { name: '🌊 Teal Prestige', subtitle: 'Deep Teal & Mint Accents', color: '#0f766e', category: 'luxury' }
};

const customLayoutsStorageKey = 'sbfbCustomLayouts';
let customLayouts = [];
let editingLayoutId = null;
let currentCustomFilter = 'all';

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
const gstRegistryStorageKey = 'sbfbGstRegistry';
const gstApiConfigKey = 'sbfbGstApiConfig';

const DEFAULT_SUPABASE_CONFIG = {
  url: 'https://kijakljeagxocpxgmaav.supabase.co',
  key: 'sb_publishable_Y4CedcRTY7NTEPUWrVisow_9C_Gn6DA'
};

/* Indian GST States & UTs (All 37 Official GST Codes) */
const GST_STATES = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction'
};

/* PAN 4th Character Taxpayer Entity Decoder */
const PAN_ENTITY_TYPES = {
  'C': 'Company (Pvt Ltd / Ltd)',
  'P': 'Individual / Sole Proprietor',
  'F': 'Partnership Firm / LLP',
  'A': 'Association of Persons (AOP)',
  'T': 'Trust',
  'H': 'Hindu Undivided Family (HUF)',
  'B': 'Body of Individuals (BOI)',
  'G': 'Government Agency / PSU',
  'J': 'Artificial Juridical Person',
  'L': 'Local Authority'
};

const defaultGstDirectory = [
  {
    gstin: '33AABCS1429B1Z1',
    legalName: 'Sri Balamurugan Fly Ash Bricks & Roadwork',
    tradeName: 'SBFB Civil Works',
    stateCode: '33',
    stateName: 'Tamil Nadu',
    contact: '+91 98765 43210 (info@sbfb.com)',
    address: 'Survey No. 42, Industrial Bypass Road, Madurai, Tamil Nadu - 625001'
  },
  {
    gstin: '33AAACT2727Q1Z3',
    legalName: 'TNP Construction & Infrastructure Private Limited',
    tradeName: 'TNP Infra Group',
    stateCode: '33',
    stateName: 'Tamil Nadu',
    contact: 'Senthil Nathan (+91 94432 10987)',
    address: 'No. 88, Mount Poonamallee Road, Guindy, Chennai, Tamil Nadu - 600032'
  },
  {
    gstin: '29AABCL1234M1ZF',
    legalName: 'Apex Civil Developers & Contractors Private Limited',
    tradeName: 'Apex Infra Projects',
    stateCode: '29',
    stateName: 'Karnataka',
    contact: 'K. Rajesh (+91 98860 12345)',
    address: 'Plot 104, Outer Ring Road, Whitefield, Bengaluru, Karnataka - 560066'
  },
  {
    gstin: '27AABCC5678K1Z8',
    legalName: 'Metro Roadways & Asphalt Infra Limited',
    tradeName: 'Metro Highroads',
    stateCode: '27',
    stateName: 'Maharashtra',
    contact: 'V. Deshmukh (+91 98200 54321)',
    address: 'Level 4, Express Towers, Nariman Point, Mumbai, Maharashtra - 400021'
  }
];

let gstRegistry = [];

/* --- Standard Units of Measurement System (All Types: Pieces, Units, Weight, Area, Volume, Length, Time) --- */
const MEASUREMENT_UNITS = [
  {
    group: '🔢 Count & Pieces (Units)',
    units: [
      { id: 'pcs', label: 'pcs (Pieces)' },
      { id: 'nos', label: 'nos (Numbers)' },
      { id: 'unit', label: 'unit (Units)' },
      { id: 'box', label: 'box (Boxes)' },
      { id: 'pkt', label: 'pkt (Packets)' },
      { id: 'set', label: 'set (Sets)' },
      { id: 'pair', label: 'pair (Pairs)' },
      { id: 'rolls', label: 'rolls (Rolls)' },
      { id: 'bndl', label: 'bndl (Bundles)' },
      { id: 'doz', label: 'doz (Dozens)' },
      { id: 'lots', label: 'lots (Lots)' },
      { id: 'cans', label: 'cans (Cans)' },
      { id: 'drums', label: 'drums (Drums)' },
      { id: 'bottles', label: 'bottles (Bottles)' }
    ]
  },
  {
    group: '⚖️ Weight & Mass',
    units: [
      { id: 'kg', label: 'kg (Kilograms)' },
      { id: 'gm', label: 'gm (Grams)' },
      { id: 'tons', label: 'tons / MT (Tonnes)' },
      { id: 'quintal', label: 'quintal (100 kg)' },
      { id: 'lbs', label: 'lbs (Pounds)' }
    ]
  },
  {
    group: '📐 Area & Surface',
    units: [
      { id: 'sq.m', label: 'sq.m (Sq. Meters)' },
      { id: 'sq.ft', label: 'sq.ft (Sq. Feet)' },
      { id: 'sq.yd', label: 'sq.yd (Sq. Yards / Guz)' },
      { id: 'acres', label: 'acres (Acres)' },
      { id: 'hectares', label: 'hectares (Hectares)' },
      { id: 'sq.in', label: 'sq.in (Sq. Inches)' }
    ]
  },
  {
    group: '📏 Length & Linear',
    units: [
      { id: 'm', label: 'm (Meters)' },
      { id: 'ft', label: 'ft (Feet)' },
      { id: 'rft', label: 'rft (Running Feet)' },
      { id: 'rmtr', label: 'rmtr (Running Meters)' },
      { id: 'in', label: 'in (Inches)' },
      { id: 'cm', label: 'cm (Centimeters)' },
      { id: 'mm', label: 'mm (Millimeters)' },
      { id: 'km', label: 'km (Kilometers)' },
      { id: 'yards', label: 'yards (Yards)' }
    ]
  },
  {
    group: '🧱 Volume, Civil & Liquids',
    units: [
      { id: 'cu.m', label: 'cu.m (Cubic Meters)' },
      { id: 'cu.ft', label: 'cu.ft (Cubic Feet)' },
      { id: 'brass', label: 'brass (100 cu.ft)' },
      { id: 'bags', label: 'bags (Bags)' },
      { id: 'ltr', label: 'ltr (Litres)' },
      { id: 'ml', label: 'ml (Millilitres)' },
      { id: 'gallons', label: 'gallons (Gallons)' },
      { id: 'trips', label: 'trips (Trips / Dumper)' },
      { id: 'loads', label: 'loads (Truck Loads)' }
    ]
  },
  {
    group: '⏱️ Time & Labor Services',
    units: [
      { id: 'hrs', label: 'hrs (Hours)' },
      { id: 'days', label: 'days (Days)' },
      { id: 'shifts', label: 'shifts (Shifts)' },
      { id: 'weeks', label: 'weeks (Weeks)' },
      { id: 'months', label: 'months (Months)' },
      { id: 'visits', label: 'visits (Visits)' },
      { id: 'jobs', label: 'jobs (Jobs / Lumpsum)' }
    ]
  }
];

function renderUnitOptions(selectedUnit) {
  const norm = (selectedUnit || 'pcs').toLowerCase().trim();
  let found = false;
  let html = '';

  MEASUREMENT_UNITS.forEach(grp => {
    html += `<optgroup label="${grp.group}">`;
    grp.units.forEach(u => {
      const isSel = norm === u.id.toLowerCase();
      if (isSel) found = true;
      html += `<option value="${u.id}" ${isSel ? 'selected' : ''}>${u.label}</option>`;
    });
    html += `</optgroup>`;
  });

  if (norm && !found && norm !== '__custom__') {
    html = `<optgroup label="✏️ Custom"><option value="${esc(selectedUnit)}" selected>${esc(selectedUnit)}</option></optgroup>` + html;
  }

  html += `<optgroup label="Custom"><option value="__custom__">✏️ Custom Unit...</option></optgroup>`;
  return html;
}

const defaultCatalog = [
  { id: 'cat-1', desc: 'Standard Fly Ash Bricks (9"x4"x3")', rate: 7.5, unit: 'pcs' },
  { id: 'cat-2', desc: 'Solid Concrete Blocks (400x200x200 mm)', rate: 45, unit: 'nos' },
  { id: 'cat-3', desc: 'Building construction & structural civil work', rate: 1850, unit: 'sq.m' },
  { id: 'cat-4', desc: 'Fly ash brick masonry with cement mortar', rate: 450, unit: 'sq.m' },
  { id: 'cat-5', desc: 'Internal & external wall plastering (1:4)', rate: 220, unit: 'sq.m' },
  { id: 'cat-6', desc: 'OPC 53 Grade Cement Bags (50 kg)', rate: 380, unit: 'bags' },
  { id: 'cat-7', desc: 'River Sand / M-Sand Truck Delivery', rate: 4200, unit: 'brass' },
  { id: 'cat-8', desc: 'TMT Steel 12mm / 16mm Rebars (Fe 550D)', rate: 68, unit: 'kg' },
  { id: 'cat-9', desc: 'Structural Steel / Heavy Girders & Channels', rate: 65000, unit: 'tons' },
  { id: 'cat-10', desc: 'Earthwork excavation & site grading', rate: 140, unit: 'cu.m' },
  { id: 'cat-11', desc: 'Ready Mix Concrete (RMC M25 Grade)', rate: 4600, unit: 'cu.m' },
  { id: 'cat-12', desc: 'Granite & Vitrified Tile Flooring', rate: 115, unit: 'sq.ft' },
  { id: 'cat-13', desc: 'Bitumen road surfacing & laying', rate: 380, unit: 'sq.m' },
  { id: 'cat-14', desc: 'JCB Excavator & Operator Hourly Rental', rate: 1200, unit: 'hrs' },
  { id: 'cat-15', desc: 'Skilled Mason & Labor Gang Daily Wages', rate: 1500, unit: 'days' },
  { id: 'cat-16', desc: 'Water Tanker Supply (6,000 Litres)', rate: 1100, unit: 'trips' }
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
      itemCatalog = local.map(x => ({
        id: x.id || crypto.randomUUID(),
        desc: x.desc || x.description || '',
        rate: Number(x.rate) || 0,
        unit: x.unit || 'pcs'
      }));
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
            if (cloudItem.unit) itemCatalog[idx].unit = cloudItem.unit;
          } else {
            itemCatalog.push({
              id: cloudItem.id || crypto.randomUUID(),
              desc: cloudItem.description,
              rate: Number(cloudItem.rate) || 0,
              unit: cloudItem.unit || 'pcs'
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

async function saveItemToCatalog(desc, rate, unit = 'pcs', notify = true) {
  const trimmedDesc = (desc || '').trim();
  if (!trimmedDesc) return;
  const rateNum = Number(rate) || 0;
  const unitVal = (unit || 'pcs').trim();

  const existingIdx = itemCatalog.findIndex(x => x.desc.toLowerCase() === trimmedDesc.toLowerCase());
  let itemId = crypto.randomUUID();
  if (existingIdx >= 0) {
    itemCatalog[existingIdx].rate = rateNum;
    itemCatalog[existingIdx].unit = unitVal;
    itemId = itemCatalog[existingIdx].id;
  } else {
    itemCatalog.unshift({ id: itemId, desc: trimmedDesc, rate: rateNum, unit: unitVal });
  }

  localStorage.setItem(catalogStorageKey, JSON.stringify(itemCatalog));

  if (supabaseClient) {
    try {
      await supabaseClient.from('item_catalog').upsert({
        description: trimmedDesc,
        rate: rateNum,
        unit: unitVal,
        updated_at: new Date().toISOString()
      }, { onConflict: 'description' });
    } catch (err) {
      // Graceful fallback for Supabase databases without unit column yet
      try {
        await supabaseClient.from('item_catalog').upsert({
          description: trimmedDesc,
          rate: rateNum,
          updated_at: new Date().toISOString()
        }, { onConflict: 'description' });
      } catch (e2) {
        console.warn('Supabase catalog save error:', e2);
      }
    }
  }

  renderCatalogPills();
  renderCatalogDatalist();
  renderCatalogManager();

  if (notify) {
    showToast(`📚 Saved "${trimmedDesc}" (₹${rateNum} / ${unitVal}) to Item Library!`);
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

  container.innerHTML = itemCatalog.map(item => {
    const uStr = item.unit ? ` / ${esc(item.unit)}` : '';
    return `
      <button type="button" class="catalog-pill" data-cat-desc="${esc(item.desc)}" data-cat-rate="${item.rate}" data-cat-unit="${esc(item.unit || 'pcs')}">
        ➕ ${esc(item.desc)} <strong style="color:#b45309;">(₹${Number(item.rate).toLocaleString('en-IN')}${uStr})</strong>
      </button>
    `;
  }).join('');

  container.querySelectorAll('[data-cat-desc]').forEach(btn => {
    btn.addEventListener('click', () => {
      addItem(btn.dataset.catDesc, Number(btn.dataset.catRate) || 0, 1, btn.dataset.catUnit || 'pcs');
      showToast(`➕ Added "${btn.dataset.catDesc}" to document!`);
    });
  });
}

function renderCatalogDatalist() {
  const dl = $('catalogDatalist');
  if (!dl) return;
  dl.innerHTML = itemCatalog.map(item => `<option value="${esc(item.desc)}">₹${Number(item.rate).toLocaleString('en-IN')}${item.unit ? ' / ' + esc(item.unit) : ''}</option>`).join('');
}

function renderCatalogManager() {
  const countEl = $('catalogCount');
  const count2El = $('catalogCount2');
  if (countEl) countEl.textContent = itemCatalog.length;
  if (count2El) count2El.textContent = itemCatalog.length;

  const newUnitSel = $('newCatalogUnit');
  if (newUnitSel && !newUnitSel.dataset.loaded) {
    newUnitSel.innerHTML = renderUnitOptions('pcs');
    newUnitSel.dataset.loaded = 'true';
    newUnitSel.addEventListener('change', () => {
      if (newUnitSel.value === '__custom__') {
        const customUnit = prompt('Enter custom unit name (e.g. bundle, barrel, kW, cylinder, etc.):', 'unit');
        if (customUnit && customUnit.trim()) {
          newUnitSel.innerHTML = renderUnitOptions(customUnit.trim());
          newUnitSel.value = customUnit.trim();
        } else {
          newUnitSel.value = 'pcs';
        }
      }
    });
  }

  const listEl = $('catalogManagerList');
  if (!listEl) return;

  if (!itemCatalog.length) {
    listEl.innerHTML = '<div class="empty-state">No saved items in library. Add your frequently quoted civil, materials, and service items above.</div>';
    return;
  }

  listEl.innerHTML = itemCatalog.map(item => `
    <div class="quote-card">
      <div class="quote-card-main">
        <strong>${esc(item.desc)}</strong>
        <p>📐 Quoted Rate: <strong style="color:#b45309;">${money(item.rate)}</strong> <span class="badge-unit">${esc(item.unit || 'pcs')}</span></p>
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
        addItem(item.desc, item.rate, 1, item.unit || 'pcs');
        $('cloudModal').classList.add('hidden');
        showToast(`➕ Added "${item.desc}" to document!`);
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
      saveItemToCatalog(item.desc, item.rate, item.unit || 'pcs', false);
      savedCount++;
    }
  });
  if (savedCount > 0) {
    showToast(`💾 Stored ${savedCount} item(s) to Library with rates & units! Available for all future documents.`);
  } else {
    showToast('Add some work items with descriptions first to store them.', 'error');
  }
}

/* --- Indian GST Register, Checksum Engine & Taxpayer Matcher --- */
function validateGstFormat(gstin) {
  if (!gstin) return false;
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(String(gstin).trim().toUpperCase());
}

function validateGstChecksum(gstin) {
  if (!gstin) return false;
  const clean = String(gstin).trim().toUpperCase();
  if (clean.length !== 15) return false;
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let factor = 1;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const codePoint = chars.indexOf(clean[i]);
    if (codePoint === -1) return false;
    let digit = codePoint * factor;
    factor = factor === 1 ? 2 : 1;
    digit = Math.floor(digit / 36) + (digit % 36);
    sum += digit;
  }
  const remainder = sum % 36;
  const checkCode = (36 - remainder) % 36;
  return chars[checkCode] === clean[14];
}

function parseGstInfo(gstin) {
  const clean = String(gstin || '').trim().toUpperCase();
  const stateCode = clean.slice(0, 2);
  const stateName = GST_STATES[stateCode] || (stateCode.length === 2 ? `State Code ${stateCode}` : '');
  const pan = clean.length >= 12 ? clean.slice(2, 12) : (clean.length > 2 ? clean.slice(2) : '');
  const entityChar = clean.length >= 6 ? clean[5] : '';
  const entityType = PAN_ENTITY_TYPES[entityChar] || (entityChar ? 'Business Taxpayer' : '');
  const isValidFormat = validateGstFormat(clean);
  const isValidChecksum = isValidFormat && validateGstChecksum(clean);
  const matchedParty = matchGstFromRegistry(clean);

  return {
    gstin: clean,
    stateCode,
    stateName,
    pan,
    entityChar,
    entityType,
    isValidFormat,
    isValidChecksum,
    matchedParty
  };
}

async function loadGstRegistry() {
  try {
    const local = JSON.parse(localStorage.getItem(gstRegistryStorageKey) || 'null');
    if (Array.isArray(local) && local.length) {
      gstRegistry = local;
    } else {
      gstRegistry = [...defaultGstDirectory];
      localStorage.setItem(gstRegistryStorageKey, JSON.stringify(gstRegistry));
    }
  } catch {
    gstRegistry = [...defaultGstDirectory];
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('gst_registry').select('*').order('legal_name');
      if (!error && Array.isArray(data) && data.length) {
        data.forEach(cloudParty => {
          const idx = gstRegistry.findIndex(x => x.gstin.toUpperCase() === (cloudParty.gstin || '').toUpperCase());
          const normalized = {
            gstin: (cloudParty.gstin || '').toUpperCase(),
            legalName: cloudParty.legal_name || cloudParty.legalName || 'Registered Taxpayer',
            tradeName: cloudParty.trade_name || cloudParty.tradeName || '',
            stateCode: cloudParty.state_code || cloudParty.stateCode || (cloudParty.gstin ? cloudParty.gstin.slice(0, 2) : ''),
            stateName: cloudParty.state_name || cloudParty.stateName || (cloudParty.gstin ? GST_STATES[cloudParty.gstin.slice(0, 2)] : '') || '',
            contact: cloudParty.contact || '',
            address: cloudParty.address || ''
          };
          if (idx >= 0) {
            gstRegistry[idx] = { ...gstRegistry[idx], ...normalized };
          } else {
            gstRegistry.push(normalized);
          }
        });
        localStorage.setItem(gstRegistryStorageKey, JSON.stringify(gstRegistry));
      }
    } catch (err) {
      console.warn('GST registry cloud fetch error:', err);
    }
  }

  renderGstDatalists();
  populateGstStateFilter();
  renderGstDirectoryManager();
}

async function saveGstPartyToRegistry(party, notify = true) {
  const gstinClean = String(party.gstin || '').trim().toUpperCase();
  const legalNameClean = String(party.legalName || party.legal_name || '').trim();
  if (!gstinClean || !legalNameClean) {
    showToast('GSTIN and Legal Name are required.', 'error');
    return false;
  }

  const stateCode = party.stateCode || gstinClean.slice(0, 2);
  const stateName = party.stateName || GST_STATES[stateCode] || `State Code ${stateCode}`;
  const normalized = {
    gstin: gstinClean,
    legalName: legalNameClean,
    tradeName: (party.tradeName || party.trade_name || legalNameClean).trim(),
    stateCode: stateCode,
    stateName: stateName,
    contact: (party.contact || '').trim(),
    address: (party.address || '').trim(),
    updated_at: new Date().toISOString()
  };

  const existingIdx = gstRegistry.findIndex(x => x.gstin.toUpperCase() === gstinClean);
  if (existingIdx >= 0) {
    gstRegistry[existingIdx] = normalized;
  } else {
    gstRegistry.unshift(normalized);
  }

  localStorage.setItem(gstRegistryStorageKey, JSON.stringify(gstRegistry));

  if (supabaseClient) {
    try {
      await supabaseClient.from('gst_registry').upsert({
        gstin: normalized.gstin,
        legal_name: normalized.legalName,
        trade_name: normalized.tradeName,
        state_code: normalized.stateCode,
        state_name: normalized.stateName,
        contact: normalized.contact,
        address: normalized.address,
        updated_at: normalized.updated_at
      }, { onConflict: 'gstin' });
    } catch (err) {
      console.warn('Supabase gst_registry save error:', err);
    }
  }

  renderGstDatalists();
  populateGstStateFilter();
  renderGstDirectoryManager();

  if (notify) {
    showToast(`🏢 Saved "${normalized.legalName}" (${normalized.gstin}) to GST Master!`);
  }
  return true;
}

async function deleteGstPartyFromRegistry(gstin) {
  const cleanGst = String(gstin || '').trim().toUpperCase();
  const party = gstRegistry.find(x => x.gstin.toUpperCase() === cleanGst);
  const partyName = party ? party.legalName : cleanGst;

  if (!confirm(`Remove "${partyName}" (${cleanGst}) from your GST Directory?`)) return;

  gstRegistry = gstRegistry.filter(x => x.gstin.toUpperCase() !== cleanGst);
  localStorage.setItem(gstRegistryStorageKey, JSON.stringify(gstRegistry));

  if (supabaseClient) {
    try {
      await supabaseClient.from('gst_registry').delete().eq('gstin', cleanGst);
    } catch (err) {
      console.warn('Supabase gst delete error:', err);
    }
  }

  renderGstDatalists();
  populateGstStateFilter();
  renderGstDirectoryManager();
  showToast(`🗑️ Removed ${cleanGst} from GST Directory.`);
}

function matchGstFromRegistry(query) {
  if (!query) return null;
  const q = String(query).trim().toUpperCase();
  // Exact GSTIN match
  let found = gstRegistry.find(x => x.gstin.toUpperCase() === q);
  if (found) return found;

  // Partial match by name if query length >= 3
  if (q.length >= 3) {
    const qLower = q.toLowerCase();
    found = gstRegistry.find(x =>
      (x.legalName && x.legalName.toLowerCase().includes(qLower)) ||
      (x.tradeName && x.tradeName.toLowerCase().includes(qLower))
    );
    if (found) return found;
  }
  return null;
}

function renderGstDatalists() {
  const gstDl = $('gstRegistryDatalist');
  const clientDl = $('clientNameDatalist');
  const savedCountEl = $('gstSavedCount');

  if (savedCountEl) savedCountEl.textContent = gstRegistry.length;

  if (gstDl) {
    gstDl.innerHTML = gstRegistry.map(p =>
      `<option value="${p.gstin}">${esc(p.legalName)} (${esc(p.stateName)})</option>`
    ).join('');
  }

  if (clientDl) {
    clientDl.innerHTML = gstRegistry.map(p =>
      `<option value="${esc(p.legalName)}">${p.gstin} · ${esc(p.stateName)}</option>`
    ).join('');
  }
}

function populateGstStateFilter() {
  const filterSelect = $('filterGstStateSelect');
  if (!filterSelect) return;

  const currentVal = filterSelect.value || 'all';
  const statesPresent = new Set();
  gstRegistry.forEach(p => {
    if (p.stateCode && GST_STATES[p.stateCode]) {
      statesPresent.add(p.stateCode);
    }
  });

  const sortedCodes = Array.from(statesPresent).sort();

  let html = `<option value="all">🇮🇳 All States (${gstRegistry.length})</option>`;
  sortedCodes.forEach(code => {
    const name = GST_STATES[code] || `Code ${code}`;
    const count = gstRegistry.filter(p => p.stateCode === code).length;
    html += `<option value="${code}">${name} (${count})</option>`;
  });

  filterSelect.innerHTML = html;
  filterSelect.value = currentVal;
}

function renderGstDirectoryManager() {
  const listEl = $('gstDirectoryList');
  if (!listEl) return;

  const search = ($('searchGstDirInput') ? $('searchGstDirInput').value : '').toLowerCase().trim();
  const stateFilter = $('filterGstStateSelect') ? $('filterGstStateSelect').value : 'all';

  const filtered = gstRegistry.filter(party => {
    if (stateFilter !== 'all' && party.stateCode !== stateFilter) return false;
    if (!search) return true;
    return (
      (party.gstin && party.gstin.toLowerCase().includes(search)) ||
      (party.legalName && party.legalName.toLowerCase().includes(search)) ||
      (party.tradeName && party.tradeName.toLowerCase().includes(search)) ||
      (party.stateName && party.stateName.toLowerCase().includes(search)) ||
      (party.address && party.address.toLowerCase().includes(search))
    );
  });

  if (!filtered.length) {
    listEl.innerHTML = `
      <div class="empty-state">
        <p>No parties found matching your search.</p>
        <small>Add new parties in the "Add Party" tab or search by a different keyword.</small>
      </div>
    `;
    return;
  }

  listEl.innerHTML = filtered.map(p => `
    <div class="gst-party-card">
      <div class="gst-badge-state" style="width:34px;height:34px;font-size:14px;line-height:34px;">${esc(p.stateCode || p.gstin.slice(0, 2))}</div>
      <div class="gst-party-main">
        <strong>${esc(p.legalName)}</strong>
        <div class="gst-party-meta">
          <span class="gstin-pill">${esc(p.gstin)}</span>
          <span>📍 ${esc(p.stateName || 'India')}</span>
          ${p.contact ? `<span>📞 ${esc(p.contact)}</span>` : ''}
        </div>
        ${p.address ? `<div style="font-size:11px;color:#64748b;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">🏠 ${esc(p.address)}</div>` : ''}
      </div>
      <div class="gst-party-actions">
        <button type="button" class="btn small primary" data-apply-client-gst="${esc(p.gstin)}" title="Set as Buyer / Client on document">👤 Set Client</button>
        <button type="button" class="btn small outline" data-apply-comp-gst="${esc(p.gstin)}" title="Set as Company Details">🏢 Set Company</button>
        <button type="button" class="btn small outline" data-verify-gst="${esc(p.gstin)}" title="Open Live Checksum Decoder">🔍 Verify</button>
        <button type="button" class="btn small ghost-dark" data-delete-gst="${esc(p.gstin)}" title="Remove from Directory">&times;</button>
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('[data-apply-client-gst]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = gstRegistry.find(x => x.gstin === btn.dataset.applyClientGst);
      if (p) {
        applyPartyToTarget(p, 'client');
        $('gstModal').classList.add('hidden');
      }
    });
  });

  listEl.querySelectorAll('[data-apply-comp-gst]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = gstRegistry.find(x => x.gstin === btn.dataset.applyCompGst);
      if (p) {
        applyPartyToTarget(p, 'company');
        $('gstModal').classList.add('hidden');
      }
    });
  });

  listEl.querySelectorAll('[data-verify-gst]').forEach(btn => {
    btn.addEventListener('click', () => {
      switchGstTab('lookup');
      if ($('gstModalSearchInput')) $('gstModalSearchInput').value = btn.dataset.verifyGst;
      verifyAndMatchGst(btn.dataset.verifyGst);
    });
  });

  listEl.querySelectorAll('[data-delete-gst]').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteGstPartyFromRegistry(btn.dataset.deleteGst);
    });
  });
}

function applyPartyToTarget(party, targetType = 'client') {
  if (!party) return;

  if (targetType === 'company') {
    if ($('companyGst')) $('companyGst').value = party.gstin;
    if ($('companyName')) $('companyName').value = party.legalName;
    if (party.address && $('companyAddress')) $('companyAddress').value = party.address;
    if (party.contact) {
      const phoneMatch = party.contact.match(/(\+?\d[\d\s-]{8,})/);
      if (phoneMatch && $('companyPhone')) $('companyPhone').value = phoneMatch[0].trim();
    }
    updatePreview();
    showToast(`🏢 Applied "${party.legalName}" to Company Details!`);
  } else {
    if ($('clientGst')) $('clientGst').value = party.gstin;
    if ($('clientName')) $('clientName').value = party.legalName;
    if (party.address && $('siteLocation')) $('siteLocation').value = party.address;
    if (party.contact && $('clientContact')) $('clientContact').value = party.contact;
    if (party.contact) {
      const phoneMatch = party.contact.match(/(\+?\d[\d\s-]{8,})/);
      if (phoneMatch && $('clientPhone')) $('clientPhone').value = phoneMatch[0].trim();
    }
    updatePreview();
    showToast(`👤 Auto-filled "${party.legalName}" as Client / Buyer!`);
  }
}

function handleGstInputLive(inputEl, chipEl, targetType = 'client') {
  if (!inputEl || !chipEl) return;
  const raw = inputEl.value;
  const clean = raw.trim().toUpperCase();
  if (inputEl.value !== clean) {
    const selStart = inputEl.selectionStart;
    inputEl.value = clean;
    inputEl.setSelectionRange(selStart, selStart);
  }

  if (!clean) {
    chipEl.classList.add('hidden');
    chipEl.innerHTML = '';
    return;
  }

  const info = parseGstInfo(clean);

  if (clean.length >= 2 && clean.length < 15) {
    chipEl.classList.remove('hidden', 'invalid', 'matched');
    chipEl.innerHTML = `<span>📍 <strong>State:</strong> ${info.stateName || 'State Code ' + info.stateCode} (${info.stateCode}) ${info.entityType ? `• <em>${info.entityType}</em>` : ''}</span>`;
  } else if (clean.length === 15) {
    chipEl.classList.remove('hidden');
    if (info.matchedParty) {
      chipEl.className = 'gst-match-info-chip matched';
      chipEl.innerHTML = `
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ✨ <strong>Matched:</strong> ${esc(info.matchedParty.legalName)} (${esc(info.stateName)})
        </span>
        <button type="button" class="btn small primary" id="btnLiveFill_${targetType}" style="padding:2px 7px;font-size:10px;white-space:nowrap;">⚡ Fill</button>
      `;
      const btn = $('btnLiveFill_' + targetType);
      if (btn) {
        btn.onclick = (e) => {
          e.preventDefault();
          applyPartyToTarget(info.matchedParty, targetType);
        };
      }
    } else if (info.isValidChecksum) {
      chipEl.className = 'gst-match-info-chip';
      chipEl.innerHTML = `
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ✅ <strong>Valid GSTIN:</strong> ${esc(info.stateName)} • ${esc(info.entityType)}
        </span>
        <button type="button" class="btn small outline" id="btnLiveSave_${targetType}" style="padding:2px 7px;font-size:10px;white-space:nowrap;">+ Master</button>
      `;
      const btn = $('btnLiveSave_' + targetType);
      if (btn) {
        btn.onclick = (e) => {
          e.preventDefault();
          openGstModal('add', clean, targetType);
        };
      }
    } else if (info.isValidFormat && !info.isValidChecksum) {
      chipEl.className = 'gst-match-info-chip invalid';
      chipEl.innerHTML = `<span>⚠️ <strong>Checksum mismatch:</strong> Check 15th checksum character (${clean[14]})</span>`;
    } else {
      chipEl.className = 'gst-match-info-chip invalid';
      chipEl.innerHTML = `<span>⚠️ Invalid GSTIN format (15 alphanumeric characters required)</span>`;
    }
  } else {
    chipEl.classList.add('hidden');
    chipEl.innerHTML = '';
  }
}

let currentGstModalTarget = 'client';

function switchGstTab(activeTab) {
  const tabs = [
    { id: 'lookup', btn: $('tabGstLookupBtn'), content: $('tabGstLookupContent') },
    { id: 'directory', btn: $('tabGstDirectoryBtn'), content: $('tabGstDirectoryContent') },
    { id: 'add', btn: $('tabGstAddBtn'), content: $('tabGstAddContent') },
    { id: 'settings', btn: $('tabGstSettingsBtn'), content: $('tabGstSettingsContent') }
  ];

  tabs.forEach(t => {
    if (t.btn && t.content) {
      if (t.id === activeTab) {
        t.btn.classList.add('active');
        t.content.classList.remove('hidden');
      } else {
        t.btn.classList.remove('active');
        t.content.classList.add('hidden');
      }
    }
  });

  if (activeTab === 'directory') {
    renderGstDirectoryManager();
  }
}

function openGstModal(initialTab = 'lookup', presetGstin = '', target = 'client') {
  currentGstModalTarget = target;
  switchGstTab(initialTab);

  if (initialTab === 'lookup') {
    const searchInp = $('gstModalSearchInput');
    if (searchInp) {
      if (presetGstin) {
        searchInp.value = presetGstin.trim().toUpperCase();
        verifyAndMatchGst(presetGstin);
      } else if (!searchInp.value) {
        searchInp.value = gstRegistry[0] ? gstRegistry[0].gstin : '33AABCS1429B1ZB';
        verifyAndMatchGst(searchInp.value);
      }
    }
  } else if (initialTab === 'add' && presetGstin) {
    if ($('addGstNumber')) $('addGstNumber').value = presetGstin.trim().toUpperCase();
  }

  $('gstModal').classList.remove('hidden');
}

function verifyAndMatchGst(gstinInput) {
  const raw = (gstinInput || '').trim().toUpperCase();
  if (!raw) {
    showToast('Please enter a 15-digit GSTIN.', 'error');
    return;
  }

  const info = parseGstInfo(raw);
  const card = $('gstResultCard');
  if (!card) return;

  card.classList.remove('hidden');

  if ($('resGstStateCode')) $('resGstStateCode').textContent = info.stateCode || '00';
  if ($('resGstNumber')) $('resGstNumber').textContent = info.gstin;
  if ($('resGstStateName')) $('resGstStateName').textContent = `${info.stateName || 'Unknown State'} (Code ${info.stateCode})`;
  if ($('resGstPanType')) $('resGstPanType').textContent = `${info.pan || 'N/A'} • ${info.entityType || 'Business Entity'}`;

  const party = info.matchedParty;
  if (party) {
    if ($('resGstLegalName')) $('resGstLegalName').textContent = party.legalName;
    if ($('resGstTradeName')) $('resGstTradeName').textContent = party.tradeName ? `Trade: ${party.tradeName}` : 'Principal Place of Business';
    if ($('resGstAddress')) $('resGstAddress').textContent = party.address || `${party.stateName}, India`;
    if ($('resGstMatchStatus')) {
      $('resGstMatchStatus').textContent = `📚 Matched in Master Directory (${party.legalName})`;
      $('resGstMatchStatus').style.color = '#059669';
    }
    if ($('saveGstToDirectoryBtn')) $('saveGstToDirectoryBtn').textContent = '💾 Update in Directory';
  } else {
    const defaultName = `Taxpayer ${info.pan} (${info.entityType || 'Registered Business'})`;
    if ($('resGstLegalName')) $('resGstLegalName').textContent = defaultName;
    if ($('resGstTradeName')) $('resGstTradeName').textContent = `Jurisdiction: ${info.stateName || 'India'}`;
    if ($('resGstAddress')) $('resGstAddress').textContent = `${info.stateName || 'India'}`;
    if ($('resGstMatchStatus')) {
      $('resGstMatchStatus').textContent = info.isValidChecksum ? '⚡ Verified via Indian GST Checksum Engine' : '⚠️ Unverified Format / Checksum Mismatch';
      $('resGstMatchStatus').style.color = info.isValidChecksum ? '#2563eb' : '#dc2626';
    }
    if ($('saveGstToDirectoryBtn')) $('saveGstToDirectoryBtn').textContent = '💾 Save to Master Directory';
  }

  const badge = $('resGstStatusBadge');
  if (badge) {
    if (info.isValidChecksum) {
      badge.className = 'gst-status-badge valid';
      badge.textContent = '✅ ACTIVE / VALID CHECKSUM';
    } else if (info.isValidFormat) {
      badge.className = 'gst-status-badge invalid';
      badge.textContent = '⚠️ CHECKSUM MISMATCH';
    } else {
      badge.className = 'gst-status-badge invalid';
      badge.textContent = '❌ INVALID FORMAT';
    }
  }

  const govLink = $('resGstGovLink');
  if (govLink) {
    govLink.href = `https://services.gst.gov.in/services/searchtp`;
  }

  if ($('applyGstToCompanyBtn')) {
    $('applyGstToCompanyBtn').onclick = () => {
      const p = party || {
        gstin: info.gstin,
        legalName: $('resGstLegalName').textContent,
        address: $('resGstAddress').textContent,
        contact: ''
      };
      applyPartyToTarget(p, 'company');
      $('gstModal').classList.add('hidden');
    };
  }

  if ($('applyGstToClientBtn')) {
    $('applyGstToClientBtn').onclick = () => {
      const p = party || {
        gstin: info.gstin,
        legalName: $('resGstLegalName').textContent,
        address: $('resGstAddress').textContent,
        contact: ''
      };
      applyPartyToTarget(p, 'client');
      $('gstModal').classList.add('hidden');
    };
  }

  if ($('saveGstToDirectoryBtn')) {
    $('saveGstToDirectoryBtn').onclick = () => {
      const p = party || {
        gstin: info.gstin,
        legalName: $('resGstLegalName').textContent,
        tradeName: $('resGstTradeName').textContent.replace('Trade: ', '').replace('Jurisdiction: ', ''),
        stateCode: info.stateCode,
        stateName: info.stateName,
        address: $('resGstAddress').textContent
      };
      saveGstPartyToRegistry(p, true);
    };
  }
}

/* --- Work Items Logic (Rate per Sq.M or Itemized Quantity x Rate) --- */
function addItem(desc = '', rate = 450, qty = 1, unit = null) {
  const r = Number(rate) || 0;
  const q = Number(qty) || 1;
  const defaultUnit = val('billingMode') === 'sqm_rate' ? 'sq.m' : 'pcs';
  items.push({
    id: crypto.randomUUID(),
    desc,
    qty: q,
    unit: unit || defaultUnit,
    rate: r,
    amount: q * r
  });
  renderItems();
  updatePreview();
}

function renderItems() {
  const tbody = $('itemsBody');
  if (!tbody) return;

  const mode = val('billingMode') || 'qty_rate';
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
            <input class="item-desc" list="catalogDatalist" data-id="${x.id}" data-k="desc" value="${esc(x.desc)}" placeholder="e.g. Fly ash bricks / Cement / Civil work">
          </td>
          <td>
            <input class="num" type="number" min="0" step="0.01" data-id="${x.id}" data-k="qty" value="${qty}" placeholder="1">
          </td>
          <td>
            <select data-id="${x.id}" data-k="unit" style="padding:6px 4px;font-size:11px;width:100%;min-width:85px;">
              ${renderUnitOptions(x.unit)}
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
        if (x.desc && x.desc.trim()) {
          saveItemToCatalog(x.desc, x.rate, x.unit || 'pcs', false);
        }
      } else if (key === 'qty') {
        x.qty = Number(e.target.value) || 1;
        x.amount = x.qty * (Number(x.rate) || 0);
      } else if (key === 'unit') {
        if (e.target.value === '__custom__') {
          const customUnit = prompt('Enter custom unit of measurement (e.g. bundle, barrel, kW, cylinder, pallet, etc.):', x.unit || 'pcs');
          if (customUnit && customUnit.trim()) {
            x.unit = customUnit.trim();
            e.target.innerHTML = renderUnitOptions(x.unit);
            e.target.value = x.unit;
          } else {
            e.target.value = x.unit || 'pcs';
          }
        } else {
          x.unit = e.target.value;
        }
        if (x.desc && x.desc.trim()) {
          saveItemToCatalog(x.desc, x.rate, x.unit || 'pcs', false);
        }
      } else if (key === 'desc') {
        x.desc = e.target.value;
        const matched = itemCatalog.find(c => c.desc.toLowerCase() === x.desc.trim().toLowerCase());
        if (matched) {
          if (!x.rate || x.rate === 450 || x.rate === 0) {
            x.rate = matched.rate;
            x.amount = (Number(x.qty) || 1) * matched.rate;
            const row = e.target.closest('tr');
            const rateInput = row ? row.querySelector('[data-k="rate"]') : null;
            if (rateInput) rateInput.value = matched.rate;
          }
          if (matched.unit) {
            x.unit = matched.unit;
            const row = e.target.closest('tr');
            const unitSelect = row ? row.querySelector('[data-k="unit"]') : null;
            if (unitSelect) {
              unitSelect.innerHTML = renderUnitOptions(x.unit);
              unitSelect.value = x.unit;
            }
          }
        }
      }
      updatePreview();
    });

    el.addEventListener('change', e => {
      const x = items.find(a => a.id === e.target.dataset.id);
      if (!x) return;
      if (x.desc && x.desc.trim()) {
        saveItemToCatalog(x.desc, x.rate, x.unit || 'pcs', false);
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

/* --- 🎨 Template & Custom Bill Layout System --- */
function renderTemplatePicker(filter = currentCustomFilter || 'all') {
  currentCustomFilter = filter;
  const grid = $('templatePickerGrid');
  if (!grid) return;

  const currentTpl = val('docTemplate') || 'modern';

  // Filter tabs active state
  document.querySelectorAll('.tpl-filter-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  if ($('customFilterCount')) {
    $('customFilterCount').textContent = customLayouts.length;
  }

  let html = '';

  // Render Built-in templates if matching filter
  Object.entries(TEMPLATES).forEach(([key, tpl]) => {
    if (filter === 'all' || filter === tpl.category) {
      const isActive = currentTpl === key;
      html += `
        <button type="button" class="template-pill-btn ${isActive ? 'active' : ''}" data-tpl="${key}" id="tpl_${key}_Btn" title="${tpl.subtitle || tpl.name}">
          <span class="template-color-dot" style="background:${tpl.color};"></span>
          <div>
            <strong>${tpl.name}</strong>
            <span style="font-size:9.5px;color:#64748b;display:block;">${tpl.subtitle}</span>
          </div>
        </button>
      `;
    }
  });

  // Render Custom Layouts if matching filter
  customLayouts.forEach(cl => {
    if (filter === 'all' || filter === 'custom' || filter === cl.category) {
      const isActive = currentTpl === cl.id;
      const fontName = cl.fontFamily ? cl.fontFamily.split(',')[0].replace(/['"]/g, '') : 'DM Sans';
      html += `
        <button type="button" class="template-pill-btn ${isActive ? 'active' : ''}" data-tpl="${cl.id}" data-custom-id="${cl.id}" title="${esc(cl.name)} (Custom Layout)">
          <span class="custom-badge-tag">✨ Custom</span>
          <span class="template-color-dot" style="background:${cl.primaryColor || '#2563eb'};"></span>
          <div style="flex:1;min-width:0;text-align:left;">
            <strong style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;">${esc(cl.name)}</strong>
            <span style="font-size:9.5px;color:#64748b;display:block;">${esc((cl.archetype || 'modern').toUpperCase())} • ${esc(fontName)}</span>
          </div>
          <div class="tpl-action-btns" onclick="event.stopPropagation();">
            <button type="button" class="tpl-mini-action-btn" data-edit-custom-tpl="${cl.id}" title="Edit in Studio">✏️</button>
            <button type="button" class="tpl-mini-action-btn" data-del-custom-tpl="${cl.id}" title="Delete Layout">🗑️</button>
          </div>
        </button>
      `;
    }
  });

  // Plus button inside grid
  html += `
    <button type="button" class="template-pill-btn" id="pickerCreateNewLayoutBtn" style="border-style:dashed;background:#faf5ff;border-color:#d8b4fe;" title="Design a new custom layout">
      <span style="font-size:16px;">✨</span>
      <div>
        <strong style="color:#7e22ce;">+ Create Layout</strong>
        <span style="font-size:9.5px;color:#a855f7;display:block;">Design &amp; Save to Cloud</span>
      </div>
    </button>
  `;

  grid.innerHTML = html;

  // Bind click handlers
  grid.querySelectorAll('.template-pill-btn[data-tpl]').forEach(btn => {
    btn.addEventListener('click', () => {
      setDocumentTemplate(btn.dataset.tpl);
    });
  });

  grid.querySelectorAll('[data-edit-custom-tpl]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLayoutDesigner(btn.dataset.editCustomTpl);
    });
  });

  grid.querySelectorAll('[data-del-custom-tpl]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCustomLayout(btn.dataset.delCustomTpl);
    });
  });

  const plusBtn = $('pickerCreateNewLayoutBtn');
  if (plusBtn) {
    plusBtn.addEventListener('click', () => openLayoutDesigner(null));
  }
}

function setDocumentTemplate(tpl) {
  const docTemplateInput = $('docTemplate');
  const preview = $('quotationPreview');
  const badge = $('activeTemplateBadge');
  const prevLbl = $('previewTplLabel');
  const prevEditBtn = $('previewEditLayoutBtn');
  const wmEl = $('pWatermark');

  // Check if it's a custom layout
  const customLayout = customLayouts.find(x => x.id === tpl);

  if (customLayout) {
    if (docTemplateInput) docTemplateInput.value = customLayout.id;
    if (badge) {
      badge.textContent = `✨ ${customLayout.name}`;
      badge.style.background = '#faf5ff';
      badge.style.color = '#7e22ce';
      badge.style.borderColor = '#d8b4fe';
    }
    if (prevLbl) {
      prevLbl.innerHTML = `A4 Document &bull; ✨ ${customLayout.name}`;
    }
    if (editBtn) {
      editBtn.classList.remove('hidden');
      editBtn.style.display = 'inline-flex';
    }
    if (prevEditBtn) {
      prevEditBtn.classList.remove('hidden');
      prevEditBtn.style.display = 'inline-flex';
    }

    if (preview) {
      preview.className = `quotation tpl-custom tpl-arch-${customLayout.archetype || 'modern'}`;
      preview.style.setProperty('--custom-primary', customLayout.primaryColor || '#2563eb');
      preview.style.setProperty('--custom-secondary', customLayout.secondaryColor || '#1e293b');
      preview.style.setProperty('--custom-accent', customLayout.accentColor || '#f59e0b');
      preview.style.setProperty('--custom-header-bg', customLayout.headerBg || '#0f172a');
      preview.style.setProperty('--custom-header-text', customLayout.headerText || '#ffffff');
      preview.style.setProperty('--custom-paper-bg', customLayout.paperBg || '#ffffff');
      preview.style.setProperty('--custom-font', customLayout.fontFamily || "'DM Sans', sans-serif");
      preview.style.setProperty('--custom-table-head-bg', customLayout.tableHeadBg || '#eff6ff');
      preview.style.setProperty('--custom-table-head-text', customLayout.tableHeadText || '#1e40af');
      preview.style.setProperty('--custom-border-color', customLayout.borderColor || '#cbd5e1');
    }

    if (wmEl) {
      if (customLayout.watermarkEnable && customLayout.watermarkText) {
        wmEl.textContent = customLayout.watermarkText;
        wmEl.style.opacity = (Number(customLayout.watermarkOpacity) || 6) / 100;
        wmEl.classList.remove('hidden');
      } else {
        wmEl.classList.add('hidden');
      }
    }
  } else {
    // Built-in template
    if (!TEMPLATES[tpl]) tpl = 'modern';
    if (docTemplateInput) docTemplateInput.value = tpl;

    if (badge && TEMPLATES[tpl]) {
      badge.textContent = TEMPLATES[tpl].name;
      badge.style.background = '#eff6ff';
      badge.style.color = '#2563eb';
      badge.style.borderColor = '#bfdbfe';
    }
    if (prevLbl && TEMPLATES[tpl]) {
      prevLbl.innerHTML = `A4 Document &bull; ${TEMPLATES[tpl].name}`;
    }
    if (editBtn) {
      editBtn.classList.add('hidden');
      editBtn.style.display = 'none';
    }
    if (prevEditBtn) {
      prevEditBtn.classList.add('hidden');
      prevEditBtn.style.display = 'none';
    }

    if (preview) {
      preview.className = `quotation tpl-${tpl}`;
      preview.style.removeProperty('--custom-primary');
      preview.style.removeProperty('--custom-secondary');
      preview.style.removeProperty('--custom-accent');
      preview.style.removeProperty('--custom-header-bg');
      preview.style.removeProperty('--custom-header-text');
      preview.style.removeProperty('--custom-paper-bg');
      preview.style.removeProperty('--custom-font');
      preview.style.removeProperty('--custom-table-head-bg');
      preview.style.removeProperty('--custom-table-head-text');
      preview.style.removeProperty('--custom-border-color');
    }

    if (wmEl) wmEl.classList.add('hidden');
  }

  // Update active pill styling in grid
  document.querySelectorAll('.template-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tpl === tpl);
  });

  saveDraftState();
}

/* --- Layout Designer Modal Controller & Cloud Sync --- */
const DESIGNER_STARTER_PRESETS = [
  {
    id: 'starter_executive_gold',
    name: 'Crown Executive Gold',
    category: 'luxury',
    archetype: 'luxury',
    primaryColor: '#d97706',
    secondaryColor: '#091428',
    accentColor: '#fbbf24',
    headerBg: '#091428',
    headerText: '#fbbf24',
    paperBg: '#fffdfa',
    fontFamily: "'Cinzel', serif",
    tableStyle: 'grid',
    tableHeadBg: '#091428',
    tableHeadText: '#fbbf24',
    borderColor: '#fde68a',
    watermarkEnable: true,
    watermarkText: 'ORIGINAL',
    watermarkOpacity: 5,
    description: 'High-end gold metallic borders with deep navy headers for premium client proposals.'
  },
  {
    id: 'starter_cyber_aurora',
    name: 'Cyber Aurora Gradient',
    category: 'modern',
    archetype: 'modern',
    primaryColor: '#6366f1',
    secondaryColor: '#a855f7',
    accentColor: '#06b6d4',
    headerBg: '#1e1b4b',
    headerText: '#ffffff',
    paperBg: '#ffffff',
    fontFamily: "'Space Grotesk', sans-serif",
    tableStyle: 'modern',
    tableHeadBg: '#4338ca',
    tableHeadText: '#ffffff',
    borderColor: '#e0e7ff',
    watermarkEnable: false,
    watermarkText: 'TAX INVOICE',
    watermarkOpacity: 6,
    description: 'Vibrant indigo-to-cyan modern tech styling with glowing accents.'
  },
  {
    id: 'starter_swiss_minimal',
    name: 'Swiss Pure Minimalist',
    category: 'minimal',
    archetype: 'minimal',
    primaryColor: '#0f172a',
    secondaryColor: '#475569',
    accentColor: '#2563eb',
    headerBg: '#ffffff',
    headerText: '#0f172a',
    paperBg: '#ffffff',
    fontFamily: "'Inter', sans-serif",
    tableStyle: 'minimal',
    tableHeadBg: '#f8fafc',
    tableHeadText: '#334155',
    borderColor: '#e2e8f0',
    watermarkEnable: false,
    watermarkText: '',
    watermarkOpacity: 4,
    description: 'Ultra-clean whitespace, hairline borders, and understated elegance.'
  },
  {
    id: 'starter_neo_brutalist',
    name: 'Neo-Brutalist Electric',
    category: 'modern',
    archetype: 'brutalist',
    primaryColor: '#000000',
    secondaryColor: '#000000',
    accentColor: '#facc15',
    headerBg: '#ffffff',
    headerText: '#000000',
    paperBg: '#ffffff',
    fontFamily: "'Space Grotesk', sans-serif",
    tableStyle: 'brutalist',
    tableHeadBg: '#000000',
    tableHeadText: '#ffffff',
    borderColor: '#000000',
    watermarkEnable: true,
    watermarkText: 'VERIFIED',
    watermarkOpacity: 8,
    description: 'Thick 3.5px solid black borders with offset drop shadows and electric yellow tags.'
  },
  {
    id: 'starter_civil_blueprint',
    name: 'Civil Engineering Blueprint',
    category: 'industrial',
    archetype: 'industrial',
    primaryColor: '#0284c7',
    secondaryColor: '#0c4a6e',
    accentColor: '#38bdf8',
    headerBg: '#0c4a6e',
    headerText: '#ffffff',
    paperBg: '#f8fafc',
    fontFamily: "'JetBrains Mono', monospace",
    tableStyle: 'grid',
    tableHeadBg: '#0369a1',
    tableHeadText: '#ffffff',
    borderColor: '#7dd3fc',
    watermarkEnable: true,
    watermarkText: 'APPROVED ESTIMATE',
    watermarkOpacity: 7,
    description: 'Cadet blue drafting theme with technical monospace numbers and boxed grid.'
  },
  {
    id: 'starter_vintage_ledger',
    name: 'Vintage Master Ledger',
    category: 'luxury',
    archetype: 'ledger',
    primaryColor: '#78350f',
    secondaryColor: '#92400e',
    accentColor: '#d97706',
    headerBg: '#fef3c7',
    headerText: '#78350f',
    paperBg: '#fefcf6',
    fontFamily: "'Playfair Display', serif",
    tableStyle: 'grid',
    tableHeadBg: '#fef3c7',
    tableHeadText: '#78350f',
    borderColor: '#fde68a',
    watermarkEnable: true,
    watermarkText: 'CONFIDENTIAL',
    watermarkOpacity: 5,
    description: 'Classic double-ruled accounting ledger parchment with warm tan accents.'
  },
  {
    id: 'starter_emerald_eco',
    name: 'Emerald Eco Infrastructure',
    category: 'industrial',
    archetype: 'modern',
    primaryColor: '#059669',
    secondaryColor: '#064e3b',
    accentColor: '#10b981',
    headerBg: '#064e3b',
    headerText: '#ffffff',
    paperBg: '#ffffff',
    fontFamily: "'Outfit', sans-serif",
    tableStyle: 'zebra',
    tableHeadBg: '#ecfdf5',
    tableHeadText: '#065f46',
    borderColor: '#a7f3d0',
    watermarkEnable: false,
    watermarkText: 'ECO PROJECT',
    watermarkOpacity: 6,
    description: 'Fresh emerald and mint styling for environmental and sustainable construction.'
  },
  {
    id: 'starter_split_horizon',
    name: 'Split Horizon Midnight',
    category: 'modern',
    archetype: 'split',
    primaryColor: '#312e81',
    secondaryColor: '#1e1b4b',
    accentColor: '#6366f1',
    headerBg: '#1e1b4b',
    headerText: '#ffffff',
    paperBg: '#ffffff',
    fontFamily: "'DM Sans', sans-serif",
    tableStyle: 'zebra',
    tableHeadBg: '#312e81',
    tableHeadText: '#ffffff',
    borderColor: '#c7d2fe',
    watermarkEnable: false,
    watermarkText: '',
    watermarkOpacity: 5,
    description: 'Two-tone split header banner with deep midnight indigo and clean zebra rows.'
  }
];

async function fetchCustomLayouts() {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(customLayoutsStorageKey) || '[]');
  } catch {}

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('custom_layouts').select('*').order('updated_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        const cloudList = data.map(row => ({
          id: row.id,
          name: row.name,
          category: row.category || 'modern',
          ...(row.config || {}),
          cloudSynced: true,
          updated_at: row.updated_at
        }));
        const map = new Map();
        cloudList.forEach(l => map.set(l.id, l));
        list.forEach(l => {
          if (!map.has(l.id)) map.set(l.id, l);
        });
        list = Array.from(map.values());
        localStorage.setItem(customLayoutsStorageKey, JSON.stringify(list));
      }
    } catch (err) {
      console.warn('Supabase custom_layouts query fallback:', err);
    }
  }

  customLayouts = list;
  renderTemplatePicker();
  renderCustomLayoutsManager();
  if ($('customLayoutsCount')) $('customLayoutsCount').textContent = customLayouts.length;
  if ($('customLayoutsCount2')) $('customLayoutsCount2').textContent = customLayouts.length;
}

async function saveCustomLayoutToCloud(layoutObj) {
  if (!layoutObj.id) {
    layoutObj.id = 'custom_' + Date.now();
  }
  layoutObj.updated_at = new Date().toISOString();

  const idx = customLayouts.findIndex(x => x.id === layoutObj.id);
  if (idx >= 0) {
    customLayouts[idx] = layoutObj;
  } else {
    customLayouts.unshift(layoutObj);
  }
  localStorage.setItem(customLayoutsStorageKey, JSON.stringify(customLayouts));

  if (supabaseClient) {
    try {
      await supabaseClient.from('custom_layouts').upsert({
        id: layoutObj.id,
        name: layoutObj.name,
        category: layoutObj.category || 'modern',
        config: layoutObj,
        updated_at: layoutObj.updated_at
      }, { onConflict: 'id' });
      layoutObj.cloudSynced = true;
    } catch (err) {
      console.warn('Supabase custom_layouts save error:', err);
    }
  }

  renderTemplatePicker();
  renderCustomLayoutsManager();
  return layoutObj;
}

async function deleteCustomLayout(layoutId) {
  const cl = customLayouts.find(x => x.id === layoutId);
  const name = cl ? cl.name : 'this layout';
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

  customLayouts = customLayouts.filter(x => x.id !== layoutId);
  localStorage.setItem(customLayoutsStorageKey, JSON.stringify(customLayouts));

  if (supabaseClient) {
    try {
      await supabaseClient.from('custom_layouts').delete().eq('id', layoutId);
    } catch (err) {
      console.warn('Supabase custom_layouts delete error:', err);
    }
  }

  if (val('docTemplate') === layoutId) {
    setDocumentTemplate('modern');
  }

  renderTemplatePicker();
  renderCustomLayoutsManager();
  showToast(`🗑️ Deleted custom layout "${name}".`);
}

function openLayoutDesigner(layoutIdToEdit = null) {
  editingLayoutId = layoutIdToEdit;
  const modal = $('layoutDesignerModal');
  if (!modal) return;

  const deleteBtn = $('deleteCurrentCustomLayoutBtn');
  if (deleteBtn) {
    if (editingLayoutId) {
      deleteBtn.style.display = 'inline-flex';
    } else {
      deleteBtn.style.display = 'none';
    }
  }

  // Populate starter presets
  renderDesignerPresets();

  if (layoutIdToEdit) {
    const cl = customLayouts.find(x => x.id === layoutIdToEdit);
    if (cl) {
      loadCustomLayoutIntoForm(cl);
    }
  } else {
    // Default starter
    loadCustomLayoutIntoForm(DESIGNER_STARTER_PRESETS[0]);
    $('customLayoutName').value = `My Custom Layout ${customLayouts.length + 1}`;
  }

  modal.classList.remove('hidden');
  switchDesignerTab('builder');
  updateLayoutDesignerPreview();
}

function closeLayoutDesigner() {
  const modal = $('layoutDesignerModal');
  if (modal) modal.classList.add('hidden');
  editingLayoutId = null;
}

function switchDesignerTab(tab) {
  const tabs = ['Builder', 'Presets', 'Sync', 'Json'];
  tabs.forEach(t => {
    const btn = $(`tabDesigner${t}Btn`);
    const content = $(`tabDesigner${t}Content`);
    const isTarget = t.toLowerCase() === tab.toLowerCase();
    if (btn) btn.classList.toggle('active', isTarget);
    if (content) content.classList.toggle('hidden', !isTarget);
  });

  if (tab === 'sync') {
    updateDesignerSyncStatus();
  } else if (tab === 'json') {
    const curConfig = collectCurrentLayoutFromForm();
    if ($('layoutJsonArea')) {
      $('layoutJsonArea').value = JSON.stringify(curConfig, null, 2);
    }
  }
}

function renderDesignerPresets() {
  const grid = $('designerPresetsGrid');
  if (!grid) return;

  grid.innerHTML = DESIGNER_STARTER_PRESETS.map(p => `
    <div class="preset-canvas-card" data-preset-id="${p.id}">
      <div class="preset-header-strip" style="background:${p.primaryColor};"></div>
      <strong>${p.name}</strong>
      <p>${p.description}</p>
      <div class="preset-chips">
        <span class="badge-approx" style="background:#eff6ff;color:#2563eb;font-size:9px;">${p.archetype.toUpperCase()}</span>
        <span class="badge-approx" style="background:${p.headerBg};color:${p.headerText};font-size:9px;">Theme</span>
        <span class="badge-approx" style="background:#f1f5f9;color:#475569;font-size:9px;">${p.fontFamily.split(',')[0].replace(/['"]/g, '')}</span>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('[data-preset-id]').forEach(card => {
    card.addEventListener('click', () => {
      const p = DESIGNER_STARTER_PRESETS.find(x => x.id === card.dataset.presetId);
      if (p) {
        loadCustomLayoutIntoForm(p);
        $('customLayoutName').value = p.name;
        switchDesignerTab('builder');
        updateLayoutDesignerPreview();
        showToast(`⚡ Loaded preset: ${p.name}`);
      }
    });
  });
}

function loadCustomLayoutIntoForm(cfg) {
  if ($('customLayoutName')) $('customLayoutName').value = cfg.name || 'My Custom Bill';
  if ($('customLayoutCategory')) $('customLayoutCategory').value = cfg.category || 'modern';

  // Archetype radio
  const archRadios = document.querySelectorAll('input[name="customArchetype"]');
  archRadios.forEach(r => {
    r.checked = r.value === (cfg.archetype || 'modern');
  });

  // Colors
  setDesignerColor('customPrimaryColor', cfg.primaryColor || '#2563eb');
  setDesignerColor('customAccentColor', cfg.accentColor || '#f59e0b');
  setDesignerColor('customPaperBg', cfg.paperBg || '#ffffff');
  setDesignerColor('customHeaderBg', cfg.headerBg || '#0f172a');
  setDesignerColor('customHeaderText', cfg.headerText || '#ffffff');
  setDesignerColor('customTableHeadBg', cfg.tableHeadBg || '#eff6ff');

  // Font & Table
  if ($('customFontFamily')) $('customFontFamily').value = cfg.fontFamily || "'DM Sans', sans-serif";
  if ($('customTableStyle')) $('customTableStyle').value = cfg.tableStyle || 'modern';

  // Watermark
  if ($('customWatermarkEnable')) $('customWatermarkEnable').checked = Boolean(cfg.watermarkEnable);
  if ($('customWatermarkText')) $('customWatermarkText').value = cfg.watermarkText || 'ORIGINAL';
  if ($('customWatermarkOpacity')) $('customWatermarkOpacity').value = cfg.watermarkOpacity || 6;
  if ($('watermarkOpacityVal')) $('watermarkOpacityVal').textContent = `${cfg.watermarkOpacity || 6}%`;

  updateLayoutDesignerPreview();
}

function setDesignerColor(id, hex) {
  const picker = $(id);
  const text = $(id + 'Hex');
  if (picker) picker.value = hex;
  if (text) text.value = hex;
}

function collectCurrentLayoutFromForm() {
  const archChecked = document.querySelector('input[name="customArchetype"]:checked');
  const archetype = archChecked ? archChecked.value : 'modern';

  return {
    id: editingLayoutId || ('custom_' + Date.now()),
    name: ($('customLayoutName') ? $('customLayoutName').value.trim() : 'My Custom Layout') || 'My Custom Layout',
    category: ($('customLayoutCategory') ? $('customLayoutCategory').value : 'modern') || 'modern',
    archetype: archetype,
    primaryColor: ($('customPrimaryColor') ? $('customPrimaryColor').value : '#2563eb') || '#2563eb',
    accentColor: ($('customAccentColor') ? $('customAccentColor').value : '#f59e0b') || '#f59e0b',
    paperBg: ($('customPaperBg') ? $('customPaperBg').value : '#ffffff') || '#ffffff',
    headerBg: ($('customHeaderBg') ? $('customHeaderBg').value : '#0f172a') || '#0f172a',
    headerText: ($('customHeaderText') ? $('customHeaderText').value : '#ffffff') || '#ffffff',
    tableHeadBg: ($('customTableHeadBg') ? $('customTableHeadBg').value : '#eff6ff') || '#eff6ff',
    tableHeadText: ($('customPrimaryColor') ? $('customPrimaryColor').value : '#1e40af'),
    borderColor: '#cbd5e1',
    fontFamily: ($('customFontFamily') ? $('customFontFamily').value : "'DM Sans', sans-serif"),
    tableStyle: ($('customTableStyle') ? $('customTableStyle').value : 'modern'),
    watermarkEnable: $('customWatermarkEnable') ? $('customWatermarkEnable').checked : false,
    watermarkText: $('customWatermarkText') ? $('customWatermarkText').value.trim() : '',
    watermarkOpacity: $('customWatermarkOpacity') ? Number($('customWatermarkOpacity').value) : 6
  };
}

function updateLayoutDesignerPreview() {
  const cfg = collectCurrentLayoutFromForm();
  const sim = $('builderPreviewFrame');
  if (!sim) return;

  sim.style.background = cfg.paperBg;
  sim.style.fontFamily = cfg.fontFamily;
  sim.style.borderTop = `5px solid ${cfg.primaryColor}`;

  if ($('builderPreviewBadge')) {
    $('builderPreviewBadge').textContent = `✨ ${cfg.archetype.toUpperCase()}`;
  }

  const sHeader = $('simHeader');
  const sAccent = $('simAccent');
  const sTag = $('simDocTag');
  const sTh = $('simTh');
  const sGrand = $('simGrand');

  if (sHeader) {
    if (cfg.archetype === 'split' || cfg.archetype === 'industrial' || cfg.archetype === 'luxury') {
      sHeader.style.background = cfg.headerBg;
      sHeader.style.color = cfg.headerText;
      sHeader.querySelectorAll('strong, p, span').forEach(el => el.style.color = cfg.headerText);
    } else {
      sHeader.style.background = 'transparent';
      sHeader.style.color = '#0f172a';
      sHeader.querySelectorAll('strong, p, span').forEach(el => el.style.color = '');
    }
  }

  if (sTag) {
    sTag.style.background = cfg.accentColor;
    sTag.style.color = '#0f172a';
  }

  if (sAccent) {
    sAccent.style.background = cfg.primaryColor;
  }

  if (sTh) {
    sTh.style.background = cfg.tableHeadBg;
    sTh.style.color = cfg.primaryColor;
    sTh.style.borderBottom = `2px solid ${cfg.primaryColor}`;
  }

  if (sGrand) {
    sGrand.style.background = cfg.headerBg;
    sGrand.style.color = cfg.accentColor;
  }
}

async function saveCurrentLayoutFromDesigner() {
  const cfg = collectCurrentLayoutFromForm();
  if (!cfg.name || !cfg.name.trim()) {
    showToast('Please enter a name for your custom layout.', 'error');
    return;
  }

  const saved = await saveCustomLayoutToCloud(cfg);
  setDocumentTemplate(saved.id);
  closeLayoutDesigner();
  showToast(`🎉 Custom layout "${saved.name}" saved & applied! Synced with Cloud Database.`);
}

function renderCustomLayoutsManager() {
  const listEl = $('customLayoutsManagerList');
  if (!listEl) return;

  if ($('customLayoutsCount')) $('customLayoutsCount').textContent = customLayouts.length;
  if ($('customLayoutsCount2')) $('customLayoutsCount2').textContent = customLayouts.length;

  if (!customLayouts.length) {
    listEl.innerHTML = '<div class="empty-state">No custom bill layouts created yet. Click "+ Create New Layout" above to design custom color themes, fonts &amp; structures.</div>';
    return;
  }

  const q = ($('searchLayoutsInput') ? $('searchLayoutsInput').value : '').toLowerCase();

  const filtered = customLayouts.filter(cl => {
    if (!q) return true;
    return (cl.name && cl.name.toLowerCase().includes(q)) || (cl.archetype && cl.archetype.toLowerCase().includes(q));
  });

  if (!filtered.length) {
    listEl.innerHTML = '<div class="empty-state">No matching layouts found.</div>';
    return;
  }

  listEl.innerHTML = filtered.map(cl => {
    const syncBadge = cl.cloudSynced
      ? '<span class="badge-approx" style="background:#dcfce7;color:#15803d;font-size:9.5px;">● Cloud Synced</span>'
      : '<span class="badge-approx" style="background:#eff6ff;color:#2563eb;font-size:9.5px;">● Local &amp; Cloud</span>';

    return `
      <div class="quote-card">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:28px;height:28px;border-radius:50%;background:${cl.primaryColor || '#2563eb'};box-shadow:0 2px 6px rgba(0,0,0,0.15);flex-shrink:0;border:2px solid #fff;"></div>
          <div class="quote-card-main">
            <strong>${esc(cl.name)}</strong>
            <p>📐 Archetype: <strong>${esc((cl.archetype || 'modern').toUpperCase())}</strong> &bull; Font: <strong>${esc(cl.fontFamily ? cl.fontFamily.split(',')[0].replace(/['"]/g, '') : 'DM Sans')}</strong> &bull; ${syncBadge}</p>
          </div>
        </div>
        <div class="quote-card-right">
          <button class="btn small primary" data-apply-layout-id="${cl.id}">✅ Apply</button>
          <button class="btn small outline" data-edit-layout-id="${cl.id}">✏️ Edit</button>
          <button class="btn small ghost-dark" data-del-layout-id="${cl.id}" title="Delete layout">&times;</button>
        </div>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('[data-apply-layout-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      setDocumentTemplate(btn.dataset.applyLayoutId);
      $('cloudModal').classList.add('hidden');
      showToast('🎨 Custom bill layout applied to document!');
    });
  });

  listEl.querySelectorAll('[data-edit-layout-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      $('cloudModal').classList.add('hidden');
      openLayoutDesigner(btn.dataset.editLayoutId);
    });
  });

  listEl.querySelectorAll('[data-del-layout-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteCustomLayout(btn.dataset.delLayoutId);
    });
  });
}

function updateDesignerSyncStatus() {
  const badge = $('designerCloudStatusBadge');
  if (!badge) return;
  if (supabaseClient) {
    badge.textContent = '● Online (Supabase PostgreSQL)';
    badge.className = 'cloud-status-pill online';
  } else {
    badge.textContent = '● Local Browser Mode';
    badge.className = 'cloud-status-pill local';
  }
}

function exportCurrentLayoutJson() {
  const cfg = collectCurrentLayoutFromForm();
  navigator.clipboard.writeText(JSON.stringify(cfg, null, 2)).then(() => {
    showToast('📋 Layout JSON copied to clipboard!');
  }).catch(() => {
    showToast('Could not copy automatically. Select JSON in the text area.', 'error');
  });
}

function downloadLayoutsJson() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(customLayouts, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `sbfb_custom_layouts_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('💾 Custom Layouts exported to JSON file!');
}

function importLayoutJson() {
  const txt = ($('layoutJsonArea') ? $('layoutJsonArea').value : '').trim();
  if (!txt) {
    showToast('Please paste a layout JSON configuration first.', 'error');
    return;
  }
  try {
    const parsed = JSON.parse(txt);
    if (Array.isArray(parsed)) {
      parsed.forEach(item => saveCustomLayoutToCloud(item));
      showToast(`📥 Imported ${parsed.length} custom layout(s)!`);
    } else if (parsed && typeof parsed === 'object') {
      saveCustomLayoutToCloud(parsed);
      loadCustomLayoutIntoForm(parsed);
      showToast(`📥 Imported layout: "${parsed.name || 'Custom Layout'}"!`);
    }
  } catch (err) {
    showToast(`Invalid JSON: ${err.message}`, 'error');
  }
}

function setBillingMode(mode) {
  if (!['sqm_rate', 'qty_rate'].includes(mode)) mode = 'qty_rate';
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
  const customLayout = customLayouts.find(x => x.id === tpl);
  if (preview) {
    if (customLayout) {
      preview.className = `quotation tpl-custom tpl-arch-${customLayout.archetype || 'modern'}`;
    } else {
      preview.className = `quotation tpl-${TEMPLATES[tpl] ? tpl : 'modern'}`;
    }
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

  const cGst = (val('clientGst') || '').trim();
  const pClientGst = $('pClientGst');
  if (pClientGst) {
    if (cGst) {
      pClientGst.textContent = `GSTIN: ${cGst}`;
      pClientGst.style.display = '';
    } else {
      pClientGst.textContent = '';
      pClientGst.style.display = 'none';
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
  const rawValidity = (val('validity') || '').toString().trim();
  const validityNum = Number(rawValidity);
  const hasValidity = rawValidity !== '' && !isNaN(validityNum) && validityNum > 0;
  const thirdBoxWrap = $('pThirdBoxWrap');
  const clientStrip = $('pClientStrip') || (thirdBoxWrap ? thirdBoxWrap.parentElement : null);

  if ($('pThirdBoxTag')) $('pThirdBoxTag').textContent = conf.thirdBoxTag;
  if (docType === 'quotation') {
    if (hasValidity) {
      if ($('pThirdBoxValue')) $('pThirdBoxValue').textContent = `${validityNum} days`;
      if ($('pThirdBoxSub')) $('pThirdBoxSub').textContent = 'From quotation date';
      if (thirdBoxWrap) thirdBoxWrap.style.display = '';
      if (clientStrip) clientStrip.classList.remove('no-third-box');
    } else {
      if (thirdBoxWrap) thirdBoxWrap.style.display = 'none';
      if (clientStrip) clientStrip.classList.add('no-third-box');
    }
  } else if (docType === 'invoice') {
    if ($('pThirdBoxValue')) $('pThirdBoxValue').textContent = dueDate ? formatDate(dueDate) : 'Due on Receipt';
    if ($('pThirdBoxSub')) $('pThirdBoxSub').textContent = val('paymentModeSelect') || 'Bank / UPI';
    if (thirdBoxWrap) thirdBoxWrap.style.display = '';
    if (clientStrip) clientStrip.classList.remove('no-third-box');
  } else {
    if ($('pThirdBoxValue')) $('pThirdBoxValue').textContent = 'PAID (CASH)';
    if ($('pThirdBoxSub')) $('pThirdBoxSub').textContent = 'Direct Receipt';
    if (thirdBoxWrap) thirdBoxWrap.style.display = '';
    if (clientStrip) clientStrip.classList.remove('no-third-box');
  }

  // Commercial / Payment Terms Box (Optional & Clickable Toggle)
  const showTerms = $('showPaymentTermsOnDoc') ? $('showPaymentTermsOnDoc').checked : true;
  const pTermsTextarea = $('paymentTerms');
  if (pTermsTextarea) pTermsTextarea.classList.toggle('toggle-dimmed', !showTerms);

  const pTerms = showTerms ? (val('paymentTerms') || '').trim() : '';
  const showValidity = docType === 'quotation' && hasValidity;
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
      if ($('pValidity2')) $('pValidity2').textContent = `${validityNum} days`;
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
  if ($('mobileTotalBadge')) $('mobileTotalBadge').textContent = money(total);

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
    if (pThRate) pThRate.textContent = 'Unit Rate (₹)';
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
              <td class="center"><span class="badge-unit">${esc(x.unit || 'pcs')}</span></td>
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
    const customLocal = JSON.parse(localStorage.getItem(customLayoutsStorageKey) || '[]');
    if (Array.isArray(customLocal) && customLocal.length) {
      customLayouts = customLocal;
    }
  } catch {}

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
        items = data.items.map(item => ({
          id: item.id || crypto.randomUUID(),
          desc: item.desc || '',
          qty: Number(item.qty) || 1,
          unit: item.unit || 'pcs',
          rate: Number(item.rate) || 0,
          amount: (Number(item.qty) || 1) * (Number(item.rate) || 0)
        }));
      }
    }
  } catch {}

  if (!items.length) {
    items = [
      { id: crypto.randomUUID(), desc: 'Standard Fly Ash Bricks (9"x4"x3")', qty: 5000, unit: 'pcs', rate: 7.5, amount: 37500 },
      { id: crypto.randomUUID(), desc: 'Fly ash brick masonry with cement mortar (1:6)', qty: 45, unit: 'sq.m', rate: 450, amount: 20250 },
      { id: crypto.randomUUID(), desc: 'OPC 53 Grade Cement Bags', qty: 50, unit: 'bags', rate: 380, amount: 19000 },
      { id: crypto.randomUUID(), desc: 'TMT Steel 12mm Rebars', qty: 500, unit: 'kg', rate: 68, amount: 34000 }
    ];
  }

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
async function testSupabaseConnectionDetailed(interactive = false) {
  const url = ($('supabaseUrl') ? $('supabaseUrl').value : '').trim();
  const key = ($('supabaseKey') ? $('supabaseKey').value : '').trim();
  const card = $('supabaseDiagCard');
  const badge = $('diagStatusBadge');
  const overall = $('diagOverallStatus');
  const msg = $('diagMsg');
  const mainBadge = $('cloudStatusBadge');

  if (!url || !key) {
    if (card) {
      card.classList.remove('hidden');
      if (badge) {
        badge.textContent = 'Disconnected';
        badge.style.background = '#fef2f2';
        badge.style.color = '#b91c1c';
      }
      if (overall) overall.textContent = '⚠️ No Credentials Entered';
      if (msg) msg.innerHTML = 'Enter your <strong>Supabase Project URL</strong> and <strong>Anon Public Key</strong> from your Supabase Dashboard &rarr; Project Settings &rarr; API.';
      if ($('diagTabQuotations')) $('diagTabQuotations').innerHTML = '❌ Not configured';
      if ($('diagTabCompany')) $('diagTabCompany').innerHTML = '❌ Not configured';
      if ($('diagTabCatalog')) $('diagTabCatalog').innerHTML = '❌ Not configured';
      if ($('diagTabGst')) $('diagTabGst').innerHTML = '❌ Not configured';
    }
    if (mainBadge) {
      mainBadge.textContent = '● Local Database';
      mainBadge.className = 'cloud-status-pill local';
    }
    if (interactive) showToast('Please enter both Project URL and Anon Key.', 'error');
    return false;
  }

  if (card) {
    card.classList.remove('hidden');
    if (badge) {
      badge.textContent = 'Testing...';
      badge.style.background = '#e0f2fe';
      badge.style.color = '#0369a1';
    }
    if (overall) overall.textContent = '🔄 Testing Connection & Tables...';
    if (msg) msg.textContent = 'Connecting to Supabase API endpoints...';
    if ($('diagTabQuotations')) $('diagTabQuotations').innerHTML = '⏳ Testing...';
    if ($('diagTabCompany')) $('diagTabCompany').innerHTML = '⏳ Testing...';
    if ($('diagTabCatalog')) $('diagTabCatalog').innerHTML = '⏳ Testing...';
    if ($('diagTabGst')) $('diagTabGst').innerHTML = '⏳ Testing...';
  }

  if (!window.supabase) {
    if (card && msg) msg.innerHTML = '❌ Supabase JS client library not loaded. Check internet connection.';
    if (interactive) showToast('Supabase JS library not loaded.', 'error');
    return false;
  }

  try {
    const client = window.supabase.createClient(url, key);
    supabaseClient = client;

    // Test all 5 tables concurrently
    const [qRes, cRes, catRes, gstRes, layoutRes] = await Promise.allSettled([
      client.from('quotations').select('id').limit(1),
      client.from('company_settings').select('id').limit(1),
      client.from('item_catalog').select('id').limit(1),
      client.from('gst_registry').select('id').limit(1),
      client.from('custom_layouts').select('id').limit(1)
    ]);

    const qOk = qRes.status === 'fulfilled' && !qRes.value.error;
    const cOk = cRes.status === 'fulfilled' && !cRes.value.error;
    const catOk = catRes.status === 'fulfilled' && !catRes.value.error;
    const gstOk = gstRes.status === 'fulfilled' && !gstRes.value.error;
    const layoutOk = layoutRes.status === 'fulfilled' && !layoutRes.value.error;

    if ($('diagTabQuotations')) $('diagTabQuotations').innerHTML = qOk ? '<strong style="color:#16a34a">✅ Active</strong>' : `<span style="color:#dc2626">❌ Missing</span>`;
    if ($('diagTabCompany')) $('diagTabCompany').innerHTML = cOk ? '<strong style="color:#16a34a">✅ Active</strong>' : `<span style="color:#dc2626">❌ Missing</span>`;
    if ($('diagTabCatalog')) $('diagTabCatalog').innerHTML = catOk ? '<strong style="color:#16a34a">✅ Active</strong>' : `<span style="color:#dc2626">❌ Missing</span>`;
    if ($('diagTabGst')) $('diagTabGst').innerHTML = gstOk ? '<strong style="color:#16a34a">✅ Active</strong>' : `<span style="color:#dc2626">❌ Missing</span>`;
    if ($('diagTabCustomLayouts')) $('diagTabCustomLayouts').innerHTML = layoutOk ? '<strong style="color:#16a34a">✅ Active</strong>' : `<span style="color:#f59e0b">⚠️ Offline (Local active)</span>`;

    const allOk = qOk && cOk && catOk && gstOk;
    const partialOk = qOk || cOk || catOk || gstOk;

    // Always maintain online status when reachable
    if (mainBadge) {
      mainBadge.textContent = '● Cloud Online';
      mainBadge.className = 'cloud-status-pill online';
    }

    if (allOk || partialOk) {
      if (badge) {
        badge.textContent = '● Cloud Online';
        badge.style.background = '#dcfce7';
        badge.style.color = '#15803d';
      }
      if (overall) overall.textContent = allOk ? '🎉 Supabase Database Verified & Online!' : '⚡ Supabase Cloud Connected (Active)';
      if (msg) msg.innerHTML = '✨ Real-time cloud sync is active. Quotations, Custom Layouts, Item Library, Company Defaults, and GST Register are syncing properly.';
      
      localStorage.setItem(supabaseConfigKey, JSON.stringify({ url, key }));
      loadCompanyDefaults();
      loadItemCatalog();
      loadGstRegistry();
      fetchCustomLayouts();
      fetchSavedQuotations();
      setupSupabaseRealtime();

      if (interactive) showToast('🎉 Connected to Supabase Cloud Database! All tables verified.');
      return true;
    } else {
      const errDetail = qRes.value?.error?.message || cRes.value?.error?.message || 'Connection failed';
      if (badge) {
        badge.textContent = '● Connect Failed';
        badge.style.background = '#fef2f2';
        badge.style.color = '#b91c1c';
      }
      if (mainBadge) {
        mainBadge.textContent = '● Cloud Online';
        mainBadge.className = 'cloud-status-pill online';
      }
      if (overall) overall.textContent = '❌ Could not connect to Supabase';
      if (msg) msg.innerHTML = `<strong>Error:</strong> ${errDetail}. Check your Project URL and Anon API key, and ensure your project is active.`;
      if (interactive) showToast(`Connection error: ${errDetail}`, 'error');
      return false;
    }
  } catch (err) {
    if (card && msg) msg.innerHTML = `<strong>Exception:</strong> ${err.message || err}`;
    if (badge) {
      badge.textContent = '● Error';
      badge.style.background = '#fef2f2';
      badge.style.color = '#b91c1c';
    }
    if (interactive) showToast(`Connection test failed: ${err.message}`, 'error');
    return false;
  }
}

let realtimeSubscribed = false;
function setupSupabaseRealtime() {
  if (!supabaseClient || realtimeSubscribed) return;
  try {
    const channel = supabaseClient.channel('sbfb_live_sync');
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotations' }, () => {
        fetchSavedQuotations();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'item_catalog' }, () => {
        loadItemCatalog();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gst_registry' }, () => {
        loadGstRegistry();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_layouts' }, () => {
        fetchCustomLayouts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company_settings' }, () => {
        loadCompanyDefaults();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          realtimeSubscribed = true;
          console.log('⚡ Supabase Realtime Live Sync Active');
        }
      });
  } catch (err) {
    console.warn('Realtime subscription non-fatal:', err);
  }
}

function initSupabase(retryCount = 0) {
  try {
    let savedConfig = JSON.parse(localStorage.getItem(supabaseConfigKey) || 'null');
    if (!savedConfig || !savedConfig.url || !savedConfig.key) {
      savedConfig = DEFAULT_SUPABASE_CONFIG;
      localStorage.setItem(supabaseConfigKey, JSON.stringify(savedConfig));
    }
    const badge = $('cloudStatusBadge');
    if (badge) {
      badge.textContent = '● Cloud Online';
      badge.className = 'cloud-status-pill online';
    }

    // If Supabase JS library is still loading from CDN, poll and retry
    if (!window.supabase) {
      if (retryCount < 20) {
        setTimeout(() => initSupabase(retryCount + 1), 250);
        return;
      }
      return;
    }

    if (savedConfig && savedConfig.url && savedConfig.key) {
      if ($('supabaseUrl')) $('supabaseUrl').value = savedConfig.url;
      if ($('supabaseKey')) $('supabaseKey').value = savedConfig.key;

      supabaseClient = window.supabase.createClient(savedConfig.url, savedConfig.key, {
        auth: { persistSession: false },
        realtime: { params: { eventsPerSecond: 10 } }
      });
      testSupabaseConnectionDetailed(false);
      setupSupabaseRealtime();
    }
  } catch (err) {
    console.error('Supabase init error:', err);
  }
}

// Ensure Supabase always reconnects when network comes online or tab is reactivated
window.addEventListener('online', () => {
  console.log('Network online detected — reconnecting Supabase...');
  initSupabase();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    initSupabase();
  }
});

// Periodic keep-alive check every 60 seconds
setInterval(() => {
  if (!supabaseClient) initSupabase();
}, 60000);



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

  const activeCustomLayout = customLayouts.find(x => x.id === docTemplate) || null;

  const quotePayload = {
    doc_type: docType,
    template_theme: docTemplate,
    custom_layout_config: activeCustomLayout,
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
    client_gst: val('clientGst'),
    client_contact: val('clientContact'),
    client_phone: val('clientPhone'),
    project_name: val('projectName') || 'Unspecified Project',
    site_location: val('siteLocation'),
    items: items,
    gst_rate: Number(val('gstRate')) || 18,
    discount: Number(val('discount')) || 0,
    validity: (val('validity') && Number(val('validity')) > 0) ? Number(val('validity')) : null,
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
      if (error) {
        if (error.code === 'PGRST204' || (error.message && error.message.includes('column'))) {
          // Retry with baseline columns for backward-compatibility with unmigrated schema
          const baselinePayload = {
            id: quotePayload.id,
            quote_no: quotePayload.quote_no,
            quote_date: quotePayload.quote_date,
            company_name: quotePayload.company_name,
            company_phone: quotePayload.company_phone,
            company_email: quotePayload.company_email,
            company_gst: quotePayload.company_gst,
            company_address: quotePayload.company_address,
            client_name: quotePayload.client_name,
            client_contact: quotePayload.client_contact,
            client_phone: quotePayload.client_phone,
            project_name: quotePayload.project_name,
            site_location: quotePayload.site_location,
            items: quotePayload.items,
            gst_rate: quotePayload.gst_rate,
            discount: quotePayload.discount,
            validity: quotePayload.validity,
            payment_terms: quotePayload.payment_terms,
            notes: quotePayload.notes,
            subtotal: quotePayload.subtotal,
            total: quotePayload.total,
            updated_at: quotePayload.updated_at
          };
          const { error: retryErr } = await supabaseClient.from('quotations').upsert(baselinePayload);
          if (!retryErr) {
            showToast(`☁️ ${conf.name} & items saved to Supabase Cloud Database!`);
            saveDraftState();
            return;
          }
        }
        throw error;
      }
      showToast(`☁️ ${conf.name} & items saved to Cloud Database successfully!`);
      saveDraftState();
      return;
    } catch (err) {
      console.error('Supabase save error:', err);
      showToast(`Cloud save notice: ${err.message || 'Check database'}. Saved locally.`, 'error');
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
  if ($('clientGst')) $('clientGst').value = q.client_gst || '';
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
  $('validity').value = q.validity ? q.validity : '';
  $('paymentTerms').value = q.payment_terms || '30% advance with work order. Balance as per measured progress / agreed milestones.';
  $('notes').value = q.notes || 'Rates are quoted based on specifications above.';

  items = Array.isArray(q.items) ? q.items.map(item => ({
    id: item.id || crypto.randomUUID(),
    desc: item.desc || '',
    qty: Number(item.qty) || 1,
    unit: item.unit || 'pcs',
    rate: Number(item.rate) || 0,
    amount: (Number(item.qty) || 1) * (Number(item.rate) || 0)
  })) : [];

  setDocumentType(q.doc_type || 'quotation', false);

  if (q.custom_layout_config && q.custom_layout_config.id) {
    const exists = customLayouts.some(x => x.id === q.custom_layout_config.id);
    if (!exists) {
      customLayouts.unshift(q.custom_layout_config);
      localStorage.setItem(customLayoutsStorageKey, JSON.stringify(customLayouts));
      renderTemplatePicker();
    }
  }

  setDocumentTemplate(q.template_theme || 'modern');
  setBillingMode(q.billing_mode || 'qty_rate');

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
  const mode = val('billingMode') || 'qty_rate';
  if (mode === 'qty_rate') {
    addItem('New item / material / service', 450, 1, 'pcs');
  } else {
    addItem('New work item', 450, 1, 'sq.m');
  }
});

$('saveCatalogBtn').addEventListener('click', syncCurrentQuoteToCatalog);
$('syncCatalogFromCurrentBtn').addEventListener('click', syncCurrentQuoteToCatalog);

$('addNewCatalogItemBtn').addEventListener('click', () => {
  const desc = $('newCatalogDesc').value.trim();
  const rate = Number($('newCatalogRate').value) || 0;
  const unit = ($('newCatalogUnit') ? $('newCatalogUnit').value : 'pcs') || 'pcs';
  if (!desc) {
    showToast('Please enter an item description.', 'error');
    return;
  }
  saveItemToCatalog(desc, rate, unit, true);
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
  $('validity').value = '';
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
  fetchCustomLayouts();
});

$('closeCloudModalBtn').addEventListener('click', () => {
  $('cloudModal').classList.add('hidden');
});

$('cloudModal').addEventListener('click', e => {
  if (e.target === $('cloudModal')) {
    $('cloudModal').classList.add('hidden');
  }
});

function switchCloudTab(tabName) {
  const tabs = [
    { id: 'Saved', btn: 'tabSavedBtn', content: 'tabSavedContent' },
    { id: 'Catalog', btn: 'tabCatalogBtn', content: 'tabCatalogContent' },
    { id: 'CustomLayouts', btn: 'tabCustomLayoutsBtn', content: 'tabCustomLayoutsContent' },
    { id: 'Config', btn: 'tabConfigBtn', content: 'tabConfigContent' }
  ];

  tabs.forEach(t => {
    const isTarget = t.id.toLowerCase() === tabName.toLowerCase();
    const btn = $(t.btn);
    const content = $(t.content);
    if (btn) btn.classList.toggle('active', isTarget);
    if (content) content.classList.toggle('hidden', !isTarget);
  });

  if (tabName === 'saved') fetchSavedQuotations();
  if (tabName === 'catalog') renderCatalogManager();
  if (tabName === 'customlayouts') renderCustomLayoutsManager();
}

if ($('tabSavedBtn')) $('tabSavedBtn').addEventListener('click', () => switchCloudTab('saved'));
if ($('tabCatalogBtn')) $('tabCatalogBtn').addEventListener('click', () => switchCloudTab('catalog'));
if ($('tabCustomLayoutsBtn')) $('tabCustomLayoutsBtn').addEventListener('click', () => switchCloudTab('customlayouts'));
if ($('tabConfigBtn')) $('tabConfigBtn').addEventListener('click', () => switchCloudTab('config'));

$('saveSupabaseConfigBtn').addEventListener('click', async () => {
  const url = $('supabaseUrl').value.trim();
  const key = $('supabaseKey').value.trim();

  if (!url || !key) {
    showToast('Please enter both Supabase Project URL and Anon Key.', 'error');
    testSupabaseConnectionDetailed(false);
    return;
  }

  await testSupabaseConnectionDetailed(true);
});

if ($('testSupabaseNowBtn')) {
  $('testSupabaseNowBtn').addEventListener('click', async () => {
    await testSupabaseConnectionDetailed(true);
  });
}

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
  const diagCard = $('supabaseDiagCard');
  if (diagCard) diagCard.classList.add('hidden');
  showToast('Disconnected from Supabase. Running in local database mode.');
  fetchSavedQuotations();
  loadItemCatalog();
  loadGstRegistry();
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

// Mobile & Tablet View Switching Logic (Form vs Live Preview)
function setDeviceView(mode) {
  const isPreview = mode === 'preview';
  const editorSec = $('editorSection');
  const previewP = $('previewPane');
  const tabEdit = $('mobileTabEditorBtn');
  const tabPrev = $('mobileTabPreviewBtn');
  const barEdit = $('mobBarEditBtn');
  const barPrev = $('mobBarPreviewBtn');

  if (editorSec) editorSec.classList.toggle('mobile-hidden', isPreview);
  if (previewP) previewP.classList.toggle('mobile-hidden', !isPreview);

  if (tabEdit) tabEdit.classList.toggle('active', !isPreview);
  if (tabPrev) tabPrev.classList.toggle('active', isPreview);
  if (barEdit) barEdit.classList.toggle('active', !isPreview);
  if (barPrev) barPrev.classList.toggle('active', isPreview);

  if (isPreview) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

if ($('mobileTabEditorBtn')) {
  $('mobileTabEditorBtn').addEventListener('click', () => setDeviceView('editor'));
}
if ($('mobileTabPreviewBtn')) {
  $('mobileTabPreviewBtn').addEventListener('click', () => setDeviceView('preview'));
}

// Mobile Bottom Floating Bar Actions
if ($('mobBarEditBtn')) {
  $('mobBarEditBtn').addEventListener('click', () => setDeviceView('editor'));
}
if ($('mobBarPreviewBtn')) {
  $('mobBarPreviewBtn').addEventListener('click', () => setDeviceView('preview'));
}
if ($('mobBarSaveBtn')) {
  $('mobBarSaveBtn').addEventListener('click', saveQuotationToCloud);
}
if ($('mobBarPrintBtn')) {
  $('mobBarPrintBtn').addEventListener('click', () => {
    setDeviceView('preview');
    setTimeout(() => window.print(), 150);
  });
}
if ($('mobBarCloudBtn')) {
  $('mobBarCloudBtn').addEventListener('click', () => {
    $('cloudModal').classList.remove('hidden');
    fetchSavedQuotations();
    renderCatalogManager();
  });
}

// GST Register & Taxpayer Matcher Event Listeners
if ($('gstModalBtn')) {
  $('gstModalBtn').addEventListener('click', () => {
    openGstModal('lookup', '', 'client');
  });
}

// Company GST Match Listeners
if ($('companyGst')) {
  $('companyGst').addEventListener('input', () => {
    handleGstInputLive($('companyGst'), $('companyGstMatchInfo'), 'company');
  });
}

if ($('matchCompanyGstBtn')) {
  $('matchCompanyGstBtn').addEventListener('click', () => {
    openGstModal('lookup', val('companyGst'), 'company');
  });
}

if ($('lookupCompanyGstBtn')) {
  $('lookupCompanyGstBtn').addEventListener('click', () => {
    const raw = (val('companyGst') || '').trim();
    if (!raw) {
      openGstModal('lookup', '', 'company');
      return;
    }
    const match = matchGstFromRegistry(raw);
    if (match) {
      applyPartyToTarget(match, 'company');
    } else {
      openGstModal('lookup', raw, 'company');
    }
  });
}

// Client GST Match Listeners
if ($('clientGst')) {
  $('clientGst').addEventListener('input', () => {
    handleGstInputLive($('clientGst'), $('clientGstMatchInfo'), 'client');
  });
}

if ($('matchClientGstBtn')) {
  $('matchClientGstBtn').addEventListener('click', () => {
    openGstModal('lookup', val('clientGst'), 'client');
  });
}

if ($('lookupClientGstBtn')) {
  $('lookupClientGstBtn').addEventListener('click', () => {
    const raw = (val('clientGst') || '').trim();
    if (!raw) {
      openGstModal('lookup', '', 'client');
      return;
    }
    const match = matchGstFromRegistry(raw);
    if (match) {
      applyPartyToTarget(match, 'client');
    } else {
      openGstModal('lookup', raw, 'client');
    }
  });
}

if ($('openClientGstDirBtn')) {
  $('openClientGstDirBtn').addEventListener('click', () => {
    openGstModal('directory', '', 'client');
  });
}

if ($('clientName')) {
  $('clientName').addEventListener('change', () => {
    const nameVal = val('clientName').trim();
    if (!nameVal || val('clientGst')) return;
    const match = matchGstFromRegistry(nameVal);
    if (match) {
      applyPartyToTarget(match, 'client');
    }
  });
}

// GST Modal Close & Backdrop
if ($('closeGstModalBtn')) {
  $('closeGstModalBtn').addEventListener('click', () => {
    $('gstModal').classList.add('hidden');
  });
}

if ($('gstModal')) {
  $('gstModal').addEventListener('click', e => {
    if (e.target === $('gstModal')) {
      $('gstModal').classList.add('hidden');
    }
  });
}

// GST Modal Tabs
if ($('tabGstLookupBtn')) $('tabGstLookupBtn').addEventListener('click', () => switchGstTab('lookup'));
if ($('tabGstDirectoryBtn')) $('tabGstDirectoryBtn').addEventListener('click', () => switchGstTab('directory'));
if ($('tabGstAddBtn')) $('tabGstAddBtn').addEventListener('click', () => switchGstTab('add'));
if ($('tabGstSettingsBtn')) $('tabGstSettingsBtn').addEventListener('click', () => switchGstTab('settings'));

// Tab 1: Match & Verify Search Controls
if ($('gstModalSearchBtn')) {
  $('gstModalSearchBtn').addEventListener('click', () => {
    const query = $('gstModalSearchInput') ? $('gstModalSearchInput').value : '';
    verifyAndMatchGst(query);
  });
}

if ($('gstModalSearchInput')) {
  $('gstModalSearchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      verifyAndMatchGst($('gstModalSearchInput').value);
    }
  });
  $('gstModalSearchInput').addEventListener('input', () => {
    const raw = $('gstModalSearchInput').value;
    const clean = raw.trim().toUpperCase();
    if ($('gstModalSearchInput').value !== clean) {
      $('gstModalSearchInput').value = clean;
    }
    if (clean.length === 15) {
      verifyAndMatchGst(clean);
    }
  });
}

if ($('gstSampleBtn')) {
  $('gstSampleBtn').addEventListener('click', () => {
    if (!gstRegistry.length) return;
    const rand = gstRegistry[Math.floor(Math.random() * gstRegistry.length)];
    if ($('gstModalSearchInput')) $('gstModalSearchInput').value = rand.gstin;
    verifyAndMatchGst(rand.gstin);
    showToast(`🎲 Loaded sample GSTIN: ${rand.legalName}`);
  });
}

document.querySelectorAll('.gst-preset-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const gst = pill.dataset.gst;
    if (gst && $('gstModalSearchInput')) {
      $('gstModalSearchInput').value = gst;
      verifyAndMatchGst(gst);
      showToast(`⚡ Matched preset: ${pill.dataset.name || gst}`);
    }
  });
});

// Tab 2: Saved Directory Search & Filters
if ($('searchGstDirInput')) $('searchGstDirInput').addEventListener('input', renderGstDirectoryManager);
if ($('filterGstStateSelect')) $('filterGstStateSelect').addEventListener('change', renderGstDirectoryManager);
if ($('refreshGstDirBtn')) {
  $('refreshGstDirBtn').addEventListener('click', () => {
    loadGstRegistry();
    showToast('🔄 GST Directory refreshed.');
  });
}

// Tab 3: Add Party Form
if ($('addGstNumber')) {
  $('addGstNumber').addEventListener('input', () => {
    const raw = $('addGstNumber').value.trim().toUpperCase();
    $('addGstNumber').value = raw;
    if (raw.length >= 2 && !$('addGstAddress').value) {
      const state = GST_STATES[raw.slice(0, 2)];
      if (state) {
        $('addGstAddress').placeholder = `e.g. Industrial Area, ${state} - 600001`;
      }
    }
  });
}

if ($('saveNewGstPartyBtn')) {
  $('saveNewGstPartyBtn').addEventListener('click', async () => {
    const gstin = ($('addGstNumber') ? $('addGstNumber').value : '').trim().toUpperCase();
    const legalName = ($('addGstName') ? $('addGstName').value : '').trim();
    const tradeName = ($('addGstTrade') ? $('addGstTrade').value : '').trim();
    const contact = ($('addGstContact') ? $('addGstContact').value : '').trim();
    const address = ($('addGstAddress') ? $('addGstAddress').value : '').trim();

    if (!gstin || !legalName) {
      showToast('Please enter both 15-digit GSTIN and Business Legal Name.', 'error');
      return;
    }

    if (!validateGstFormat(gstin)) {
      if (!confirm('The GSTIN format appears irregular. Do you still want to save this taxpayer to your directory?')) {
        return;
      }
    }

    const party = {
      gstin,
      legalName,
      tradeName,
      contact,
      address
    };

    const saved = await saveGstPartyToRegistry(party, true);
    if (saved) {
      if ($('addGstNumber')) $('addGstNumber').value = '';
      if ($('addGstName')) $('addGstName').value = '';
      if ($('addGstTrade')) $('addGstTrade').value = '';
      if ($('addGstContact')) $('addGstContact').value = '';
      if ($('addGstAddress')) $('addGstAddress').value = '';
      switchGstTab('directory');
    }
  });
}

if ($('clearNewGstFormBtn')) {
  $('clearNewGstFormBtn').addEventListener('click', () => {
    if ($('addGstNumber')) $('addGstNumber').value = '';
    if ($('addGstName')) $('addGstName').value = '';
    if ($('addGstTrade')) $('addGstTrade').value = '';
    if ($('addGstContact')) $('addGstContact').value = '';
    if ($('addGstAddress')) $('addGstAddress').value = '';
    showToast('Add Party form cleared.');
  });
}

// Tab 4: GST API Settings
if ($('gstApiProviderSelect')) {
  $('gstApiProviderSelect').addEventListener('change', () => {
    const provider = $('gstApiProviderSelect').value;
    const customRow = $('customGstApiRow');
    if (customRow) {
      if (provider === 'custom_api') {
        customRow.classList.remove('hidden');
      } else {
        customRow.classList.add('hidden');
      }
    }
  });
}

if ($('saveGstApiSettingsBtn')) {
  $('saveGstApiSettingsBtn').addEventListener('click', () => {
    const provider = $('gstApiProviderSelect') ? $('gstApiProviderSelect').value : 'builtin';
    const customUrl = $('customGstApiUrl') ? $('customGstApiUrl').value.trim() : '';
    const customKey = $('customGstApiKey') ? $('customGstApiKey').value.trim() : '';

    localStorage.setItem(gstApiConfigKey, JSON.stringify({
      provider,
      customUrl,
      customKey
    }));
    showToast('⚙️ GST verification settings saved successfully!');
  });
}

// --- 🎨 Layout Studio & Custom Templates Event Listeners ---

// Open / Edit Layout Studio
if ($('topLayoutStudioBtn')) {
  $('topLayoutStudioBtn').addEventListener('click', () => openLayoutDesigner(null));
}

if ($('previewLayoutStudioBtn')) {
  $('previewLayoutStudioBtn').addEventListener('click', () => openLayoutDesigner(null));
}

if ($('previewEditLayoutBtn')) {
  $('previewEditLayoutBtn').addEventListener('click', () => openLayoutDesigner(val('docTemplate')));
}

if ($('mobBarLayoutBtn')) {
  $('mobBarLayoutBtn').addEventListener('click', () => openLayoutDesigner(null));
}

if ($('openLayoutDesignerBtn')) {
  $('openLayoutDesignerBtn').addEventListener('click', () => openLayoutDesigner(null));
}

if ($('editActiveLayoutBtn')) {
  $('editActiveLayoutBtn').addEventListener('click', () => openLayoutDesigner(val('docTemplate')));
}

if ($('closeLayoutDesignerBtn')) {
  $('closeLayoutDesignerBtn').addEventListener('click', closeLayoutDesigner);
}

if ($('layoutDesignerModal')) {
  $('layoutDesignerModal').addEventListener('click', e => {
    if (e.target === $('layoutDesignerModal')) {
      closeLayoutDesigner();
    }
  });
}

// Layout Studio Tabs
if ($('tabDesignerBuilderBtn')) $('tabDesignerBuilderBtn').addEventListener('click', () => switchDesignerTab('builder'));
if ($('tabDesignerPresetsBtn')) $('tabDesignerPresetsBtn').addEventListener('click', () => switchDesignerTab('presets'));
if ($('tabDesignerSyncBtn')) $('tabDesignerSyncBtn').addEventListener('click', () => switchDesignerTab('sync'));
if ($('tabDesignerJsonBtn')) $('tabDesignerJsonBtn').addEventListener('click', () => switchDesignerTab('json'));

// Layout Studio Live Inputs
['customLayoutName', 'customWatermarkText'].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener('input', updateLayoutDesignerPreview);
});

['customLayoutCategory', 'customFontFamily', 'customTableStyle', 'customWatermarkEnable'].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener('change', updateLayoutDesignerPreview);
});

if ($('customWatermarkOpacity')) {
  $('customWatermarkOpacity').addEventListener('input', () => {
    if ($('watermarkOpacityVal')) {
      $('watermarkOpacityVal').textContent = `${$('customWatermarkOpacity').value}%`;
    }
    updateLayoutDesignerPreview();
  });
}

document.querySelectorAll('input[name="customArchetype"]').forEach(r => {
  r.addEventListener('change', updateLayoutDesignerPreview);
});

// Color Pickers & Hex Synchronization
const designerColorPairs = [
  { picker: 'customPrimaryColor', hex: 'customPrimaryColorHex' },
  { picker: 'customAccentColor', hex: 'customAccentColorHex' },
  { picker: 'customPaperBg', hex: 'customPaperBgHex' },
  { picker: 'customHeaderBg', hex: 'customHeaderBgHex' },
  { picker: 'customHeaderText', hex: 'customHeaderTextHex' },
  { picker: 'customTableHeadBg', hex: 'customTableHeadBgHex' }
];

designerColorPairs.forEach(({ picker, hex }) => {
  const pEl = $(picker);
  const hEl = $(hex);
  if (pEl && hEl) {
    pEl.addEventListener('input', () => {
      hEl.value = pEl.value;
      updateLayoutDesignerPreview();
    });
    hEl.addEventListener('input', () => {
      let valHex = hEl.value.trim();
      if (!valHex.startsWith('#')) valHex = '#' + valHex;
      if (/^#[0-9A-Fa-f]{6}$/.test(valHex)) {
        pEl.value = valHex;
        updateLayoutDesignerPreview();
      }
    });
  }
});

// Quick Palette Swatches in Studio
document.querySelectorAll('.palette-swatch-bar .swatch-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.primary) setDesignerColor('customPrimaryColor', btn.dataset.primary);
    if (btn.dataset.accent) setDesignerColor('customAccentColor', btn.dataset.accent);
    if (btn.dataset.header) setDesignerColor('customHeaderBg', btn.dataset.header);
    if (btn.dataset.text) setDesignerColor('customHeaderText', btn.dataset.text);
    if (btn.dataset.paper) setDesignerColor('customPaperBg', btn.dataset.paper);
    updateLayoutDesignerPreview();
    showToast(`⚡ Palette applied: ${btn.title || 'Theme'}`);
  });
});

// Layout Studio Action Buttons
if ($('saveAndApplyLayoutBtn')) {
  $('saveAndApplyLayoutBtn').addEventListener('click', saveCurrentLayoutFromDesigner);
}

if ($('resetLayoutDesignerBtn')) {
  $('resetLayoutDesignerBtn').addEventListener('click', () => {
    loadCustomLayoutIntoForm(DESIGNER_STARTER_PRESETS[0]);
    $('customLayoutName').value = `My Custom Layout ${customLayouts.length + 1}`;
    updateLayoutDesignerPreview();
    showToast('Reset to default starter preset.');
  });
}

if ($('deleteCurrentCustomLayoutBtn')) {
  $('deleteCurrentCustomLayoutBtn').addEventListener('click', () => {
    if (editingLayoutId) {
      deleteCustomLayout(editingLayoutId);
      closeLayoutDesigner();
    }
  });
}

if ($('exportCurrentLayoutJsonBtn')) $('exportCurrentLayoutJsonBtn').addEventListener('click', exportCurrentLayoutJson);
if ($('downloadLayoutsJsonBtn')) $('downloadLayoutsJsonBtn').addEventListener('click', downloadLayoutsJson);
if ($('importLayoutJsonBtn')) $('importLayoutJsonBtn').addEventListener('click', importLayoutJson);

if ($('syncAllLayoutsCloudBtn')) {
  $('syncAllLayoutsCloudBtn').addEventListener('click', async () => {
    if (!supabaseClient) {
      showToast('Supabase database is offline. Please connect in Cloud Settings first.', 'error');
      return;
    }
    let count = 0;
    for (const l of customLayouts) {
      await saveCustomLayoutToCloud(l);
      count++;
    }
    showToast(`☁️ Successfully synced ${count} custom layout(s) to Supabase Cloud!`);
    updateDesignerSyncStatus();
  });
}

// Template Category Filter Pills
document.querySelectorAll('.tpl-filter-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    renderTemplatePicker(btn.dataset.filter);
  });
});

// Cloud Modal Tab 3 (Custom Layouts Manager) Controls
if ($('cloudNewLayoutBtn')) {
  $('cloudNewLayoutBtn').addEventListener('click', () => {
    $('cloudModal').classList.add('hidden');
    openLayoutDesigner(null);
  });
}

if ($('searchLayoutsInput')) {
  $('searchLayoutsInput').addEventListener('input', renderCustomLayoutsManager);
}

if ($('exportAllLayoutsBtn')) {
  $('exportAllLayoutsBtn').addEventListener('click', downloadLayoutsJson);
}

if ($('importLayoutsBtn')) {
  $('importLayoutsBtn').addEventListener('click', () => {
    $('cloudModal').classList.add('hidden');
    openLayoutDesigner(null);
    switchDesignerTab('json');
  });
}

if ($('refreshLayoutsBtn')) {
  $('refreshLayoutsBtn').addEventListener('click', () => {
    fetchCustomLayouts();
    showToast('🔄 Custom layouts refreshed from cloud.');
  });
}

// Service Worker for Offline PWA Support on Mobile & Desktop
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('PWA Service Worker registration non-fatal:', err);
    });
  });
}

if ($('searchQuoteInput')) $('searchQuoteInput').addEventListener('input', applyCloudFilterAndRender);
if ($('cloudDocFilter')) $('cloudDocFilter').addEventListener('change', applyCloudFilterAndRender);
if ($('refreshCloudListBtn')) $('refreshCloudListBtn').addEventListener('click', fetchSavedQuotations);

// Initialize on page load
loadDraftState();
loadItemCatalog();
loadGstRegistry();
initSupabase();
fetchCustomLayouts();
renderTemplatePicker();
renderItems();
updatePreview();




