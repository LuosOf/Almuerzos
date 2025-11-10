// app.js - Lógica de la SPA de control de almuerzos
const STORAGE_KEY = 'almuerzos_v1';

class LunchApp{
  constructor(){
    this.meals = [];
    this.cache();
    this.bind();
    this.load();
    this.render();
  }

  cache(){
    this.form = document.getElementById('meal-form');
    this.inputName = document.getElementById('input-name');
    this.inputDate = document.getElementById('input-date');
    this.inputQty = document.getElementById('input-qty');
    this.inputNotes = document.getElementById('input-notes');
    this.tableBody = document.querySelector('#meals-table tbody');
    this.empty = document.getElementById('empty');
    this.search = document.getElementById('search');
    this.filterDate = document.getElementById('filter-date');
    this.btnReset = document.getElementById('btn-reset-filters');
    this.btnClear = document.getElementById('btn-clear');
    this.whatsappNumber = document.getElementById('whatsapp-number');
    this.btnWhatsApp = document.getElementById('btn-whatsapp');
    this.btnExportJson = document.getElementById('btn-export-json');
  }

  bind(){
    this.form.addEventListener('submit', e => { e.preventDefault(); this.addOrUpdate(); });
    this.search.addEventListener('input', () => this.render());
    this.filterDate.addEventListener('change', () => this.render());
    this.btnReset.addEventListener('click', ()=>{ this.search.value=''; this.filterDate.value=''; this.render(); });
    this.btnClear.addEventListener('click', ()=> this.form.reset());
    if(this.btnWhatsApp) this.btnWhatsApp.addEventListener('click', ()=> this.shareToWhatsApp());
    if(this.btnExportJson) this.btnExportJson.addEventListener('click', ()=> this.exportJson());
  }

  load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      this.meals = raw ? JSON.parse(raw) : [];
    }catch(err){ console.error('Error cargando datos:', err); this.meals = []; }
  }

  save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.meals));
  }

  addOrUpdate(){
    const name = this.inputName.value.trim();
    const date = this.inputDate.value;
    const qty = parseInt(this.inputQty.value, 10);
    const notes = this.inputNotes.value.trim();

    if(!name){ alert('El nombre es obligatorio.'); return; }
    if(!date){ alert('La fecha es obligatoria.'); return; }
    if(!qty || qty <= 0){ alert('La cantidad debe ser al menos 1.'); return; }

    // Si existe input hidden para editar, usa data-id
    const editingId = this.form.getAttribute('data-edit-id');
    if(editingId){
      const idx = this.meals.findIndex(m => m.id === editingId);
      if(idx !== -1){
        this.meals[idx].name = name;
        this.meals[idx].date = date;
        this.meals[idx].qty = qty;
        this.meals[idx].notes = notes;
        delete this.form.dataset.editId;
        this.save();
        this.form.reset();
        this.render();
        return;
      }
    }

    const item = { id: cryptoRandomId(), name, date, qty, notes, delivered:false, createdAt: new Date().toISOString() };
    this.meals.push(item);
    this.save();
    this.form.reset();
    this.render();
  }

  render(){
    const q = (this.search.value||'').toLowerCase();
    const fdate = this.filterDate.value;
    const list = this.meals.filter(m => {
      if(q && !m.name.toLowerCase().includes(q)) return false;
      if(fdate && m.date !== fdate) return false;
      return true;
    }).sort((a,b)=> a.date.localeCompare(b.date));

    this.tableBody.innerHTML = '';
    if(list.length === 0){ this.empty.style.display = 'block'; return; } else { this.empty.style.display = 'none'; }

    for(const m of list){
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${escapeHtml(m.name)}</td>
        <td>${formatDate(m.date)}</td>
        <td>${m.qty}</td>
        <td>${escapeHtml(m.notes||'')}</td>
        <td><span class="badge ${m.delivered ? 'delivered' : 'not-delivered'}">${m.delivered ? 'Sí' : 'No'}</span></td>
        <td>
          <button class="btn-icon" data-action="toggle" data-id="${m.id}" title="Marcar entregado/no">🔁</button>
          <button class="btn-icon" data-action="edit" data-id="${m.id}" title="Editar">✏️</button>
          <button class="btn-icon btn-delete" data-action="delete" data-id="${m.id}" title="Eliminar">🗑️</button>
        </td>
      `;

      this.tableBody.appendChild(tr);
    }

    // Delegación de eventos en tabla
    this.tableBody.querySelectorAll('button').forEach(btn => {
      btn.onclick = (e) => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if(action === 'toggle') this.toggleDelivered(id);
        if(action === 'edit') this.fillFormForEdit(id);
        if(action === 'delete') this.deleteItem(id);
      };
    });
  }

  toggleDelivered(id){
    const it = this.meals.find(m => m.id === id);
    if(!it) return;
    it.delivered = !it.delivered;
    this.save();
    this.render();
  }

  fillFormForEdit(id){
    const it = this.meals.find(m => m.id === id);
    if(!it) return;
    this.inputName.value = it.name;
    this.inputDate.value = it.date;
    this.inputQty.value = it.qty;
    this.inputNotes.value = it.notes || '';
    this.form.dataset.editId = it.id;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  deleteItem(id){
    if(!confirm('¿Eliminar este registro?')) return;
    this.meals = this.meals.filter(m => m.id !== id);
    this.save();
    this.render();
  }

  shareToWhatsApp(){
    const q = (this.search.value||'').toLowerCase();
    const fdate = this.filterDate.value;
    const list = this.meals.filter(m => {
      if(q && !m.name.toLowerCase().includes(q)) return false;
      if(fdate && m.date !== fdate) return false;
      return true;
    }).sort((a,b)=> a.date.localeCompare(b.date));

    if(list.length === 0){ alert('No hay registros para compartir.'); return; }

    const lines = ['Relación de almuerzos registrados:'];
    for(const m of list){
      lines.push(`- ${m.name} | ${formatDate(m.date)} | Cant: ${m.qty} | Entregado: ${m.delivered ? 'Sí' : 'No'}${m.notes ? ' | Obs: '+m.notes : ''}`);
    }
    const text = lines.join('\n');

    const number = (this.whatsappNumber && this.whatsappNumber.value.trim()) || '';
    let url;
    if(number){
      // api.whatsapp.com/send expects phone with country code, no + or 00
      const clean = number.replace(/[^0-9]/g,'');
      url = `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(text)}`;
    }else{
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }

    // Abrir en nueva pestaña; en móvil abrirá la app o web
    window.open(url, '_blank');
  }

  exportJson(){
    const data = JSON.stringify(this.meals, null, 2);
    const a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(data);
    a.download = 'almuerzos.json';
    a.click();
  }
}

/* helpers */
function cryptoRandomId(){
  // simple unique id
  return 'id-' + Math.random().toString(36).slice(2,9) + Date.now().toString(36).slice(-4);
}

function formatDate(d){
  if(!d) return '';
  try{
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString();
  }catch(e){ return d; }
}

function escapeHtml(s){
  if(!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

// Inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', ()=> new LunchApp());
