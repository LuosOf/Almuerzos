// app.js - Control de almuerzos con gestión de clientes
const STORAGE_KEY = 'almuerzos_v1';
const CLIENTS_STORAGE_KEY = 'clientes_v1';

// Clientes predefinidos
const DEFAULT_CLIENTS = [
  'Luis', 'Marcos', 'Gabriel', 'Carlos', 'Ruth', 'Darith',
  'Jorsy', 'Wilder', 'Mayra', 'Lio', 'Jose Peña'
];
;

class LunchApp {
  constructor() {
    this.meals = [];
    this.clients = [];
    this.cache();
    this.loadClients();
    this.bindClients();
    this.load();
    this.renderClientSelect();
    this.bind();
    this.render();
    // no PWA/installation prompt: keep app as web app with JSON/localStorage
  }

  cache() {
    this.form = document.getElementById('meal-form');
    this.selectClient = document.getElementById('select-client');
    this.btnAddClient = document.getElementById('btn-add-client');
    this.newClientName = document.getElementById('new-client-name');
    this.inputDate = document.getElementById('input-date');
    this.inputQty = document.getElementById('input-qty');
    this.inputNotes = document.getElementById('input-notes');
    this.btnAdd = document.getElementById('btn-add');
    this.mealsContainer = document.getElementById('meals-container');
    this.empty = document.getElementById('empty');
    this.search = document.getElementById('search');
    this.filterDate = document.getElementById('filter-date');
    this.btnReset = document.getElementById('btn-reset-filters');
    this.btnClear = document.getElementById('btn-clear');
    this.whatsappNumber = document.getElementById('whatsapp-number');
    this.btnWhatsApp = document.getElementById('btn-whatsapp');
    this.btnExportJson = document.getElementById('btn-export-json');
    this.btnImportJson = document.getElementById('btn-import-json');
    this.fileImport = document.getElementById('file-import');
  }

  loadClients() {
    try {
      const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
      let loaded = raw ? JSON.parse(raw) : DEFAULT_CLIENTS.slice();
      // normalize clients to objects { name, phone }
      this.clients = loaded.map(c => {
        if (!c) return null;
        if (typeof c === 'string') return { name: c, phone: '' };
        if (typeof c === 'object' && c.name) return { name: c.name, phone: c.phone || '' };
        return null;
      }).filter(Boolean);
      this.saveClients();
    } catch (err) {
      console.error('Error cargando clientes:', err);
      this.clients = DEFAULT_CLIENTS.map(n => ({ name: n, phone: '' }));
    }
  }

  saveClients() {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(this.clients));
  }

  renderClientSelect() {
    this.selectClient.innerHTML = '<option value="">-- Seleccionar cliente --</option>';
    for (const client of this.clients) {
      const opt = document.createElement('option');
      opt.value = client.name;
      opt.textContent = client.name;
      this.selectClient.appendChild(opt);
    }
  }

  bindClients() {
    this.btnAddClient.addEventListener('click', (e) => {
      e.preventDefault();
      const isVisible = this.newClientName.style.display !== 'none';
      if (isVisible) {
        this.addNewClient();
      } else {
        this.newClientName.style.display = 'inline-block';
        if (this.newClientPhone) this.newClientPhone.style.display = 'inline-block';
        this.newClientName.focus();
      }
    });

    this.newClientName.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addNewClient();
      }
    });
    if (this.newClientPhone) {
      this.newClientPhone.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addNewClient();
        }
      });
    }
  }

  addNewClient() {
    const name = (this.newClientName && this.newClientName.value.trim()) || '';
    const phone = (this.newClientPhone && this.newClientPhone.value.trim()) || '';
    if (!name) {
      showAlert('Cliente', 'Ingresa un nombre de cliente.', 'warning');
      return;
    }
    if (this.clients.some(c => c.name === name)) {
      showAlert('Cliente', 'Este cliente ya existe.', 'warning');
      if (this.newClientName) this.newClientName.value = '';
      if (this.newClientPhone) this.newClientPhone.value = '';
      return;
    }
    this.clients.push({ name, phone });
    this.clients.sort((a, b) => a.name.localeCompare(b.name));
    this.saveClients();
    this.renderClientSelect();
    this.selectClient.value = name;
    if (this.newClientName) this.newClientName.value = '';
    if (this.newClientPhone) this.newClientPhone.value = '';
    if (this.newClientName) this.newClientName.style.display = 'none';
    if (this.newClientPhone) this.newClientPhone.style.display = 'none';
  }

  bind(){
    this.form.addEventListener('submit', (e) => { e.preventDefault(); this.addOrUpdate(); });
    if (this.btnAdd) {
      this.btnAdd.addEventListener('click', (e) => { e.preventDefault(); this.addOrUpdate(); });
    }
    this.search.addEventListener('input', () => this.render());
    this.filterDate.addEventListener('change', () => this.render());
    this.btnReset.addEventListener('click', () => {
      this.search.value = '';
      this.filterDate.value = '';
      this.render();
    });
    this.btnClear.addEventListener('click', () => this.form.reset());
    this.btnWhatsApp.addEventListener('click', () => this.shareToWhatsApp());
    this.btnExportJson.addEventListener('click', () => this.exportJson());
    if (this.btnImportJson && this.fileImport) {
      this.btnImportJson.addEventListener('click', () => this.fileImport.click());
      this.fileImport.addEventListener('change', (e) => this.handleImportFile(e));
    }

    // when client selected, fill whatsappNumber if known
    this.selectClient.addEventListener('change', () => {
      const name = this.selectClient.value;
      const c = this.clients.find(x => x.name === name);
      if (c && c.phone) this.whatsappNumber.value = c.phone; 
    });
    // no install button handling (app stays as web app)
  }

  load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      this.meals = raw ? JSON.parse(raw) : [];
    }catch(err){ console.error('Error cargando datos:', err); this.meals = []; }
  }

  save(){
    // seguir guardando localmente como fallback/offline cache
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.meals));
  }

  // Inicia listener en tiempo real para la colección 'meals' en Firestore
  // (sin sincronización remota) la app usa localStorage

  addOrUpdate(){
    const clientName = this.selectClient.value.trim();
    const date = this.inputDate.value;
    const qty = parseInt(this.inputQty.value, 10);
    const notes = this.inputNotes.value.trim();

  if (!clientName) { showAlert('Formulario', 'Selecciona un cliente.', 'warning'); return; }
  if (!date) { showAlert('Formulario', 'La fecha es obligatoria.', 'warning'); return; }
  if (!qty || qty <= 0) { showAlert('Formulario', 'La cantidad debe ser al menos 1.', 'warning'); return; }

    const editingId = this.form.getAttribute('data-edit-id');
    if (editingId) {
      const idx = this.meals.findIndex(m => m.id === editingId);
      if (idx !== -1) {
        this.meals[idx].name = clientName;
        this.meals[idx].date = date;
        this.meals[idx].qty = qty;
        this.meals[idx].notes = notes;
        delete this.form.dataset.editId;
        this.save();
        this.form.reset();
        this.render();
        showToast('Registro actualizado', 'success');
        return;
      }
    }

    const item = {
      id: cryptoRandomId(),
      name: clientName,
      date,
      qty,
      notes,
      delivered: false,
      createdAt: new Date().toISOString()
    };
    this.meals.push(item);
    this.save();
    this.form.reset();
    this.render();
    showToast('Registro creado', 'success');
  }

  render(){
    const q = (this.search.value || '').toLowerCase();
    const fdate = this.filterDate.value;
    const list = this.meals
      .filter(m => {
        if (q && !m.name.toLowerCase().includes(q)) return false;
        if (fdate && m.date !== fdate) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    this.mealsContainer.innerHTML = '';
    if (list.length === 0) {
      this.empty.style.display = 'block';
      return;
    } else {
      this.empty.style.display = 'none';
    }

    for (const m of list) {
      const div = document.createElement('div');
      div.className = 'meal-item';
      
      const badgeClass = m.delivered ? 'badge-delivered' : 'badge-pending';
      const badgeText = m.delivered ? '✓ Entregado' : '⏳ Pendiente';
      // Íconos SVG para toggle (más consistentes que emojis en distintos sistemas)
      const deliveredIcon = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>`;
      const pendingIcon = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
        </svg>`;
      const toggleIcon = m.delivered ? deliveredIcon : pendingIcon;

      div.innerHTML = `
        <div class="meal-info">
          <div class="meal-name">${escapeHtml(m.name)}</div>
          <div class="meal-details">
            <div class="meal-detail-item">📅 ${formatDate(m.date)}</div>
            <div class="meal-detail-item">📦 ${m.qty} pcs</div>
            <div class="meal-detail-item"><span class="badge ${badgeClass}">${badgeText}</span></div>
            ${m.notes ? `<div class="meal-detail-item">📝 ${escapeHtml(m.notes)}</div>` : ''}
          </div>
        </div>
        <div class="meal-actions">
          <button type="button" data-action="toggle" data-id="${m.id}" title="${m.delivered ? 'Marcar como no entregado' : 'Marcar como entregado'}">${toggleIcon}</button>
          <button type="button" data-action="edit" data-id="${m.id}" title="Editar">✏️</button>
          <button type="button" data-action="delete" data-id="${m.id}" title="Eliminar">🗑️</button>
        </div>
      `;

      this.mealsContainer.appendChild(div);
    }

    // Delegación de eventos
    this.mealsContainer.querySelectorAll('button').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'toggle') this.toggleDelivered(id);
        if (action === 'edit') this.fillFormForEdit(id);
        if (action === 'delete') this.deleteItem(id);
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
    this.selectClient.value = it.name;
    this.inputDate.value = it.date;
    this.inputQty.value = it.qty;
    this.inputNotes.value = it.notes || '';
    this.form.dataset.editId = it.id;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  deleteItem(id){
    // Usar SweetAlert2 para confirmación
    if (window.Swal) {
      Swal.fire({
        title: 'Eliminar registro',
        text: '¿Eliminar este registro? Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) {
          this.meals = this.meals.filter(m => m.id !== id);
          this.save();
          this.render();
          showToast('Registro eliminado', 'success');
        }
      });
    } else {
      if(!confirm('¿Eliminar este registro?')) return;
      this.meals = this.meals.filter(m => m.id !== id);
      this.save();
      this.render();
    }
  }

  shareToWhatsApp(){
    const q = (this.search.value || '').toLowerCase();
    const fdate = this.filterDate.value;
    const list = this.meals
      .filter(m => {
        if (q && !m.name.toLowerCase().includes(q)) return false;
        if (fdate && m.date !== fdate) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    if (list.length === 0) {
      showAlert('Compartir', 'No hay registros para compartir.', 'info');
      return;
    }

    // Mensaje simplificado y amigable para clientes
    // Ejemplo por línea: "Luis — 10 nov — 2"
    const lines = ['Pedidos de almuerzo:'];
    for (const m of list) {
      const note = m.notes ? ` — ${m.notes}` : '';
      lines.push(`${m.name} — ${formatShortDate(m.date)} — ${m.qty}${note}`);
    }
    lines.push('');
    lines.push(`Total pedidos: ${list.length}`);
    const text = lines.join('\n');

    const number = (this.whatsappNumber && this.whatsappNumber.value.trim()) || '';
    let url;
    if (number) {
      const clean = number.replace(/[^0-9]/g, '');
      url = `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(text)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }

    window.open(url, '_blank');
  }

  // Import JSON file handler
  handleImportFile(e){
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try{
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error('JSON debe ser un arreglo de registros');
        // confirm replace
        if (window.Swal) {
          Swal.fire({
            title: 'Importar JSON',
            text: '¿Deseas reemplazar los registros actuales con los del archivo importado?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Reemplazar',
            cancelButtonText: 'Cancelar'
          }).then(res => {
            if (res.isConfirmed) {
              this.meals = data;
              this.save();
              this.render();
              showToast('Importación completada', 'success');
            }
          });
        } else {
          if (confirm('Reemplazar registros actuales con los del archivo importado?')){
            this.meals = data;
            this.save();
            this.render();
            showToast('Importación completada', 'success');
          }
        }
      }catch(err){
        console.error('Error importando JSON:', err);
        showAlert('Importar', 'Archivo JSON inválido. Asegúrate de que contiene un arreglo de registros.', 'error');
      } finally {
        // reset file input
        try{ this.fileImport.value = ''; } catch(e){}
      }
    };
    reader.readAsText(file);
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
    return dt.toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }catch(e){ return d; }
}

function formatShortDate(d){
  if(!d) return '';
  try{
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }catch(e){ return d; }
}

function escapeHtml(s){
  if(!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

// SweetAlert helpers
function showToast(message, icon='success'){
  try{
    if (window.Swal) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: icon,
        title: message,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      return;
    }
  }catch(e){}
  // fallback
  try{ alert(message); }catch(e){}
}

function showAlert(title, text, icon='warning'){
  try{
    if (window.Swal) {
      Swal.fire({ title: title, text: text, icon: icon });
      return;
    }
  }catch(e){}
  try{ alert(text); }catch(e){}
}


// Inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', ()=> new LunchApp());
