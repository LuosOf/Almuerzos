// app.js - Control de almuerzos con gestión de clientes
const STORAGE_KEY = 'almuerzos_v1';
const CLIENTS_STORAGE_KEY = 'clientes_v1';

// Clientes predefinidos (incluye contactos específicos solicitados)
const DEFAULT_CLIENTS = [
  { name: 'Mama', phone: '966511343' },
  { name: 'Privado', phone: '901285240' },
  'Luis', 'Marcos', 'Gabriel', 'Carlos', 'Ruth', 'Darith',
  'Jorsy', 'Wilder', 'Mayra', 'Lio', 'Jose Peña'
];
// Boletas storage key
const BOLETAS_KEY = 'boletas_v1';
;

class LunchApp {
  constructor() {
    this.meals = [];
    this.clients = [];
    this.boletas = [];
    this.cache();
    this.loadClients();
    this.bindClients();
    this.load();
    this.loadBoletas();
    this.initRouter();
    this.checkAutoGenerateBoletas();
    this.renderClientSelect();
    this.bind();
  this.renderBoletas();
    this.render();
    // no PWA/installation prompt: keep app as web app with JSON/localStorage
  }

  cache() {
    this.form = document.getElementById('meal-form');
    this.selectClient = document.getElementById('select-client');
    this.btnAddClient = document.getElementById('btn-add-client');
    this.newClientName = document.getElementById('new-client-name');
  this.newClientPhone = document.getElementById('new-client-phone');
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
  // menu toggles
  this.btnMenu = document.getElementById('btn-menu');
  this.sideNav = document.getElementById('side-nav');
    this.btnGenerateBoleta = document.getElementById('btn-generate-boleta');
    this.boletasContainer = document.getElementById('boletas-container');
    this.drawerOverlay = document.getElementById('drawer-overlay');
  }

  /* Router for SPA-style navigation using hash routes */
  initRouter(){
    // show correct section based on location.hash
    const show = () => this.showRoute(location.hash || '#new');
    window.addEventListener('hashchange', show);
    // initial
    show();
    // close drawer when clicking overlay
    if (this.drawerOverlay) this.drawerOverlay.addEventListener('click', ()=>{ document.body.classList.remove('nav-open'); this.sideNav && this.sideNav.setAttribute('aria-hidden','true'); });
  }

  showRoute(hash){
    const map = {
      '#new': 'section-new',
      '#filters': 'section-filters',
      '#share': 'section-share',
      '#boletas': 'section-boletas',
      '#list': 'section-list'
    };
    const id = map[hash] || 'section-new';
    // hide all sections
    document.querySelectorAll('main .card').forEach(s=> s.style.display = 'none');
    const el = document.getElementById(id);
    if (el) el.style.display = '';
    // close drawer
    document.body.classList.remove('nav-open');
    if (this.sideNav) this.sideNav.setAttribute('aria-hidden','true');
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
    if (this.search) this.search.addEventListener('input', () => this.render());
    if (this.filterDate) this.filterDate.addEventListener('change', () => this.render());
    if (this.btnReset) this.btnReset.addEventListener('click', () => {
      if (this.search) this.search.value = '';
      if (this.filterDate) this.filterDate.value = '';
      this.render();
    });
    if (this.btnClear && this.form) this.btnClear.addEventListener('click', () => this.form.reset());
    if (this.btnWhatsApp) this.btnWhatsApp.addEventListener('click', () => this.shareToWhatsApp());
    if (this.btnExportJson) this.btnExportJson.addEventListener('click', () => this.exportJson());
      // menu toggle
      if (this.btnMenu && this.sideNav) {
        this.btnMenu.addEventListener('click', () => {
          document.body.classList.toggle('nav-open');
          const open = document.body.classList.contains('nav-open');
          this.sideNav.setAttribute('aria-hidden', !open);
          if (this.drawerOverlay) this.drawerOverlay.style.display = open ? '' : 'none';
        });
        // close nav on link click
        this.sideNav.querySelectorAll('a').forEach(a => a.addEventListener('click', ()=>{
          document.body.classList.remove('nav-open');
          this.sideNav.setAttribute('aria-hidden','true');
          if (this.drawerOverlay) this.drawerOverlay.style.display = 'none';
        }));
      }
      // close drawer on overlay click
      if (this.drawerOverlay) {
        this.drawerOverlay.addEventListener('click', ()=>{
          document.body.classList.remove('nav-open');
          if (this.sideNav) this.sideNav.setAttribute('aria-hidden','true');
          this.drawerOverlay.style.display = 'none';
        });
      }
    if (this.btnGenerateBoleta) {
      this.btnGenerateBoleta.addEventListener('click', () => this.generateBoletaForLastPeriod());
    }

    // when client selected, fill whatsappNumber if known
    if (this.selectClient) this.selectClient.addEventListener('change', () => {
      const name = this.selectClient.value;
      const c = this.clients.find(x => x.name === name);
      if (c && c.phone && this.whatsappNumber) this.whatsappNumber.value = c.phone; 
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
    // sync boletas summaries with current meals
    try{ this.syncBoletasWithMeals(); this.saveBoletas(); this.updateMenuVisibility(); }catch(e){}
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
    // if item locked (confirmed delivered) do not allow changes
    if (it.locked) { showAlert('Entrega', 'Esta entrega ya fue confirmada y no puede modificarse.', 'info'); return; }
    // if currently not delivered, ask confirm
    if (!it.delivered) {
      if (window.Swal) {
        Swal.fire({
          title: 'Confirmar entrega',
          text: `¿Confirmas que ${it.name} recibió el almuerzo del ${it.date}?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, confirmar',
          cancelButtonText: 'Cancelar'
        }).then(res => {
          if (res.isConfirmed) {
            it.delivered = true;
            it.locked = true;
            this.save();
            this.render();
            showToast('Entrega confirmada', 'success');
          }
        });
      } else {
        if (confirm(`¿Confirmas que ${it.name} recibió el almuerzo del ${it.date}?`)) {
          it.delivered = true;
          it.locked = true;
          this.save();
          this.render();
          showToast('Entrega confirmada', 'success');
        }
      }
      return;
    }
    // if it's delivered but not locked, allow toggling back to pending
    it.delivered = false;
    this.save();
    this.render();
  }

  fillFormForEdit(id){
    const it = this.meals.find(m => m.id === id);
    if(!it) return;
    if (it.locked) { showAlert('Editar', 'Este registro fue confirmado como entregado y no puede editarse.', 'info'); return; }
    this.selectClient.value = it.name;
    this.inputDate.value = it.date;
    this.inputQty.value = it.qty;
    this.inputNotes.value = it.notes || '';
    this.form.dataset.editId = it.id;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  deleteItem(id){
    // Usar SweetAlert2 para confirmación
    const it = this.meals.find(m => m.id === id);
    if (!it) return;
    if (it.locked) { showAlert('Eliminar', 'Este registro fue confirmado como entregado y no puede eliminarse.', 'info'); return; }
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

  // Recalcula las boletas existentes para reflejar los registros actuales
  syncBoletasWithMeals(){
    try{
      if (!this.boletas || this.boletas.length === 0) return;
      for (const b of this.boletas) {
        const start = new Date(b.periodStart + 'T00:00:00');
        const end = new Date(b.periodEnd + 'T00:00:00');
        const items = this.meals.filter(m => {
          const md = new Date(m.date + 'T00:00:00');
          return md >= start && md <= end;
        });
        const summaryByClient = {};
        items.forEach(m => {
          if (!summaryByClient[m.name]) summaryByClient[m.name] = { name: m.name, qty: 0, items: [] };
          summaryByClient[m.name].qty += (m.qty || 0);
          summaryByClient[m.name].items.push({ date: m.date, qty: m.qty, notes: m.notes });
        });
        b.summary = Object.values(summaryByClient);
        b.totalOrders = items.length;
        b.totalQty = items.reduce((s,it)=>s+(it.qty||0),0);
      }
      this.renderBoletas();
    }catch(err){ console.error('Error sincronizando boletas:', err); }
  }

  // Ocultar/mostrar enlace de boletas en el menú según existencia de boletas
  updateMenuVisibility(){
    try{
      const hasBoletas = (this.boletas && this.boletas.length > 0);
      const nav = document.getElementById('side-nav');
      if (!nav) return;
      const link = nav.querySelector('a[href="#boletas"]');
      if (!link) return;
      link.style.display = hasBoletas ? '' : 'none';
    }catch(e){}
  }

  /* Boletas: carga/guardado, generación automática (cada 15 días) y UI */
  loadBoletas(){
    try{
      const raw = localStorage.getItem(BOLETAS_KEY);
      this.boletas = raw ? JSON.parse(raw) : [];
    }catch(err){ console.error('Error cargando boletas:', err); this.boletas = []; }
  }

  saveBoletas(){
    localStorage.setItem(BOLETAS_KEY, JSON.stringify(this.boletas));
  }

  // Comprueba si han pasado 15 días desde la última boleta; si es así, genera nuevas boletas
  checkAutoGenerateBoletas(){
    try{
      const today = new Date();
      const day = today.getDate();
      // If no boletas exist, do nothing by default (user asked not to show empty). We'll generate only on scheduled days.
      // Scheduled generation on day 1 and 15: create boleta for [today-14 .. today]
      if (day === 1 || day === 15) {
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const start = new Date(end);
        start.setDate(end.getDate() - 14);
        // check if a boleta for the same period already exists
        const periodStart = start.toISOString().slice(0,10);
        const periodEnd = end.toISOString().slice(0,10);
        const exists = (this.boletas || []).some(b => b.periodStart === periodStart && b.periodEnd === periodEnd);
        if (!exists) {
          // show preview and generate after confirmation
          this.showBoletaPreviewAndMaybeGenerate(start, end);
        }
      }
    }catch(err){ console.error('Error en checkAutoGenerateBoletas:', err); }
  }

  // Generar una boleta para un periodo dado (Date objects)
  generateBoleta(startDate, endDate){
    try{
      // normalizar fechas a yyyy-mm-dd
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      const items = this.meals.filter(m => {
        const md = new Date(m.date + 'T00:00:00');
        return md >= start && md <= end;
      });

      const summaryByClient = {};
      items.forEach(m => {
        if (!summaryByClient[m.name]) summaryByClient[m.name] = { name: m.name, qty: 0, items: [] };
        summaryByClient[m.name].qty += (m.qty || 0);
        summaryByClient[m.name].items.push({ date: m.date, qty: m.qty, notes: m.notes });
      });

      const summary = Object.values(summaryByClient);
      const boleta = {
        id: cryptoRandomId(),
        createdAt: new Date().toISOString(),
        periodStart: start.toISOString().slice(0,10),
        periodEnd: end.toISOString().slice(0,10),
        totalOrders: items.length,
        totalQty: items.reduce((s,it)=>s+(it.qty||0),0),
        summary
      };

      this.boletas.push(boleta);
      this.saveBoletas();
      this.renderBoletas();
      showToast('Boleta generada', 'success');
    }catch(err){ console.error('Error generando boleta:', err); showAlert('Boletas','Error al generar boleta','error'); }
  }

  // Botón: generar boleta para los últimos 15 días (manual)
  generateBoletaForLastPeriod(){
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const start = new Date(end);
    start.setDate(end.getDate() - 14);
    // show preview and then generate on confirmation
    this.showBoletaPreviewAndMaybeGenerate(start, end);
  }

  // Show preview of boleta summary and generate after user confirms
  showBoletaPreviewAndMaybeGenerate(start, end){
    try{
      const items = this.meals.filter(m => {
        const md = new Date(m.date + 'T00:00:00');
        return md >= start && md <= end;
      });
      if (!items || items.length === 0) {
        showAlert('Boletas','No hay registros en el periodo seleccionado. No se generará boleta.','info');
        return;
      }
      const summaryByClient = {};
      items.forEach(m => {
        if (!summaryByClient[m.name]) summaryByClient[m.name] = { name: m.name, qty: 0 };
        summaryByClient[m.name].qty += (m.qty || 0);
      });
      const rows = Object.values(summaryByClient).map(s => `<div>${escapeHtml(s.name)} — ${s.qty} unidades</div>`).join('');
      const html = `<div style="text-align:left"><strong>Periodo:</strong> ${start.toISOString().slice(0,10)} — ${end.toISOString().slice(0,10)}<br/><br/>${rows}</div>`;
      if (window.Swal) {
        Swal.fire({
          title: 'Vista previa de la boleta',
          html,
          showCancelButton: true,
          confirmButtonText: 'Generar boleta',
          cancelButtonText: 'Cancelar',
          width: 700
        }).then(res=>{ if (res.isConfirmed) this.generateBoleta(start,end); });
      } else {
        if (confirm('Generar boleta para el periodo?')) this.generateBoleta(start,end);
      }
    }catch(err){ console.error('Error mostrando preview boleta:', err); showAlert('Boletas','Error al preparar la vista previa.','error'); }
  }

  renderBoletas(){
    if (!this.boletasContainer) return;
    this.boletasContainer.innerHTML = '';
    if (!this.boletas || this.boletas.length === 0) {
      this.boletasContainer.innerHTML = '<p>No hay boletas generadas.</p>';
      return;
    }
    for (const b of this.boletas.slice().reverse()) {
      const div = document.createElement('div');
      div.className = 'boleta-item';
      div.innerHTML = `
        <div class="boleta-info">
          <div><strong>Periodo:</strong> ${b.periodStart} — ${b.periodEnd}</div>
          <div><strong>Generada:</strong> ${new Date(b.createdAt).toLocaleString()}</div>
          <div><strong>Pedidos:</strong> ${b.totalOrders} — <strong>Cantidad total:</strong> ${b.totalQty}</div>
        </div>
        <div class="boleta-actions">
          <button data-id="${b.id}" class="btn btn-small" data-action="view">Ver</button>
          <button data-id="${b.id}" class="btn btn-small" data-action="export">JSON</button>
          <button data-id="${b.id}" class="btn btn-small" data-action="exportpdf">PDF</button>
        </div>
      `;
      this.boletasContainer.appendChild(div);
    }

    // attach handlers
    this.boletasContainer.querySelectorAll('button').forEach(btn => {
      btn.onclick = (e) => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'view') this.viewBoleta(id);
        if (action === 'export') this.exportBoleta(id);
        if (action === 'exportpdf') this.exportBoletaPDF(id);
      };
    });
  }

  viewBoleta(id){
    const b = this.boletas.find(x => x.id === id);
    if (!b) return showAlert('Boletas','Boleta no encontrada','error');
    const lines = [];
    lines.push(`Boleta: ${b.periodStart} — ${b.periodEnd}`);
    lines.push(`Generada: ${new Date(b.createdAt).toLocaleString()}`);
    lines.push('');
    for (const s of b.summary) {
      lines.push(`${s.name}: ${s.qty} unidades`);
      for (const it of s.items) lines.push(`  - ${it.date}: ${it.qty} ${it.notes ? (' — ' + it.notes) : ''}`);
    }
    const text = lines.join('\n');
    if (window.Swal) {
      Swal.fire({ title: 'Boleta', html: `<pre style="text-align:left; white-space:pre-wrap">${escapeHtml(text)}</pre>`, width: 700 });
    } else {
      alert(text);
    }
  }

  exportBoleta(id){
    const b = this.boletas.find(x => x.id === id);
    if (!b) return showAlert('Boletas','Boleta no encontrada','error');
    const data = JSON.stringify(b, null, 2);
    const a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(data);
    a.download = `boleta_${b.periodStart}_${b.periodEnd}.json`;
    a.click();
  }

  exportBoletaPDF(id){
    const b = this.boletas.find(x => x.id === id);
    if (!b) return showAlert('Boletas','Boleta no encontrada','error');
    try{
      // jsPDF is included via CDN (index.html). Use UMD global:
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) { showAlert('PDF','La librería jsPDF no está cargada.','error'); return; }
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text(`Boleta: ${b.periodStart} — ${b.periodEnd}`, 14, 20);
      doc.setFontSize(11);
      doc.text(`Generada: ${new Date(b.createdAt).toLocaleString()}`, 14, 28);
      doc.text(`Pedidos: ${b.totalOrders}    Cantidad total: ${b.totalQty}`, 14, 36);
      let y = 46;
      for (const s of b.summary) {
        doc.text(`${s.name}: ${s.qty} unidades`, 14, y);
        y += 6;
        if (s.items && s.items.length) {
          for (const it of s.items) {
            doc.text(`  - ${it.date}: ${it.qty} ${it.notes ? (' — ' + it.notes) : ''}`, 18, y);
            y += 5;
            if (y > 270) { doc.addPage(); y = 20; }
          }
        }
        y += 4;
        if (y > 270) { doc.addPage(); y = 20; }
      }
      const filename = `boleta_${b.periodStart}_${b.periodEnd}.pdf`;
      doc.save(filename);
    }catch(err){ console.error('Error exportando PDF:', err); showAlert('PDF','Error creando PDF.','error'); }
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
