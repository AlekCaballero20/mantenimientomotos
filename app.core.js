/* =============================================================================
  app.core.js — MotoLog (LocalStorage) v4 PRO++ — Core (FIX: no revive motos)
  -----------------------------------------------------------------------------
  Contiene: DOM refs, estado, storage, utils, tabs, form, guardar, reminders,
  docs, dashboard, historial, fullRender (pero NO init/bindings UI).
============================================================================= */

(() => {
  'use strict';

  /* =========================
     DOM helpers
  ========================= */
  const qs  = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => Array.from(root.querySelectorAll(s));
  const on  = (el, ev, fn, opts) => { if(el) el.addEventListener(ev, fn, opts); };

  /* =========================
     DOM refs (core)
  ========================= */
  const motoSelect     = qs('#motoSelect');
  const buttons        = qsa('.actions button');

  const formSection    = qs('#eventForm');        // <form>
  const formInner      = qs('#eventFormInner');   // wrapper del form
  const formTitle      = qs('#formTitle');
  const formTypeBadge  = qs('#formTypeBadge');
  const guardarBtn     = qs('#guardar');
  const cancelarBtn    = qs('#cancelar');

  // Base inputs
  const $fecha = qs('#fecha');
  const $km    = qs('#km');
  const $desc  = qs('#descripcion');
  const $costo = qs('#costo');

  /* =========================
     DOM refs (subforms)
  ========================= */
  const subGasolina      = qs('#subformGasolina');
  const subMantenimiento = qs('#subformMantenimiento');
  const subRepuesto      = qs('#subformRepuesto');     // (puede no existir)
  const subSintoma       = qs('#subformSintoma');      // (puede no existir)

  // Gasolina
  const $fuelLitros      = qs('#fuelLitros');
  const $fuelPrecioLitro = qs('#fuelPrecioLitro');
  const $fuelEstacion    = qs('#fuelEstacion');

  // Mantenimiento (opcionales)
  const $mntTipo   = qs('#mntTipo');    // (puede no existir)
  const $mntTaller = qs('#mntTaller');  // (puede no existir)

  const $chkAceite       = qs('#chkAceite');
  const $chkFiltroAire   = qs('#chkFiltroAire');
  const $chkFiltroAceite = qs('#chkFiltroAceite');
  const $chkFrenos       = qs('#chkFrenos');
  const $chkCadena       = qs('#chkCadena');
  const $chkLuces        = qs('#chkLuces');

  // Repuesto (puede no existir)
  const $repCategoria     = qs('#repCategoria');
  const $repNombre        = qs('#repNombre');
  const $repMarca         = qs('#repMarca');
  const $repRef           = qs('#repRef');
  const $repGarantiaFecha = qs('#repGarantiaFecha');
  const $repGarantiaKm    = qs('#repGarantiaKm');

  // Síntoma (puede no existir)
  const $sinCategoria = qs('#sinCategoria');
  const $sinSeveridad = qs('#sinSeveridad');
  const $sinRepite    = qs('#sinRepite');

  /* =========================
     DOM refs (tabs)
  ========================= */
  const tabs     = qsa('.tab');
  const tabpanes = qsa('.tabpane');

  /* =========================
     DOM refs (dashboard)
  ========================= */
  const $kmActual     = qs('#kmActual');
  const $kpiLastEvent = qs('#kpiLastEvent');
  const $kpiReminders = qs('#kpiReminders');
  const $kpiFuelPerf  = qs('#kpiFuelPerf');
  const $alertsList   = qs('#alertsList');

  /* =========================
     DOM refs (docs cards)
  ========================= */
  const $soatEstado = qs('#soatEstado');
  const $rtmEstado  = qs('#rtmEstado');
  const $impEstado  = qs('#impEstado');

  const $soatChip = qs('#soatChip');
  const $rtmChip  = qs('#rtmChip');
  const $impChip  = qs('#impChip');

  const $soatHasta = qs('#soatHasta');
  const $rtmHasta  = qs('#rtmHasta');
  const $impHasta  = qs('#impHasta');

  const $btnEditDocs  = qs('#btnEditDocs');
  const $btnEditDocs2 = qs('#btnEditDocs2');
  const $btnEditImp   = qs('#btnEditImp');

  const $docsModal   = qs('#docsModal');
  const $docsOverlay = qs('#docsOverlay');
  const $docsClose   = qs('#docsClose');
  const $docsSave    = qs('#docsSave');
  const $docsCancel  = qs('#docsCancel');
  const $soatDate    = qs('#soatDate');
  const $rtmDate     = qs('#rtmDate');
  const $impDate     = qs('#impDate');

  /* =========================
     DOM refs (reminders)
  ========================= */
  const $remindersBody  = qs('#remindersBody');
  const $btnAddReminder = qs('#btnAddReminder');

  /* =========================
     DOM refs (historial)
  ========================= */
  const historyBody = qs('#historyBody');
  const $filterTipo = qs('#filterTipo');
  const $searchTxt  = qs('#searchText'); // index nuevo

  /* =========================
     Toast + StatusBar
  ========================= */
  const $toastRegion = qs('#toastRegion');
  const $statusText  = qs('#statusText');
  const $statusBar   = qs('#statusBar');

  /* =========================
     Extras del index
  ========================= */
  const $fabAdd     = qs('#fabAdd');
  const $btnMenu    = qs('#btnMenu');
  const $btnExport  = qs('#btnExport');
  const $btnImport  = qs('#btnImport');
  const $importFile = qs('#importFile');

  // Modal motos (agregar)
  const $btnAddMoto  = qs('#btnAddMoto');
  const $motoModal   = qs('#motoModal');
  const $motoOverlay = qs('#motoOverlay');
  const $motoClose   = qs('#motoClose');
  const $motoCancel  = qs('#motoCancel');
  const $motoSave    = qs('#motoSave');
  const $motoName    = qs('#motoName');
  const $motoKey     = qs('#motoKey');

  // ✅ eliminar moto (modal confirm)
  const $btnDelMoto      = qs('#btnDelMoto');
  const $delMotoOverlay  = qs('#delMotoOverlay');
  const $delMotoModal    = qs('#delMotoModal');
  const $delMotoName     = qs('#delMotoName');
  const $delMotoClose    = qs('#delMotoClose');
  const $delMotoCancel   = qs('#delMotoCancel');
  const $delMotoConfirm  = qs('#delMotoConfirm');

  // Quick actions
  const $quickActions = qsa('.qaBtn');

  /* =========================
     Estado
  ========================= */
  let currentType = null;

  /* =========================
     Storage
  ========================= */
  const STORAGE_KEY = 'motoLogDataV2'; // mantenemos para no perder data

  function uid(){
    return (globalThis.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random().toString(16).slice(2);
  }

  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }

  function defaultStore(){
    const baseReminders = [
      { id: uid(), name: 'Cambio de aceite',            every_km: 3000, every_days: null, last_km: null, last_date: null },
      { id: uid(), name: 'Lubricar/ajustar cadena',     every_km:  500, every_days: null, last_km: null, last_date: null },
      { id: uid(), name: 'Revisión frenos',             every_km: 3000, every_days: null, last_km: null, last_date: null },
      { id: uid(), name: 'Filtro de aire (revisión)',   every_km: 3000, every_days: null, last_km: null, last_date: null },
      { id: uid(), name: 'Bujía (revisión/cambio)',     every_km: 9000, every_days: null, last_km: null, last_date: null },
      { id: uid(), name: 'Líquido de frenos',           every_km: null, every_days: 730,  last_km: null, last_date: null },
      { id: uid(), name: 'Aceite suspensión delantera', every_km: 20000, every_days: null, last_km: null, last_date: null }
    ];

    const emptyDocs = { soat: null, rtm: null, imp: null };

    return {
      version: 4,
      selected_moto: 'apache200',
      motos: {
        apache200: { meta:{ id:'apache200', name:'Apache 200', cc:200, plate:'' }, events: [], docs: { ...emptyDocs }, reminders: clone(baseReminders) },
        apache180: { meta:{ id:'apache180', name:'Apache 180', cc:180, plate:'' }, events: [], docs: { ...emptyDocs }, reminders: clone(baseReminders) }
      }
    };
  }

  function safeLocalStorageGet(key){
    try { return localStorage.getItem(key); }
    catch { return null; }
  }
  function safeLocalStorageSet(key, val){
    try { localStorage.setItem(key, val); return true; }
    catch { return false; }
  }

  function normalizeMotoKey(k){
    return (k ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g,'')
      .replace(/[^a-z0-9_-]/g,'');
  }

  function normalizeName(s){
    return (s ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ')
      .replace(/[^a-z0-9 ]/g,'')
      .trim();
  }

  function todayISO(){ return new Date().toISOString().slice(0,10); }

  function ensureMotoShape(m, keyFallback=null){
    if(!m || typeof m !== 'object') return null;

    if(!Array.isArray(m.events)) m.events = [];
    if(!m.docs) m.docs = { soat:null, rtm:null, imp:null };
    if(!Array.isArray(m.reminders) || !m.reminders.length){
      m.reminders = clone(defaultStore().motos.apache200.reminders);
    }

    m.docs.soat ??= null;
    m.docs.rtm  ??= null;
    m.docs.imp  ??= null;

    m.meta = m.meta || {};
    m.meta.id ||= keyFallback || uid();
    m.meta.name ||= 'Moto';
    m.meta.cc = (m.meta.cc === '' || m.meta.cc === undefined) ? null : (Number(m.meta.cc) || m.meta.cc || null);
    m.meta.plate ||= '';

    // sanear eventos
    m.events = (m.events || [])
      .filter(e => e && typeof e === 'object')
      .map(e => ({
        ...e,
        id: e.id || uid(),
        tipo: e.tipo || 'mantenimiento',
        fecha: e.fecha || todayISO(),
        km: isFinite(Number(e.km)) ? Number(e.km) : (Number(e.km) || 0),
        descripcion: (e.descripcion ?? '').toString(),
        costo: (e.costo === '' || e.costo === undefined) ? null : (isFinite(Number(e.costo)) ? Number(e.costo) : null),
        created_at: e.created_at || new Date().toISOString()
      }));

    // ordenar asc por fecha/km
    m.events.sort((a,b)=>{
      if((a.fecha||'') !== (b.fecha||'')) return (a.fecha||'').localeCompare(b.fecha||'');
      return (a.km||0) - (b.km||0);
    });

    return m;
  }

  /* =============================================================================
     ✅ ensureStoreShape (FIX anti-zombies + dedupe)
     - NO reinyecta apache200/apache180 si el usuario los borró
     - Solo crea defaults cuando el store viene vacío/primer arranque
     - Deduplica motos con el mismo nombre (ej: "Apache 200" duplicada)
  ============================================================================= */
  function ensureStoreShape(store){
    // 0) si viene nada
    if(!store || typeof store !== 'object'){
      return defaultStore();
    }

    // 1) Migración v1: { apache200:[], apache180:[] }
    if(store.apache200 || store.apache180){
      const v1 = store;
      const s = defaultStore();
      s.motos.apache200.events = Array.isArray(v1.apache200) ? v1.apache200 : [];
      s.motos.apache180.events = Array.isArray(v1.apache180) ? v1.apache180 : [];
      return s;
    }

    // 2) estructura base
    if(!store.motos || typeof store.motos !== 'object'){
      // si no hay motos, creamos defaults
      return defaultStore();
    }

    // 3) normalizar keys + meta.id consistente
    const fixedMotos = {};
    for(const [k,v] of Object.entries(store.motos)){
      const nk = normalizeMotoKey(k) || normalizeMotoKey(v?.meta?.id) || uid();
      if(!v || typeof v !== 'object') continue;
      v.meta = v.meta || {};
      v.meta.id = v.meta.id || nk;
      fixedMotos[nk] = v;
    }
    store.motos = fixedMotos;

    // 4) si el usuario dejó el store sin motos (o quedó vacío tras import raro)
    //    SOLO en ese caso regeneramos defaults. Esto evita resurrecciones.
    const motoKeys = Object.keys(store.motos);
    if(motoKeys.length === 0){
      const base = defaultStore();
      store.motos = base.motos;
      store.selected_moto = base.selected_moto;
      store.version = 4;
      return store;
    }

    // 5) ensureMotoShape para cada moto
    for(const [k,v] of Object.entries(store.motos)){
      store.motos[k] = ensureMotoShape(v, k) || ensureMotoShape(clone(defaultStore().motos.apache200), k);
    }

    // 6) ✅ DEDUPE por nombre (evita “Apache 200” repetida con keys distintas)
    //    Criterio: mismo nombre normalizado -> se queda la que tenga más eventos; la otra se fusiona (eventos+docs)
    const byName = new Map(); // nameNorm -> key
    for(const k of Object.keys(store.motos)){
      const nameNorm = normalizeName(store.motos[k]?.meta?.name || k) || k;
      if(!byName.has(nameNorm)){
        byName.set(nameNorm, k);
        continue;
      }

      const keepKey = byName.get(nameNorm);
      const a = store.motos[keepKey];
      const b = store.motos[k];

      const aCount = (a?.events?.length || 0);
      const bCount = (b?.events?.length || 0);

      const winnerKey = (bCount > aCount) ? k : keepKey;
      const loserKey  = (winnerKey === k) ? keepKey : k;

      const winner = store.motos[winnerKey];
      const loser  = store.motos[loserKey];

      // Fusionar eventos (por id, sin duplicar)
      const seen = new Set((winner.events || []).map(e => e.id));
      (loser.events || []).forEach(e => {
        if(!e || !e.id) return;
        if(seen.has(e.id)) return;
        seen.add(e.id);
        winner.events.push(e);
      });

      // Re-ordenar
      winner.events.sort((x,y)=>{
        if((x.fecha||'') !== (y.fecha||'')) return (x.fecha||'').localeCompare(y.fecha||'');
        return (x.km||0) - (y.km||0);
      });

      // Fusionar docs (preferir los que existan)
      winner.docs = winner.docs || { soat:null, rtm:null, imp:null };
      loser.docs = loser.docs || { soat:null, rtm:null, imp:null };
      winner.docs.soat = winner.docs.soat || loser.docs.soat || null;
      winner.docs.rtm  = winner.docs.rtm  || loser.docs.rtm  || null;
      winner.docs.imp  = winner.docs.imp  || loser.docs.imp  || null;

      // Fusionar reminders: mantener winner, pero si está vacío, usar loser
      if(!Array.isArray(winner.reminders) || winner.reminders.length === 0){
        winner.reminders = Array.isArray(loser.reminders) ? loser.reminders : clone(defaultStore().motos.apache200.reminders);
      }

      // Garantizar meta
      winner.meta = winner.meta || {};
      winner.meta.name = winner.meta.name || loser.meta?.name || 'Moto';

      // Borrar duplicado
      delete store.motos[loserKey];

      // actualizar mapa si cambió el winner
      byName.set(nameNorm, winnerKey);

      // si selected apuntaba al loser, muévelo
      const selNorm = normalizeMotoKey(store.selected_moto || '');
      if(selNorm && selNorm === loserKey){
        store.selected_moto = winnerKey;
      }
    }

    // 7) selected moto válido
    const sel = normalizeMotoKey(store.selected_moto || motoSelect?.value || '');
    const anyKey = Object.keys(store.motos)[0];
    store.selected_moto = (sel && store.motos[sel]) ? sel : anyKey;

    // 8) version marker
    store.version = 4;

    return store;
  }

  function loadStore(){
    const raw = safeLocalStorageGet(STORAGE_KEY);
    if(!raw) return defaultStore();
    try{
      return ensureStoreShape(JSON.parse(raw));
    } catch {
      return defaultStore();
    }
  }

  function toast(msg, tone='ok', ms=2200){
    if(!$toastRegion){
      console[tone === 'bad' ? 'error' : tone === 'warn' ? 'warn' : 'log']('[MotoLog]', msg);
      return;
    }
    const el = document.createElement('div');
    el.className = `toast toast--${tone}`;
    el.innerHTML = safeText(msg);
    $toastRegion.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 240);
    }, ms);
  }

  function setStatus(text, tone='ok', ms=null){
    if(!$statusText || !$statusBar) return;
    $statusText.textContent = text;
    $statusBar.dataset.tone = tone;
    if(ms){
      clearTimeout(setStatus._t);
      setStatus._t = setTimeout(() => {
        $statusText.textContent = 'Listo';
        $statusBar.dataset.tone = 'ok';
      }, ms);
    }
  }

  function saveStore(store){
    // Siempre saneamos antes de guardar (sin reinyectar defaults por la fuerza)
    const clean = ensureStoreShape(store);
    const ok = safeLocalStorageSet(STORAGE_KEY, JSON.stringify(clean));
    if(!ok){
      toast('No se pudo guardar. Storage bloqueado (incógnito/permisos).', 'bad', 4200);
      setStatus('Error guardando (storage bloqueado)', 'bad');
    } else {
      setStatus('Guardado ✅', 'ok', 1100);
    }
    return ok;
  }

  function getMotoKey(store=null){
    const s = store || loadStore();
    const fromSelect = normalizeMotoKey(motoSelect?.value || '');
    if(fromSelect && s.motos && s.motos[fromSelect]) return fromSelect;

    const sel = normalizeMotoKey(s.selected_moto || '');
    if(sel && s.motos && s.motos[sel]) return sel;

    const firstKey = Object.keys(s.motos || {})[0] || 'apache200';
    return firstKey;
  }

  function getMoto(store){
    const key = getMotoKey(store);
    if(store.motos && store.motos[key]) return store.motos[key];
    const firstKey = Object.keys(store.motos || {})[0] || 'apache200';
    return store.motos[firstKey];
  }

  /* =========================
     Utils
  ========================= */
  function parseISO(dateStr){
    if(!dateStr) return null;
    const d = new Date(dateStr + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  function daysBetween(a, b){
    const ms = 24*60*60*1000;
    return Math.round((b.getTime() - a.getTime())/ms);
  }

  function money(n){
    if(n === null || n === undefined || n === '') return '';
    const num = Number(n);
    if(!isFinite(num)) return '';
    try{
      return num.toLocaleString('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 });
    } catch {
      return '$' + Math.round(num);
    }
  }

  function safeText(s){
    return (s ?? '').toString().replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
  }

  function humanType(t){
    return ({
      gasolina:'Gasolina',
      mantenimiento:'Mantenimiento',
      repuesto:'Repuesto',
      sintoma:'Síntoma'
    }[t] || t || 'Evento');
  }

  function setHidden(el, hidden){
    if(!el) return;
    el.classList.toggle('hidden', !!hidden);
    el.toggleAttribute?.('hidden', !!hidden);
  }

  function debounce(fn, wait=180){
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  function fmtKm(n){
    return isFinite(Number(n)) ? Number(n).toLocaleString('es-CO') : '—';
  }

  /* =========================
     Tabs
  ========================= */
  function activateTabById(id, focusMain=false){
    tabs.forEach(b=>{
      const active = (b.dataset.tab === id);
      b.classList.toggle('is-active', active);
      if(active) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
      if(b.getAttribute('role') === 'tab'){
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      }
    });
    tabpanes.forEach(p => p.classList.toggle('is-active', p.id === id));
    if(focusMain){
      setTimeout(()=>{ try{ qs('#mainContent')?.focus(); }catch{} }, 0);
    }
  }

  function initTabs(){
    if(!tabs.length) return;
    tabs.forEach(btn=>{
      on(btn, 'click', ()=>{
        const id = btn.dataset.tab;
        activateTabById(id, true);
      });
    });
  }

  /* =========================
     Form: abrir/cerrar/subforms
  ========================= */
  function showFormForType(type){
    currentType = type;

    if(formTitle) formTitle.textContent = `Nuevo ${humanType(type)}`;
    if(formTypeBadge) formTypeBadge.textContent = humanType(type);

    if($fecha && !$fecha.value) $fecha.value = todayISO();
    if(formSection) setHidden(formSection, false);

    if(subGasolina)      subGasolina.hidden      = (type !== 'gasolina');
    if(subMantenimiento) subMantenimiento.hidden = (type !== 'mantenimiento');
    if(subRepuesto)      subRepuesto.hidden      = (type !== 'repuesto');
    if(subSintoma)       subSintoma.hidden       = (type !== 'sintoma');

    setStatus(`Registrando: ${humanType(type)}`, 'ok', 1200);
    setTimeout(() => { try { $km?.focus(); } catch {} }, 0);
  }

  function closeForm(){
    if(formSection) setHidden(formSection, true);

    if($fecha) $fecha.value = '';
    if($km)    $km.value = '';
    if($desc)  $desc.value = '';
    if($costo) $costo.value = '';

    if($fuelLitros) $fuelLitros.value = '';
    if($fuelPrecioLitro) $fuelPrecioLitro.value = '';
    if($fuelEstacion) $fuelEstacion.value = '';

    if($mntTipo) $mntTipo.value = 'preventivo';
    if($mntTaller) $mntTaller.value = '';
    [$chkAceite,$chkFiltroAire,$chkFiltroAceite,$chkFrenos,$chkCadena,$chkLuces].forEach(x=>{ if(x) x.checked=false; });

    if($repCategoria) $repCategoria.value = 'motor';
    if($repNombre) $repNombre.value = '';
    if($repMarca) $repMarca.value = '';
    if($repRef) $repRef.value = '';
    if($repGarantiaFecha) $repGarantiaFecha.value = '';
    if($repGarantiaKm) $repGarantiaKm.value = '';

    if($sinCategoria) $sinCategoria.value = 'motor';
    if($sinSeveridad) $sinSeveridad.value = '3';
    if($sinRepite) $sinRepite.checked = false;

    currentType = null;
    setStatus('Listo', 'ok', 900);
  }

  /* =========================
     Guardar evento
  ========================= */
  function buildEventFromForm(){
    const fecha = $fecha ? $fecha.value : '';
    const kmRaw = $km ? $km.value : '';
    const km    = Number(kmRaw);
    const descripcion = $desc ? $desc.value.trim() : '';
    const costoVal = $costo ? $costo.value : '';
    const costo = costoVal !== '' ? (Number(costoVal) || null) : null;

    if(!currentType) return { error:'Selecciona un tipo de evento.' };
    if(!fecha) return { error:'La fecha es obligatoria.' };
    if(!isFinite(km) || km <= 0) return { error:'El kilometraje debe ser un número mayor a 0.' };
    if(!descripcion) return { error:'La descripción es obligatoria.' };

    const base = {
      id: uid(),
      tipo: currentType,
      fecha,
      km,
      descripcion,
      costo,
      created_at: new Date().toISOString()
    };

    if(currentType === 'gasolina'){
      const litrosVal = $fuelLitros ? $fuelLitros.value : '';
      const precioVal = $fuelPrecioLitro ? $fuelPrecioLitro.value : '';
      const litros = litrosVal !== '' ? (Number(litrosVal) || null) : null;
      const precio_litro = precioVal !== '' ? (Number(precioVal) || null) : null;
      const estacion = $fuelEstacion ? $fuelEstacion.value.trim() : '';
      base.fuel = { litros, precio_litro, estacion };
    }

    if(currentType === 'mantenimiento'){
      const tipo_mnt = $mntTipo ? $mntTipo.value : 'preventivo';
      const taller = $mntTaller ? $mntTaller.value.trim() : '';
      const checklist = {
        aceite: !!($chkAceite && $chkAceite.checked),
        filtro_aire: !!($chkFiltroAire && $chkFiltroAire.checked),
        filtro_aceite: !!($chkFiltroAceite && $chkFiltroAceite.checked),
        frenos: !!($chkFrenos && $chkFrenos.checked),
        cadena: !!($chkCadena && $chkCadena.checked),
        luces: !!($chkLuces && $chkLuces.checked),
      };
      base.maintenance = { tipo: tipo_mnt, taller, checklist };
    }

    if(currentType === 'repuesto'){
      const hasPartUI = !!($repNombre || subRepuesto);
      if(hasPartUI){
        const categoria = $repCategoria ? $repCategoria.value : 'motor';
        const nombre = $repNombre ? $repNombre.value.trim() : '';
        const marca = $repMarca ? $repMarca.value.trim() : '';
        const ref = $repRef ? $repRef.value.trim() : '';
        const garantia_fecha = $repGarantiaFecha ? ($repGarantiaFecha.value || null) : null;
        const garantiaKmVal = $repGarantiaKm ? $repGarantiaKm.value : '';
        const garantia_km = garantiaKmVal !== '' ? (Number(garantiaKmVal) || null) : null;

        if($repNombre && !nombre) return { error:'En repuesto, escribe el nombre del repuesto.' };
        base.part = { categoria, nombre, marca, ref, garantia_fecha, garantia_km };
      } else {
        base.part = null;
      }
    }

    if(currentType === 'sintoma'){
      const hasSymUI = !!($sinCategoria || $sinSeveridad || subSintoma);
      if(hasSymUI){
        const categoria = $sinCategoria ? $sinCategoria.value : 'motor';
        const severidad = $sinSeveridad ? Number($sinSeveridad.value) : 3;
        const repite = !!($sinRepite && $sinRepite.checked);
        base.symptom = { categoria, severidad, repite };
      } else {
        base.symptom = null;
      }
    }

    return { event: base };
  }

  function setReminderLast(store, motoKey, reminderName, km, fecha){
    const m = store.motos[motoKey];
    if(!m || !m.reminders) return;
    const r = m.reminders.find(x => (x.name || '').toLowerCase() === reminderName.toLowerCase());
    if(!r) return;
    r.last_km = isFinite(km) ? km : r.last_km;
    r.last_date = fecha || r.last_date;
  }

  function pushEvent(event){
    const store = loadStore();
    const motoKey = getMotoKey(store);
    const moto = store.motos[motoKey];

    moto.events.push(event);

    moto.events.sort((a,b)=>{
      if((a.fecha||'') !== (b.fecha||'')) return (a.fecha||'').localeCompare(b.fecha||'');
      return (a.km||0) - (b.km||0);
    });

    if(event.tipo === 'mantenimiento' && event.maintenance?.checklist){
      const ck = event.maintenance.checklist;
      if(ck.aceite) setReminderLast(store, motoKey, 'Cambio de aceite', event.km, event.fecha);
      if(ck.cadena) setReminderLast(store, motoKey, 'Lubricar/ajustar cadena', event.km, event.fecha);
      if(ck.frenos) setReminderLast(store, motoKey, 'Revisión frenos', event.km, event.fecha);
      if(ck.filtro_aire) setReminderLast(store, motoKey, 'Filtro de aire (revisión)', event.km, event.fecha);
      if(ck.filtro_aceite) setReminderLast(store, motoKey, 'Cambio de aceite', event.km, event.fecha);
    }

    if(event.tipo === 'repuesto' && event.part && /pastill|zapat|disco|freno/i.test(event.part.nombre || '')){
      setReminderLast(store, motoKey, 'Revisión frenos', event.km, event.fecha);
    }

    store.selected_moto = motoKey;
    saveStore(store);
  }

  /* =========================
     Recordatorios
  ========================= */
  function computeReminderNext(r, currentKm, today){
    const out = { next_km:null, next_date:null, status:'ok', due_in_km:null, due_in_days:null };

    if(r.every_km && isFinite(currentKm)){
      const base = (r.last_km ?? currentKm);
      out.next_km = base + r.every_km;
      out.due_in_km = out.next_km - currentKm;
    }

    if(r.every_days){
      const baseDate = parseISO(r.last_date) || today;
      const nextDate = new Date(baseDate.getTime());
      nextDate.setDate(nextDate.getDate() + r.every_days);
      out.next_date = nextDate.toISOString().slice(0,10);
      out.due_in_days = daysBetween(today, nextDate);
    }

    const soonKm = 200;
    const soonDays = 15;

    let isOver = false;
    let isSoon = false;

    if(out.due_in_km !== null){
      if(out.due_in_km < 0) isOver = true;
      else if(out.due_in_km <= soonKm) isSoon = true;
    }
    if(out.due_in_days !== null){
      if(out.due_in_days < 0) isOver = true;
      else if(out.due_in_days <= soonDays) isSoon = true;
    }

    out.status = isOver ? 'vencido' : (isSoon ? 'pronto' : 'ok');
    return out;
  }

  function statusChip(status, label){
    const cls =
      status === 'vencido' ? 'chip chip--bad' :
      status === 'pronto'  ? 'chip chip--warn' :
      status === 'ok'      ? 'chip chip--ok' :
      'chip';
    return `<span class="${cls}">${safeText(label)}</span>`;
  }

  function renderReminders(store){
    if(!$remindersBody) return;

    const moto = getMoto(store);
    const events = moto.events || [];
    const currentKm = getCurrentKm(events);
    const today = new Date();

    if(!moto.reminders || !moto.reminders.length){
      $remindersBody.innerHTML = `<tr><td colspan="5" class="muted">No hay recordatorios.</td></tr>`;
      return;
    }

    const rows = moto.reminders.map(r=>{
      const calc = computeReminderNext(r, currentKm ?? 0, today);
      let venceTxt = '—';
      if(calc.next_date && calc.next_km){
        const kmUrg = (calc.due_in_km ?? 999999);
        const dUrg  = (calc.due_in_days ?? 999999);
        venceTxt = (dUrg <= 15 || dUrg < kmUrg/20) ? calc.next_date : `${fmtKm(calc.next_km)} km`;
      } else if(calc.next_date){
        venceTxt = calc.next_date;
      } else if(calc.next_km){
        venceTxt = `${fmtKm(calc.next_km)} km`;
      }

      const label =
        calc.status === 'vencido' ? 'VENCIDO' :
        calc.status === 'pronto'  ? 'PRONTO'  :
        'OK';

      return { r, calc, venceTxt, label };
    });

    const order = { vencido:0, pronto:1, ok:2 };
    rows.sort((a,b)=>{
      const ao = order[a.calc.status] ?? 9;
      const bo = order[b.calc.status] ?? 9;
      if(ao !== bo) return ao - bo;
      return (a.r.name || '').localeCompare(b.r.name || '');
    });

    // ⚠️ No ponemos onclick directo en tbody (se pisa). Usamos delegación UNA vez.
    $remindersBody.innerHTML = rows.map(({r, calc, venceTxt, label})=>{
      const kmInfo =
        calc.due_in_km !== null ? `${calc.due_in_km} km` :
        calc.due_in_days !== null ? `${calc.due_in_days} d` :
        '—';

      return `
        <tr>
          <td>${statusChip(calc.status, label)}</td>
          <td>${safeText(r.name || '')}</td>
          <td>${safeText(venceTxt)}</td>
          <td>${safeText(kmInfo)}</td>
          <td class="tdActions">
            <button class="ghost" type="button" data-rem-id="${safeText(r.id)}" data-action="mark">Marcar</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Delegación estable (no se pisa en cada render)
  if($remindersBody && !$remindersBody.__bound){
    $remindersBody.__bound = true;
    $remindersBody.addEventListener('click', (e) => {
      const btn = e.target.closest?.('button[data-action="mark"]');
      if(!btn) return;
      const id = btn.getAttribute('data-rem-id');
      if(!id) return;

      const s = loadStore();
      const motoKey = getMotoKey(s);
      const m = s.motos[motoKey];
      const r = (m.reminders || []).find(x => x.id === id);
      if(!r) return;

      const kmNow = getCurrentKm(m.events) ?? null;
      r.last_km = kmNow;
      r.last_date = todayISO();

      saveStore(s);
      toast('Recordatorio marcado ✅', 'ok', 1500);
      fullRender();
    });
  }

  /* =========================
     Documentos
  ========================= */
  function docStatus(dateISO){
    if(!dateISO) return { status:'sin', label:'SIN', days:null };
    const today = new Date();
    const d = parseISO(dateISO);
    if(!d) return { status:'sin', label:'SIN', days:null };

    const diff = daysBetween(today, d);
    const soon = 15;

    if(diff < 0) return { status:'vencido', label:'VENCIDO', days:diff };
    if(diff <= soon) return { status:'pronto', label:`PRONTO (${diff}d)`, days:diff };
    return { status:'ok', label:`OK (${diff}d)`, days:diff };
  }

  function setMiniMeta(el, statusObj){
    if(!el) return;
    el.textContent = statusObj.label;
  }

  function setChip(el, status, label){
    if(!el) return;
    el.className =
      status === 'vencido' ? 'chip chip--bad' :
      status === 'pronto'  ? 'chip chip--warn' :
      status === 'ok'      ? 'chip chip--ok' :
      'chip';
    el.textContent = label;
  }

  function renderDocs(store){
    const moto = getMoto(store);
    const docs = moto.docs || {};

    if($soatHasta) $soatHasta.textContent = docs.soat || '—';
    if($rtmHasta)  $rtmHasta.textContent  = docs.rtm  || '—';
    if($impHasta)  $impHasta.textContent  = docs.imp  || '—';

    const so = docStatus(docs.soat);
    const rt = docStatus(docs.rtm);
    const im = docStatus(docs.imp);

    setMiniMeta($soatEstado, so);
    setMiniMeta($rtmEstado,  rt);
    setMiniMeta($impEstado,  im);

    setChip($soatChip, so.status, so.label);
    setChip($rtmChip,  rt.status, rt.label);
    setChip($impChip,  im.status, im.label);
  }

  function openDocsModal(){
    if(!$docsModal) return;

    const store = loadStore();
    const moto = getMoto(store);
    const docs = moto.docs || {};

    if($soatDate) $soatDate.value = docs.soat || '';
    if($rtmDate)  $rtmDate.value  = docs.rtm  || '';
    if($impDate)  $impDate.value  = docs.imp  || '';

    setHidden($docsOverlay, false);
    $docsModal.classList.remove('hidden');
    $docsModal.setAttribute('aria-hidden','false');

    setTimeout(() => { try { $soatDate?.focus(); } catch {} }, 0);
  }

  function closeDocsModal(){
    if(!$docsModal) return;
    $docsModal.classList.add('hidden');
    $docsModal.setAttribute('aria-hidden','true');
    setHidden($docsOverlay, true);
  }

  function saveDocsFromModal(){
    const store = loadStore();
    const motoKey = getMotoKey(store);
    const moto = store.motos[motoKey];

    moto.docs = moto.docs || {};
    moto.docs.soat = ($soatDate && $soatDate.value) ? $soatDate.value : null;
    moto.docs.rtm  = ($rtmDate  && $rtmDate.value)  ? $rtmDate.value  : null;
    moto.docs.imp  = ($impDate  && $impDate.value)  ? $impDate.value  : null;

    store.selected_moto = motoKey;
    saveStore(store);
    closeDocsModal();
    toast('Documentos guardados ✅', 'ok', 1700);
    fullRender();
  }

  /* =========================
     Dashboard
  ========================= */
  function getCurrentKm(events){
    if(!events || !events.length) return null;
    const last = events[events.length - 1];
    return isFinite(Number(last.km)) ? Number(last.km) : null;
  }

  function renderFuelPerf(events){
    const fuels = (events || []).filter(e => e.tipo === 'gasolina' && e.fuel && e.fuel.litros && isFinite(e.km));
    fuels.sort((a,b)=> (a.fecha||'').localeCompare(b.fecha||'') || (a.km||0)-(b.km||0));
    if(fuels.length < 2) return null;

    const last = fuels[fuels.length - 1];
    const prev = fuels[fuels.length - 2];
    const deltaKm = Number(last.km) - Number(prev.km);
    const liters = Number(last.fuel.litros);
    if(deltaKm > 0 && liters > 0) return deltaKm / liters;
    return null;
  }

  function renderAlerts(store){
    if(!$alertsList) return;

    const moto = getMoto(store);
    const events = moto.events || [];
    const currentKm = getCurrentKm(events);
    const today = new Date();

    const alerts = [];

    const docs = moto.docs || {};
    [
      { key:'SOAT', date: docs.soat },
      { key:'RTM', date: docs.rtm },
      { key:'Impuesto', date: docs.imp }
    ].forEach(d=>{
      const st = docStatus(d.date);
      if(st.status === 'vencido') alerts.push({ level:'vencido', text:`${d.key} vencido (${d.date || '—'}).` });
      else if(st.status === 'pronto') alerts.push({ level:'pronto', text:`${d.key} pronto a vencer: ${d.date}.` });
    });

    (moto.reminders || []).forEach(r=>{
      const calc = computeReminderNext(r, currentKm ?? 0, today);
      if(calc.status === 'vencido'){
        alerts.push({ level:'vencido', text:`${r.name} vencido.` });
      } else if(calc.status === 'pronto'){
        let extra = '';
        if(calc.due_in_km !== null) extra = `en ${calc.due_in_km} km`;
        else if(calc.due_in_days !== null) extra = `en ${calc.due_in_days} días`;
        alerts.push({ level:'pronto', text:`${r.name} pronto (${extra}).` });
      }
    });

    const parts = (events || []).filter(e=>e.tipo==='repuesto' && e.part);
    parts.forEach(e=>{
      const gf = e.part?.garantia_fecha;
      const gk = e.part?.garantia_km;

      if(gf){
        const st = docStatus(gf);
        if(st.status === 'vencido') alerts.push({ level:'vencido', text:`Garantía vencida: ${e.part.nombre || 'repuesto'} (fecha ${gf}).` });
        if(st.status === 'pronto')  alerts.push({ level:'pronto',  text:`Garantía por vencer: ${e.part.nombre || 'repuesto'} (fecha ${gf}).` });
      }
      if(gk && currentKm !== null){
        
const diff = Number(gk) - Number(currentKm);
        if(isFinite(diff)){
          if(diff < 0) alerts.push({ level:'vencido', text:`Garantía km vencida: ${e.part.nombre || 'repuesto'} (hasta ${fmtKm(gk)} km).` });
          else if(diff <= 200) alerts.push({ level:'pronto', text:`Garantía km pronto: ${e.part.nombre || 'repuesto'} (faltan ${diff} km).` });
        }
      }
    });

    if(!alerts.length){
      $alertsList.innerHTML = `<li class="muted">Sin alertas por ahora</li>`;
      return;
    }

    const order = { vencido:0, pronto:1, ok:2 };
    alerts.sort((a,b)=> (order[a.level]??9) - (order[b.level]??9));

    $alertsList.innerHTML = alerts.slice(0,8).map(a=>{
      const cls = a.level === 'vencido' ? 'alert alert--bad' : 'alert alert--warn';
      return `<li class="${cls}">${safeText(a.text)}</li>`;
    }).join('');
  }

  function renderDashboard(store){
    const moto = getMoto(store);
    const events = moto.events || [];

    const currentKm = getCurrentKm(events);
    if($kmActual) $kmActual.textContent = currentKm ? fmtKm(currentKm) : '—';

    if($kpiLastEvent){
      if(events.length){
        const last = events[events.length - 1];
        $kpiLastEvent.textContent = `${humanType(last.tipo)} · ${last.fecha}`;
      } else {
        $kpiLastEvent.textContent = '—';
      }
    }

    if($kpiReminders){
      const today = new Date();
      const rows = (moto.reminders || []).map(r => computeReminderNext(r, currentKm ?? 0, today));
      const active = rows.filter(x => x.status === 'vencido' || x.status === 'pronto').length;
      $kpiReminders.textContent = String(active);
    }

    if($kpiFuelPerf){
      const perf = renderFuelPerf(events);
      $kpiFuelPerf.textContent = perf ? perf.toFixed(1) : '—';
    }

    renderAlerts(store);
  }

  /* =========================
     Historial
  ========================= */
  function buildDetailLine(e){
    let extra = '';

    if(e.tipo === 'gasolina' && e.fuel){
      const litros = e.fuel.litros ? `${e.fuel.litros} L` : '';
      const est = e.fuel.estacion ? ` · ${e.fuel.estacion}` : '';
      extra = [litros].filter(Boolean).join('') + est;
    }

    if(e.tipo === 'mantenimiento' && e.maintenance){
      const t = e.maintenance.tipo ? e.maintenance.tipo : '';
      const tall = e.maintenance.taller ? ` · ${e.maintenance.taller}` : '';
      extra = (t ? t : '') + tall;
    }

    if(e.tipo === 'repuesto'){
      if(e.part){
        const cat = e.part.categoria ? e.part.categoria : '';
        const n = e.part.nombre ? e.part.nombre : '';
        const mk = e.part.marca ? ` · ${e.part.marca}` : '';
        extra = `${cat ? cat + ' · ' : ''}${n}${mk}`.trim();
      } else {
        extra = 'Repuesto';
      }
    }

    if(e.tipo === 'sintoma'){
      if(e.symptom){
        const cat = e.symptom.categoria ? e.symptom.categoria : '';
        const sev = e.symptom.severidad ? ` · Sev ${e.symptom.severidad}` : '';
        const rep = e.symptom.repite ? ' · Repite' : '';
        extra = `${cat}${sev}${rep}`.trim();
      } else {
        extra = 'Síntoma';
      }
    }

    const base = safeText(e.descripcion || '');
    if(extra) return `${safeText(extra)}<br><span class="muted">${base}</span>`;
    return base;
  }

  function renderHistory(store){
    if(!historyBody) return;

    const moto = getMoto(store);
    let events = moto.events || [];

    const tipo = $filterTipo ? $filterTipo.value : '';
    const q = $searchTxt ? $searchTxt.value.trim().toLowerCase() : '';

    if(tipo){
      events = events.filter(e => e.tipo === tipo);
    }

    if(q){
      events = events.filter(e => {
        const blob = [
          e.fecha, e.tipo, e.km, e.descripcion, e.costo,
          e.fuel?.estacion,
          e.maintenance?.taller,
          e.part?.nombre, e.part?.marca, e.part?.ref, e.part?.categoria,
          e.symptom?.categoria, e.symptom?.severidad
        ].map(x => (x ?? '').toString().toLowerCase()).join(' | ');
        return blob.includes(q);
      });
    }

    if(!events.length){
      historyBody.innerHTML = `<tr><td colspan="6" class="muted">No hay eventos para mostrar.</td></tr>`;
      return;
    }

    const list = events.slice().sort((a,b)=>{
      if((a.fecha||'') !== (b.fecha||'')) return (b.fecha||'').localeCompare(a.fecha||'');
      return (b.km||0) - (a.km||0);
    });

    historyBody.innerHTML = list.map(e=>{
      const detail = buildDetailLine(e);
      return `
        <tr>
          <td>${safeText(e.fecha)}</td>
          <td>${safeText(humanType(e.tipo))}</td>
          <td>${fmtKm(e.km)}</td>
          <td>${e.costo ? money(e.costo) : ''}</td>
          <td>${detail}</td>
          <td class="tdActions">
            <button class="ghost" type="button" data-action="del" data-id="${safeText(e.id)}">Borrar</button>
          </td>
        </tr>
      `;
    }).join('');

    // Delegación estable (no se pisa en cada render)
    if(!historyBody.__bound){
      historyBody.__bound = true;
      historyBody.addEventListener('click', (ev) => {
        const btn = ev.target.closest?.('button[data-action="del"]');
        if(!btn) return;
        const id = btn.getAttribute('data-id');
        if(!id) return;
        if(!confirm('¿Borrar este evento? Esto no se puede des-borrar.')) return;

        const s = loadStore();
        const motoKey = getMotoKey(s);
        const m = s.motos[motoKey];
        m.events = (m.events || []).filter(x => x.id !== id);
        saveStore(s);
        toast('Evento borrado 🧹', 'ok', 1500);
        fullRender();
      });
    }
  }

  /* =========================
     Full render
  ========================= */
  function fullRender(){
    const store = loadStore();
    renderDashboard(store);
    renderDocs(store);
    renderReminders(store);
    renderHistory(store);
  }

  /* =========================
     Exportar lo necesario al UI
  ========================= */
  window.MotoLog = {
    // DOM (por si UI los necesita)
    refs: {
      motoSelect, buttons,
      formSection, formInner, guardarBtn, cancelarBtn,
      tabs, tabpanes,
      $btnEditDocs, $btnEditDocs2, $btnEditImp,
      $docsClose, $docsSave, $docsCancel, $docsOverlay,
      $btnAddReminder,
      historyBody, $filterTipo, $searchTxt,
      $fabAdd, $btnMenu, $btnExport, $btnImport, $importFile,
      $btnAddMoto, $motoClose, $motoCancel, $motoOverlay, $motoSave,
      $motoName, $motoKey,
      $btnDelMoto, $delMotoOverlay, $delMotoModal, $delMotoName, $delMotoClose, $delMotoCancel, $delMotoConfirm,
      $quickActions,
      $motoModal, $docsModal
    },

    // helpers
    on, qs, qsa,
    loadStore, saveStore, ensureStoreShape, defaultStore,
    getMotoKey, getMoto,
    normalizeMotoKey,

    // core
    todayISO, toast, setStatus, debounce,
    activateTabById, initTabs,
    showFormForType, closeForm, buildEventFromForm, pushEvent,
    openDocsModal, closeDocsModal, saveDocsFromModal,
    getCurrentKm, fullRender
  };

})();