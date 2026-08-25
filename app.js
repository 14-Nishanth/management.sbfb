const $ = id => document.getElementById(id);
const fields = ['quoteNo', 'companyName', 'companyPhone', 'companyEmail', 'companyGst', 'companyAddress', 'clientName', 'clientContact', 'clientPhone', 'quoteDate', 'projectName', 'siteLocation', 'gstRate', 'discount', 'validity', 'paymentTerms', 'notes'];
const stateKey = 'roadworkQuotationState';
let items = [];

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

function quoteNumber() {
  let n = Number(localStorage.getItem('rwQuoteSeq') || 0) + 1;
  localStorage.setItem('rwQuoteSeq', n);
  const code = `RW-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`;
  localStorage.setItem('rwQuoteNumber', code);
  return code;
}

function addItem(desc = '', unit = 'm³', qty = 1, rate = 0) {
  items.push({ id: crypto.randomUUID(), desc, unit, qty, rate });
  renderItems();
  updatePreview();
}

function renderItems() {
  $('itemsBody').innerHTML = items.length
    ? items.map(x => `<tr><td><input class="item-desc" data-id="${x.id}" data-k="desc" value="${esc(x.desc)}" placeholder="Work / material description"></td><td><input class="num" data-id="${x.id}" data-k="unit" value="${esc(x.unit)}"></td><td><input class="num" type="number" min="0" step="0.001" data-id="${x.id}" data-k="qty" value="${x.qty}"></td><td><input class="num" type="number" min="0" step="0.01" data-id="${x.id}" data-k="rate" value="${x.rate}"></td><td class="amount-cell">${money(x.qty * x.rate)}</td><td><button class="remove" data-remove="${x.id}" aria-label="Remove item">×</button></td></tr>`).join('')
    : `<tr><td colspan="6" style="padding:28px;text-align:center;color:#98a2b3;font-size:12px">No items yet. Add your first roadwork activity or material.</td></tr>`;

  document.querySelectorAll('[data-id][data-k]').forEach(el => el.addEventListener('input', e => {
    const x = items.find(a => a.id === e.target.dataset.id);
    if (!x) return;
    x[e.target.dataset.k] = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    const row = e.target.closest('tr');
    row.querySelector('.amount-cell').textContent = money(x.qty * x.rate);
    updatePreview();
  }));

  document.querySelectorAll('[data-remove]').forEach(el => el.addEventListener('click', () => {
    items = items.filter(x => x.id !== el.dataset.remove);
    renderItems();
    updatePreview();
  }));
}

function val(id) {
  return $(id) ? $(id).value : '';
}

function updatePreview() {
  const currentQuote = val('quoteNo').trim() || localStorage.getItem('rwQuoteNumber') || 'RW-2026-001';
  $('quoteNoBadge').textContent = currentQuote;
  $('pQuoteNo').textContent = currentQuote;

  $('pCompanyName').textContent = val('companyName') || 'Your Roadwork Company';
  $('pCompanyName2').textContent = val('companyName') || 'Your Roadwork Company';
  $('pCompanyAddress').textContent = val('companyAddress');
  $('pCompanyPhone').textContent = val('companyPhone');
  $('pCompanyEmail').textContent = val('companyEmail');
  $('pCompanyGst').textContent = val('companyGst') ? `GSTIN: ${val('companyGst')}` : '';

  $('pClientName').textContent = val('clientName') || 'Client name';
  $('pClientContact').textContent = val('clientContact') || 'Contact person';
  $('pClientPhone').textContent = val('clientPhone') || 'Client phone';
  $('pProjectName').textContent = val('projectName') || 'Roadwork project';
  $('pSiteLocation').textContent = val('siteLocation') || 'Site location';

  const date = val('quoteDate');
  $('pQuoteDate').textContent = formatDate(date);

  $('pValidity').textContent = `${val('validity') || 15} days`;
  $('pValidity2').textContent = `${val('validity') || 15} days`;
  $('pPaymentTerms').textContent = val('paymentTerms');
  $('pNotes').textContent = val('notes');

  const subtotal = items.reduce((s, x) => s + (Number(x.qty) || 0) * (Number(x.rate) || 0), 0);
  const discount = Math.min(Math.max(Number(val('discount')) || 0, 0), subtotal);
  const taxable = subtotal - discount;
  const gst = taxable * (Math.max(Number(val('gstRate')) || 0, 0) / 100);
  const total = taxable + gst;

  $('pSubtotal').textContent = money(subtotal);
  $('pDiscount').textContent = money(discount);
  $('pGst').textContent = money(gst);
  $('pTotal').textContent = money(total);

  $('previewItems').innerHTML = items.length
    ? items.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x.desc || 'Roadwork / material')}</td><td>${esc(x.unit)}</td><td>${Number(x.qty || 0).toLocaleString('en-IN')}</td><td>${money(x.rate)}</td><td class="right">${money((Number(x.qty) || 0) * (Number(x.rate) || 0))}</td></tr>`).join('')
    : `<tr><td colspan="6" style="text-align:center;color:#98a2b3;padding:25px">Add work items to build the quotation.</td></tr>`;

  saveState();
}

function saveState() {
  const data = {
    fields: Object.fromEntries(fields.map(id => [id, val(id)])),
    items
  };
  localStorage.setItem(stateKey, JSON.stringify(data));
}

function loadState() {
  try {
    const data = JSON.parse(localStorage.getItem(stateKey) || 'null');
    if (data && data.fields) {
      fields.forEach(id => {
        if ($(id) && data.fields[id] != null) {
          $(id).value = data.fields[id];
        }
      });
    }
    if (data && Array.isArray(data.items)) {
      items = data.items;
    }
  } catch {}

  if (!$('quoteNo').value) {
    $('quoteNo').value = localStorage.getItem('rwQuoteNumber') || quoteNumber();
  }
  if (!$('quoteDate').value) {
    $('quoteDate').value = today();
  }
}

fields.forEach(id => {
  const el = $(id);
  if (el) el.addEventListener('input', updatePreview);
});

$('addItemBtn').addEventListener('click', () => addItem());

if ($('autoQuoteBtn')) {
  $('autoQuoteBtn').addEventListener('click', () => {
    const newQuoteNo = quoteNumber();
    $('quoteNo').value = newQuoteNo;
    updatePreview();
  });
}

document.querySelectorAll('[data-preset]').forEach(btn => btn.addEventListener('click', () => {
  const [desc, unit] = btn.dataset.preset.split('|');
  addItem(desc, unit, 1, 0);
}));

$('printBtn').addEventListener('click', () => window.print());

$('resetBtn').addEventListener('click', () => {
  if (!confirm('Start a new quotation? Current saved draft will be replaced.')) return;
  localStorage.removeItem(stateKey);
  const newQuote = quoteNumber();
  fields.forEach(id => {
    const el = $(id);
    if (!el) return;
    if (id === 'quoteNo') el.value = newQuote;
    else if (id === 'quoteDate') el.value = today();
    else if (id === 'gstRate') el.value = 18;
    else if (id === 'discount') el.value = 0;
    else if (id === 'validity') el.value = 15;
    else el.value = '';
  });
  $('companyName').value = 'Your Roadwork Company';
  $('companyPhone').value = '+91 00000 00000';
  $('companyEmail').value = 'office@example.com';
  $('companyAddress').value = 'Tamil Nadu, India';
  $('paymentTerms').value = '30% advance. Balance as per measured work / agreed stage payment.';
  $('notes').value = 'Rates are based on the quantities and site conditions stated above. Final billing will be based on actual measured quantities.';
  items = [];
  addItem('Earthwork / excavation', 'm³', 1, 0);
});

loadState();
if (!items.length) {
  addItem('Earthwork / excavation', 'm³', 1, 0);
} else {
  renderItems();
  updatePreview();
}
