const $=id=>document.getElementById(id);
const fields=['companyName','companyPhone','companyEmail','companyGst','companyAddress','clientName','clientContact','clientPhone','quoteDate','projectName','siteLocation','gstRate','discount','validity','paymentTerms','notes'];
const stateKey='roadworkQuotationState';
let items=[];

function today(){const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function money(n){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:2}).format(Number(n)||0)}
function esc(s){return String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\\':'&#92;'}[m]))}
function quoteNumber(){let n=Number(localStorage.getItem('rwQuoteSeq')||0)+1;localStorage.setItem('rwQuoteSeq',n);return `RW-${new Date().getFullYear()}-${String(n).padStart(3,'0')}`}
let currentQuote=localStorage.getItem('rwQuoteNumber')||quoteNumber();localStorage.setItem('rwQuoteNumber',currentQuote);
$('quoteNoBadge').textContent=currentQuote;$('pQuoteNo').textContent=currentQuote;
$('quoteDate').value=today();

function addItem(desc='',unit='m³',qty=1,rate=0){items.push({id:crypto.randomUUID(),desc,unit,qty,rate});renderItems();updatePreview()}
function renderItems(){
  $('itemsBody').innerHTML=items.length?items.map((x,i)=>`<tr><td><input class="item-desc" data-id="${x.id}" data-k="desc" value="${esc(x.desc)}" placeholder="Work / material description"></td><td><input class="num" data-id="${x.id}" data-k="unit" value="${esc(x.unit)}"></td><td><input class="num" type="number" min="0" step="0.001" data-id="${x.id}" data-k="qty" value="${x.qty}"></td><td><input class="num" type="number" min="0" step="0.01" data-id="${x.id}" data-k="rate" value="${x.rate}"></td><td class="amount-cell">${money(x.qty*x.rate)}</td><td><button class="remove" data-remove="${x.id}" aria-label="Remove item">×</button></td></tr>`).join(''):`<tr><td colspan="6" style="padding:28px;text-align:center;color:#98a2b3;font-size:12px">No items yet. Add your first roadwork activity or material.</td></tr>`;
  document.querySelectorAll('[data-id][data-k]').forEach(el=>el.addEventListener('input',e=>{const x=items.find(a=>a.id===e.target.dataset.id);if(!x)return;x[e.target.dataset.k]=e.target.type==='number'?Number(e.target.value):e.target.value;const row=e.target.closest('tr');row.querySelector('.amount-cell').textContent=money(x.qty*x.rate);updatePreview()}));
  document.querySelectorAll('[data-remove]').forEach(el=>el.addEventListener('click',()=>{items=items.filter(x=>x.id!==el.dataset.remove);renderItems();updatePreview()}));
}
function val(id){return $(id).value}
function updatePreview(){
  $('pCompanyName').textContent=val('companyName')||'Your Roadwork Company';$('pCompanyName2').textContent=val('companyName')||'Your Roadwork Company';
  $('pCompanyAddress').textContent=val('companyAddress');$('pCompanyPhone').textContent=val('companyPhone');$('pCompanyEmail').textContent=val('companyEmail');$('pCompanyGst').textContent=val('companyGst')?`GSTIN: ${val('companyGst')}`:'';
  $('pClientName').textContent=val('clientName')||'Client name';$('pClientContact').textContent=val('clientContact')||'Contact person';$('pClientPhone').textContent=val('clientPhone')||'Client phone';
  $('pProjectName').textContent=val('projectName')||'Roadwork project';$('pSiteLocation').textContent=val('siteLocation')||'Site location';
  const date=val('quoteDate');$('pQuoteDate').textContent=date?new Date(date+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'';
  $('pValidity').textContent=`${val('validity')||15} days`;$('pValidity2').textContent=`${val('validity')||15} days`;$('pPaymentTerms').textContent=val('paymentTerms');$('pNotes').textContent=val('notes');
  const subtotal=items.reduce((s,x)=>s+(Number(x.qty)||0)*(Number(x.rate)||0),0);const discount=Math.min(Math.max(Number(val('discount'))||0,0),subtotal);const taxable=subtotal-discount;const gst=taxable*(Math.max(Number(val('gstRate'))||0,0)/100);const total=taxable+gst;
  $('pSubtotal').textContent=money(subtotal);$('pDiscount').textContent=money(discount);$('pGst').textContent=money(gst);$('pTotal').textContent=money(total);
  $('previewItems').innerHTML=items.length?items.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.desc||'Roadwork / material')}</td><td>${esc(x.unit)}</td><td>${Number(x.qty||0).toLocaleString('en-IN')}</td><td>${money(x.rate)}</td><td class="right">${money((Number(x.qty)||0)*(Number(x.rate)||0))}</td></tr>`).join(''):`<tr><td colspan="6" style="text-align:center;color:#98a2b3;padding:25px">Add work items to build the quotation.</td></tr>`;
  saveState();
}
function saveState(){const data={fields:Object.fromEntries(fields.map(id=>[id,val(id)])),items};localStorage.setItem(stateKey,JSON.stringify(data))}
function loadState(){try{const data=JSON.parse(localStorage.getItem(stateKey)||'null');if(!data)return;fields.forEach(id=>{if(data.fields?.[id]!=null)$(id).value=data.fields[id]});if(Array.isArray(data.items))items=data.items}catch{}}
fields.forEach(id=>$(id).addEventListener('input',updatePreview));
$('addItemBtn').addEventListener('click',()=>addItem());
document.querySelectorAll('[data-preset]').forEach(btn=>btn.addEventListener('click',()=>{const [desc,unit]=btn.dataset.preset.split('|');addItem(desc,unit,1,0)}));
$('printBtn').addEventListener('click',()=>window.print());
$('resetBtn').addEventListener('click',()=>{if(!confirm('Start a new quotation? Current saved draft will be replaced.'))return;localStorage.removeItem(stateKey);currentQuote=quoteNumber();localStorage.setItem('rwQuoteNumber',currentQuote);$('quoteNoBadge').textContent=currentQuote;$('pQuoteNo').textContent=currentQuote;fields.forEach(id=>{if(id==='quoteDate')$(id).value=today();else if(id==='gstRate')$(id).value=18;else if(id==='discount')$(id).value=0;else if(id==='validity')$(id).value=15;else $(id).value=''});$('companyName').value='Your Roadwork Company';$('companyPhone').value='+91 00000 00000';$('companyEmail').value='office@example.com';$('companyAddress').value='Tamil Nadu, India';$('paymentTerms').value='30% advance. Balance as per measured work / agreed stage payment.';$('notes').value='Rates are based on the quantities and site conditions stated above. Final billing will be based on actual measured quantities.';items=[];addItem('Earthwork / excavation','m³',1,0)});
loadState();if(!items.length)addItem('Earthwork / excavation','m³',1,0);else{renderItems();updatePreview()}
