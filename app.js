const $ = id => document.getElementById(id);

// Quotation fields (Quotation Number is optional and stays blank if omitted)
const fields = [
  'quoteNo', 'companyName', 'companyPhone', 'companyEmail', 'companyGst', 'companyAddress',
  'clientName', 'clientContact', 'clientPhone', 'quoteDate', 'projectName', 'siteLocation',
  'gstRate', 'discount', 'validity', 'paymentTerms', 'notes'
];

const stateKey = 'sbfbQuotationState';
const companyDefaultsKey = 'sbfbCompanyDefaults';
const localQuotesKey = 'sbfbLocalCloudQuotes';
const supabaseConfigKey = 'sbfbSupabaseConfig';

let items = [];
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

function showToast(message, type = 'success') {
  const toast = $('toastNotification');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type}`;
  setTimeout(() => {
    toast.className = 'toast hidden';
  }, 3500);
}

/* --- Work Items Logic (Description + Rate per Sq. Meter) --- */
function addItem(desc = '', rate = 450) {
  items.push({
    id: crypto.randomUUID(),
    desc,
    rate: Number(rate) || 0
  });
  renderItems();
  updatePreview();
}

function renderItems() {
  const tbody = $('itemsBody');
  if (!tbody) return;

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="padding:24px;text-align:center;color:#94a3b8;font-size:12px">No items added yet. Click "+ Add item" or use quick presets below.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map((x, i) => `
    <tr>
      <td style="text-align:center;color:#64748b;font-weight:700;font-size:12px">${i + 1}</td>
      <td>
        <input class="item-desc" data-id="${x.id}" data-k="desc" value="${esc(x.desc)}" placeholder="e.g. Fly ash brick masonry with cement mortar">
      </td>
      <td>
        <input class="num" type="number" min="0" step="0.01" data-id="${x.id}" data-k="rate" value="${x.rate}" placeholder="Rate in ₹ / sq.m">
      </td>
      <td style="text-align:center;">
        <button class="remove" data-remove="${x.id}" title="Remove item">&times;</button>
      </td>
    </tr>
  `).join('');

  // Attach input listeners
  tbody.querySelectorAll('[data-id][data-k]').forEach(el => {
    el.addEventListener('input', e => {
      const x = items.find(a => a.id === e.target.dataset.id);
      if (!x) return;

      const key = e.target.dataset.k;
      if (key === 'rate') {
        x.rate = Number(e.target.value) || 0;
      } else {
        x[key] = e.target.value;
      }
      updatePreview();
    });
  });

  tbody.querySelectorAll('[data-remove]').forEach(el => {
    el.addEventListener('click', () => {
      items = items.filter(x => x.id !== el.dataset.remove);
      renderItems();
      updatePreview();
    });
  });
}

function val(id) {
  return $(id) ? $(id).value : '';
}

/* --- Live Preview & Calculations --- */
function updatePreview() {
  const quoteDate = val('quoteDate') || today();
  const qNo = (val('quoteNo') || '').trim();

  $('quoteDateBadge').textContent = formatDate(quoteDate) || 'Today';
  $('pQuoteDate').textContent = formatDate(quoteDate) || 'Today';

  const pQuoteNoWrap = $('pQuoteNoWrap');
  const pQuoteNo = $('pQuoteNo');
  if (qNo) {
    if (pQuoteNo) pQuoteNo.textContent = qNo;
    if (pQuoteNoWrap) pQuoteNoWrap.classList.remove('hidden');
    $('quoteDateBadge').textContent = `${formatDate(quoteDate)} (${qNo})`;
  } else {
    if (pQuoteNo) pQuoteNo.textContent = '';
    if (pQuoteNoWrap) pQuoteNoWrap.classList.add('hidden');
    $('quoteDateBadge').textContent = formatDate(quoteDate) || 'Today';
  }

  $('pCompanyName').textContent = val('companyName') || 'Sri Balamurugan Fly Ash Bricks & Roadwork';
  $('pCompanyName2').textContent = val('companyName') || 'Sri Balamurugan Fly Ash Bricks & Roadwork';
  $('pCompanyAddress').textContent = val('companyAddress');
  $('pCompanyPhone').textContent = val('companyPhone');
  $('pCompanyEmail').textContent = val('companyEmail');
  $('pCompanyGst').textContent = val('companyGst') ? `GSTIN: ${val('companyGst')}` : '';

  $('pClientName').textContent = val('clientName') || 'Client name';
  $('pClientContact').textContent = val('clientContact') || 'Contact person';
  $('pClientPhone').textContent = val('clientPhone') || 'Client phone';
  $('pProjectName').textContent = val('projectName') || 'Project / Site Work';
  $('pSiteLocation').textContent = val('siteLocation') || 'Site location';

  $('pValidity').textContent = `${val('validity') || 15} days`;
  $('pValidity2').textContent = `${val('validity') || 15} days`;
  $('pPaymentTerms').textContent = val('paymentTerms');
  $('pNotes').textContent = val('notes');

  const subtotal = items.reduce((s, x) => s + (Number(x.rate) || 0), 0);
  const discount = Math.min(Math.max(Number(val('discount')) || 0, 0), subtotal);
  const taxable = subtotal - discount;
  const gst = taxable * (Math.max(Number(val('gstRate')) || 0, 0) / 100);
  const total = taxable + gst;

  $('pSubtotal').textContent = money(subtotal);
  $('pDiscount').textContent = money(discount);
  $('pGst').textContent = money(gst);
  $('pTotal').textContent = money(total);

  // Render preview table rows
  const previewTbody = $('previewItems');
  if (previewTbody) {
    if (!items.length) {
      previewTbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#94a3b8;padding:25px">Add work items to build quotation preview.</td></tr>`;
    } else {
      previewTbody.innerHTML = items.map((x, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${esc(x.desc || 'Work description')}</strong></td>
          <td class="right"><strong>${money(x.rate || 0)}</strong> <span style="font-size:8.5px;color:#64748b">/ sq.m</span></td>
        </tr>
      `).join('');
    }
  }

  saveDraftState();
}

/* --- Local Draft State --- */
function saveDraftState() {
  const data = {
    currentQuoteId,
    fields: Object.fromEntries(fields.map(id => [id, val(id)])),
    items
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
      if (Array.isArray(data.items) && data.items.length) {
        items = data.items;
      }
    }
  } catch {}

  if (!$('quoteDate').value) {
    $('quoteDate').value = today();
  }
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
    company_phone: val('companyPhone'),
    company_email: val('companyEmail'),
    company_gst: val('companyGst'),
    company_address: val('companyAddress')
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
      showToast('✅ Company details saved to Cloud Database as default!');
      return;
    } catch (err) {
      console.warn('Cloud company save fallback:', err);
    }
  }

  showToast('💾 Company details saved as default locally!');
}

async function loadCompanyDefaults() {
  // If Supabase is connected, attempt to fetch cloud defaults
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('company_settings').select('*').eq('id', 'default').single();
      if (!error && data) {
        if (!$('companyName').value || $('companyName').value === 'Your Roadwork Company') {
          if (data.company_name) $('companyName').value = data.company_name;
          if (data.company_phone) $('companyPhone').value = data.company_phone;
          if (data.company_email) $('companyEmail').value = data.company_email;
          if (data.company_gst) $('companyGst').value = data.company_gst;
          if (data.company_address) $('companyAddress').value = data.company_address;
          updatePreview();
        }
        return;
      }
    } catch {}
  }

  // Local defaults fallback
  try {
    const local = JSON.parse(localStorage.getItem(companyDefaultsKey) || 'null');
    if (local) {
      if (local.company_name) $('companyName').value = local.company_name;
      if (local.company_phone) $('companyPhone').value = local.company_phone;
      if (local.company_email) $('companyEmail').value = local.company_email;
      if (local.company_gst) $('companyGst').value = local.company_gst;
      if (local.company_address) $('companyAddress').value = local.company_address;
      updatePreview();
    }
  } catch {}
}

async function saveQuotationToCloud() {
  const subtotal = items.reduce((s, x) => s + (Number(x.rate) || 0), 0);
  const discount = Math.min(Math.max(Number(val('discount')) || 0, 0), subtotal);
  const taxable = subtotal - discount;
  const gst = taxable * (Math.max(Number(val('gstRate')) || 0, 0) / 100);
  const total = taxable + gst;

  const quotePayload = {
    quote_no: (val('quoteNo') || '').trim() || null,
    quote_date: val('quoteDate') || today(),
    company_name: val('companyName'),
    company_phone: val('companyPhone'),
    company_email: val('companyEmail'),
    company_gst: val('companyGst'),
    company_address: val('companyAddress'),
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
      showToast('☁️ Quotation saved to Cloud Database successfully!');
      saveDraftState();
      return;
    } catch (err) {
      console.error('Supabase save error:', err);
      showToast(`Cloud save error: ${err.message || 'Check database permissions'}. Saved locally.`, 'error');
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
  showToast('💾 Quotation saved to local cloud cache!');
}

async function fetchSavedQuotations() {
  const listEl = $('savedQuotesList');
  if (!listEl) return;
  listEl.innerHTML = '<div class="empty-state">Loading quotations...</div>';

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
  renderSavedQuotesList(quotes);
}

function renderSavedQuotesList(quotes) {
  const listEl = $('savedQuotesList');
  if (!listEl) return;

  if (!quotes.length) {
    listEl.innerHTML = `
      <div class="empty-state">
        <p>No saved quotations found in the database.</p>
        <small>Click "Save to Cloud" on any quotation to store it here.</small>
      </div>
    `;
    return;
  }

  listEl.innerHTML = quotes.map(q => {
    const dateFormatted = formatDate(q.quote_date) || 'No date';
    const quoteNoTag = q.quote_no ? ` &bull; 🏷️ ${esc(q.quote_no)}` : '';
    const itemsCount = Array.isArray(q.items) ? q.items.length : 0;
    const client = esc(q.client_name || 'Unnamed Client');
    const project = esc(q.project_name || 'Project');
    const total = money(q.total || 0);

    return `
      <div class="quote-card">
        <div class="quote-card-main">
          <strong>${client} — ${project}</strong>
          <p>📅 ${dateFormatted}${quoteNoTag} &bull; 📦 ${itemsCount} items &bull; 📍 ${esc(q.site_location || 'Site not set')}</p>
        </div>
        <div class="quote-card-right">
          <div class="quote-card-amount">${total}</div>
          <button class="btn small primary" data-load-id="${q.id}">📂 Open</button>
          <button class="btn small ghost-dark" data-delete-id="${q.id}" title="Delete quotation">&times;</button>
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
  $('companyName').value = q.company_name || 'Sri Balamurugan Fly Ash Bricks & Roadwork';
  $('companyPhone').value = q.company_phone || '';
  $('companyEmail').value = q.company_email || '';
  $('companyGst').value = q.company_gst || '';
  $('companyAddress').value = q.company_address || '';

  $('clientName').value = q.client_name || '';
  $('clientContact').value = q.client_contact || '';
  $('clientPhone').value = q.client_phone || '';
  $('projectName').value = q.project_name || '';
  $('siteLocation').value = q.site_location || '';

  $('gstRate').value = q.gst_rate ?? 18;
  $('discount').value = q.discount ?? 0;
  $('validity').value = q.validity ?? 15;
  $('paymentTerms').value = q.payment_terms || '30% advance with work order. Balance as per measured progress / agreed milestones.';
  $('notes').value = q.notes || 'Rates are quoted per sq. meter based on the specifications above. Final billing will be based on actual site measurements.';

  items = Array.isArray(q.items) ? q.items.map(item => ({
    id: item.id || crypto.randomUUID(),
    desc: item.desc || '',
    rate: Number(item.rate) || 0
  })) : [];

  renderItems();
  updatePreview();

  $('cloudModal').classList.add('hidden');
  showToast(`📂 Loaded quotation for ${q.client_name || 'Client'}!`);
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

/* --- Event Handlers & Initialization --- */
fields.forEach(id => {
  const el = $(id);
  if (el) el.addEventListener('input', updatePreview);
});

$('addItemBtn').addEventListener('click', () => {
  addItem('New work item', 450);
});

// Quick Presets
document.querySelectorAll('[data-preset]').forEach(btn => {
  btn.addEventListener('click', () => {
    const [desc, rate] = btn.dataset.preset.split('|');
    addItem(desc, Number(rate) || 0);
  });
});

$('saveCompanyDefaultBtn').addEventListener('click', saveCompanyDefaults);
$('saveCloudBtn').addEventListener('click', saveQuotationToCloud);
$('printBtn').addEventListener('click', () => window.print());

// New quotation reset
$('resetBtn').addEventListener('click', () => {
  if (!confirm('Start a new quotation? Current unsaved draft will be cleared.')) return;
  currentQuoteId = crypto.randomUUID();
  $('quoteNo').value = '';
  $('quoteDate').value = today();
  $('clientName').value = '';
  $('clientContact').value = '';
  $('clientPhone').value = '';
  $('projectName').value = '';
  $('siteLocation').value = '';
  $('gstRate').value = 18;
  $('discount').value = 0;
  $('validity').value = 15;
  $('paymentTerms').value = '30% advance with work order. Balance as per measured progress / agreed milestones.';
  $('notes').value = 'Rates are quoted per sq. meter based on the specifications above. Final billing will be based on actual site measurements.';

  items = [];
  loadCompanyDefaults();
  addItem('Building construction & structural civil work', 1850);
  addItem('Fly ash brick masonry with cement mortar', 450);
  addItem('Internal & external wall plastering', 220);
  showToast('✨ Started a new quotation.');
});

// Cloud Modal Controls
$('cloudModalBtn').addEventListener('click', () => {
  $('cloudModal').classList.remove('hidden');
  fetchSavedQuotations();
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
  $('tabConfigBtn').classList.remove('active');
  $('tabSavedContent').classList.remove('hidden');
  $('tabConfigContent').classList.add('hidden');
  fetchSavedQuotations();
});

$('tabConfigBtn').addEventListener('click', () => {
  $('tabConfigBtn').classList.add('active');
  $('tabSavedBtn').classList.remove('active');
  $('tabConfigContent').classList.remove('hidden');
  $('tabSavedContent').classList.add('hidden');
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
  setTimeout(() => fetchSavedQuotations(), 1000);
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
});

$('copySqlBtn').addEventListener('click', () => {
  const sql = $('sqlSchemaBox').textContent;
  navigator.clipboard.writeText(sql).then(() => {
    showToast('📋 SQL Schema copied to clipboard!');
  }).catch(() => {
    showToast('Could not copy automatically. Please select and copy the SQL box.', 'error');
  });
});

$('searchQuoteInput').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  const filtered = savedQuotesCache.filter(item =>
    (item.client_name && item.client_name.toLowerCase().includes(q)) ||
    (item.project_name && item.project_name.toLowerCase().includes(q)) ||
    (item.site_location && item.site_location.toLowerCase().includes(q)) ||
    (item.quote_date && item.quote_date.includes(q)) ||
    (item.quote_no && item.quote_no.toLowerCase().includes(q))
  );
  renderSavedQuotesList(filtered);
});

$('refreshCloudListBtn').addEventListener('click', fetchSavedQuotations);

// Initialize on page load
loadDraftState();
initSupabase();

if (!items.length) {
  addItem('Building construction & structural civil work', 1850);
  addItem('Fly ash brick masonry with cement mortar', 450);
  addItem('Internal & external wall plastering', 220);
  addItem('Bitumen road surfacing & laying', 380);
} else {
  renderItems();
  updatePreview();
}


