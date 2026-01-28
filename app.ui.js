/* =============================================================================
  app.ui.js — MotoLog (LocalStorage) v4 PRO++ — UI / Bindings (Mitad 2/2)
  -----------------------------------------------------------------------------
  Requiere: app.core.js que expone window.MotoLog con refs + funciones core.

  Contiene:
  ✅ Init + bindings UI (tabs, botones, FAB, quick actions)
  ✅ Export/Import JSON (backup)
  ✅ Modal Docs + Modal Moto + Modal Eliminar Moto (overlay + ESC)
  ✅ Modal Recordatorios (crear con nombre + fecha/km + desc)
  ✅ Moto select (persist + render)
  ✅ Filtros historial (tipo + búsqueda con debounce)
  ✅ Menú simple (prompt) opcional
============================================================================= */

(() => {
  'use strict';

  const ML = window.MotoLog;
  if(!ML){
    console.error('[MotoLog] Falta window.MotoLog. Carga app.core.js antes que app.ui.js');
    return;
  }

  const {
    refs,
    on, qs,
    loadStore, saveStore, ensureStoreShape, defaultStore,
    getMotoKey, getMoto,
    todayISO, toast, setStatus, debounce,
    activateTabById, initTabs,
    showFormForType, closeForm, buildEventFromForm, pushEvent,
    openDocsModal, closeDocsModal, saveDocsFromModal,
    fullRender, getCurrentKm,
    normalizeMotoKey
  } = ML;

  /* =========================
     Refs (desde core)
  ========================= */
  const {
    motoSelect, buttons,
    formSection, formInner, guardarBtn, cancelarBtn,
    $btnEditDocs, $btnEditDocs2, $btnEditImp,
    $docsClose, $docsSave, $docsCancel, $docsOverlay,
    $btnAddReminder,
    $filterTipo, $searchTxt,
    $fabAdd, $btnMenu, $btnExport, $btnImport, $importFile,
    $btnAddMoto, $motoClose, $motoCancel, $motoOverlay, $motoSave,
    $motoName, $motoKey,
    $btnDelMoto, $delMotoOverlay, $delMotoModal, $delMotoName, $delMotoClose, $delMotoCancel, $delMotoConfirm,
    $quickActions,
    $motoModal, $docsModal
  } = refs || {};

  /* =========================
     ✅ Refs extra (modal recordatorios) — no están en core refs
  ========================= */
  const $reminderOverlay = qs('#reminderOverlay');
  const $reminderModal   = qs('#reminderModal');
  const $reminderClose   = qs('#reminderClose');
  const $reminderCancel  = qs('#reminderCancel');
  const $reminderSave    = qs('#reminderSave');
  const $reminderTitle   = qs('#reminderModalTitle');

  const $remName = qs('#remName');
  const $remDate = qs('#remDate');
  const $remKm   = qs('#remKm');
  const $remDesc = qs('#remDesc');

  /* =========================
     Utils UI
  ========================= */
  function safeTextLocal(s){
    return (s ?? '').toString().replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
  }

  function slugifyKey(name){
    const base = (name || 'moto').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,'-')
      .replace(/^-+|-+$/g,'');
    return base || 'moto';
  }

  function uniqueMotoKey(store, baseKey){
    let k = baseKey;
    let i = 2;
    while(store.motos && store.motos[k]){
      k = `${baseKey}-${i}`;
      i++;
    }
    return k;
  }

  function hydrateMotoSelect(store, preferKey=null){
    if(!motoSelect) return;

    const prev = preferKey || store.selected_moto || motoSelect.value;
    const motos = Object.entries(store.motos || {})
      .map(([key, m]) => ({ key, name: m?.meta?.name || key }))
      .sort((a,b)=> (a.name || '').localeCompare(b.name || ''));

    motoSelect.innerHTML = motos
      .map(m => `<option value="${safeTextLocal(m.key)}">${safeTextLocal(m.name)}</option>`)
      .join('');

    const exists = motos.some(m => m.key === prev);
    motoSelect.value = exists ? prev : (motos[0]?.key || 'apache200');
  }

  function isModalOpen(modalEl){
    return !!(modalEl && !modalEl.classList.contains('hidden') && modalEl.getAttribute('aria-hidden') !== 'true');
  }

  function closeAnyOpenModal(){
    if(isModalOpen($docsModal)) closeDocsModal();
    if(isModalOpen($motoModal)) closeMotoModal();
    if(isModalOpen($delMotoModal)) closeDelMotoModal();
    if(isModalOpen($reminderModal)) closeReminderModal();
  }

  function parseISODate(iso){
    if(!iso) return null;
    const d = new Date(`${iso}T00:00:00`);
    return Number.isFinite(d.getTime()) ? d : null;
  }

  function daysBetween(a, b){
    // a y b son Date, devuelve diferencia entera en días (b - a)
    const ms = 24 * 60 * 60 * 1000;
    const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((ub - ua) / ms);
  }

  /* =========================
     Export / Import
  ========================= */
  function download(filename, text){
    const a = document.createElement('a');
    a.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function doExport(){
    const store = loadStore();
    const now = new Date();
    const stamp = now.toISOString().slice(0,19).replace(/[:T]/g,'-');
    const filename = `MotoLog-backup-${stamp}.json`;
    download(filename, JSON.stringify(store, null, 2));
    toast('Backup exportado ✅', 'ok', 1800);
  }

  function doImportFromFile(file){
    if(!file) return;

    const name = (file.name || '').toLowerCase();
    if(name && !name.endsWith('.json')){
      toast('Ese archivo no parece JSON 🤨 Igual lo intento...', 'warn', 2600);
    }

    const reader = new FileReader();
    reader.onload = () => {
      try{
        const parsed = JSON.parse(String(reader.result || ''));
        const store = ensureStoreShape(parsed);
        saveStore(store);
        hydrateMotoSelect(store, store.selected_moto);

        toast('Backup importado ✅', 'ok', 1800);
        closeForm();
        fullRender();
        activateTabById('tabDashboard', true);
      } catch(e){
        console.error(e);
        toast('Ese archivo no parece un backup válido 😅', 'bad', 4200);
        setStatus('Import inválido', 'bad', 1800);
      }
    };
    reader.readAsText(file);
  }

  /* =========================
     Modal Moto (Agregar)
  ========================= */
  function openMotoModal(){
    if(!$motoModal) return;
    if($motoOverlay) $motoOverlay.classList.remove('hidden');
    $motoModal.classList.remove('hidden');
    $motoModal.setAttribute('aria-hidden','false');
    setTimeout(()=>{ try{ $motoName?.focus(); } catch{} }, 0);
  }

  function closeMotoModal(){
    if(!$motoModal) return;
    $motoModal.classList.add('hidden');
    $motoModal.setAttribute('aria-hidden','true');
    if($motoOverlay) $motoOverlay.classList.add('hidden');
    if($motoName) $motoName.value = '';
    if($motoKey)  $motoKey.value = '';
  }

  function addMotoFromModal(){
    const name = ($motoName?.value || '').trim();
    const keyInput = ($motoKey?.value || '').trim();

    if(!name){
      toast('Ponle un nombre a la moto 🙃', 'warn', 2400);
      return;
    }

    const store = loadStore();
    const baseKey = keyInput ? slugifyKey(keyInput) : slugifyKey(name);
    const key = uniqueMotoKey(store, baseKey);

    const base = defaultStore();
    const motoTemplate = JSON.parse(JSON.stringify(base.motos.apache200));

    store.motos[key] = {
      meta: { id:key, name, cc: null, plate: '' },
      events: [],
      docs: { soat:null, rtm:null, imp:null },
      reminders: JSON.parse(JSON.stringify(motoTemplate.reminders))
    };

    store.selected_moto = key;
    saveStore(store);

    hydrateMotoSelect(store, key);
    toast('Moto agregada 🏍️', 'ok', 1600);
    closeMotoModal();
    fullRender();
  }

  /* =========================
     Modal Eliminar Moto
  ========================= */
  function openDelMotoModal(){
    if(!$delMotoModal) {
      toast('No está el modal de eliminar en el HTML.', 'warn', 2600);
      return;
    }

    const store = loadStore();
    const key = getMotoKey(store);
    const moto = store.motos?.[key];
    const name = moto?.meta?.name || key;

    if($delMotoName) $delMotoName.textContent = name;

    if($delMotoOverlay) $delMotoOverlay.classList.remove('hidden');
    $delMotoModal.classList.remove('hidden');
    $delMotoModal.setAttribute('aria-hidden','false');

    setTimeout(()=>{ try{ $delMotoConfirm?.focus(); } catch{} }, 0);
  }

  function closeDelMotoModal(){
    if(!$delMotoModal) return;
    $delMotoModal.classList.add('hidden');
    $delMotoModal.setAttribute('aria-hidden','true');
    if($delMotoOverlay) $delMotoOverlay.classList.add('hidden');
  }

  function deleteCurrentMoto(){
    const store = loadStore();
    const key = getMotoKey(store);

    const keys = Object.keys(store.motos || {});
    if(keys.length <= 1){
      toast('No puedes borrar la última moto 😅', 'warn', 2600);
      setStatus('Acción bloqueada', 'warn', 1600);
      return;
    }

    delete store.motos[key];

    const newKeys = Object.keys(store.motos || {});
    store.selected_moto = newKeys[0] || 'apache200';

    saveStore(store);
    hydrateMotoSelect(store, store.selected_moto);

    toast('Moto eliminada 🗑️', 'ok', 1600);
    closeDelMotoModal();
    closeForm();
    fullRender();
    activateTabById('tabDashboard', true);
  }

  /* =========================
     ✅ Modal Recordatorios (crear)
  ========================= */
  function openReminderModal(){
    if(!$reminderModal){
      toast('No está el modal de recordatorios en el HTML 😅', 'warn', 2600);
      return;
    }

    // Reset form
    if($reminderTitle) $reminderTitle.textContent = 'Nuevo recordatorio';
    if($remName) $remName.value = '';
    if($remDate) $remDate.value = '';
    if($remKm)   $remKm.value = '';
    if($remDesc) $remDesc.value = '';

    if($reminderOverlay) $reminderOverlay.classList.remove('hidden');
    $reminderModal.classList.remove('hidden');
    $reminderModal.setAttribute('aria-hidden','false');

    setTimeout(()=>{ try{ $remName?.focus(); } catch{} }, 0);
  }

  function closeReminderModal(){
    if(!$reminderModal) return;
    $reminderModal.classList.add('hidden');
    $reminderModal.setAttribute('aria-hidden','true');
    if($reminderOverlay) $reminderOverlay.classList.add('hidden');
  }

  function saveReminderFromModal(){
    const name = ($remName?.value || '').trim();
    const dueDateISO = ($remDate?.value || '').trim(); // YYYY-MM-DD
    const dueKmRaw = ($remKm?.value || '').toString().trim();
    const desc = ($remDesc?.value || '').trim();

    if(!name){
      toast('Nombre obligatorio 🙃', 'warn', 2400);
      setStatus('Falta nombre', 'warn', 1600);
      return;
    }
    if(!dueDateISO && !dueKmRaw){
      toast('Pon fecha o km (o ambos). Si no, no es recordatorio, es decoración.', 'warn', 3200);
      setStatus('Falta vencimiento', 'warn', 1800);
      return;
    }

    const store = loadStore();
    const motoKey = getMotoKey(store);
    const moto = store.motos?.[motoKey];
    if(!moto){
      toast('No encontré la moto actual 😵‍💫', 'bad', 2800);
      return;
    }

    const kmNow = getCurrentKm(moto.events || []) ?? null;
    const today = new Date();

    // Construir recordatorio en el formato que el core ya entiende:
    // - every_km: intervalo desde last_km
    // - every_days: intervalo desde last_date
    // - last_km / last_date: base
    const r = {
      id: (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
      name,
      every_km: null,
      every_days: null,
      last_km: kmNow,
      last_date: todayISO(),
      desc: desc || '' // extra (core no lo usa aún, pero no estorba)
    };

    // Vence por km: convertir "vence en X km" a (last_km + every_km)
    if(dueKmRaw){
      const dueKm = Number(dueKmRaw);
      if(Number.isFinite(dueKm) && dueKm >= 0){
        // Si no hay km actual, igual guardamos, pero last_km queda null y el core usará currentKm como base
        const baseKm = (kmNow ?? dueKm);
        const diff = dueKm - baseKm;

        if(diff > 0){
          r.last_km = baseKm;
          r.every_km = diff;
        } else {
          // Ya está vencido: truco para que computeReminderNext marque vencido
          // base = dueKm, every_km = 1 => next_km = dueKm+1, due_in_km = (dueKm+1) - currentKm (negativo si currentKm >= dueKm+1)
          r.last_km = dueKm;
          r.every_km = 1;
        }
      } else {
        toast('El km debe ser un número válido 🤨', 'warn', 2600);
        setStatus('Km inválido', 'warn', 1800);
        return;
      }
    }

    // Vence por fecha: convertir "vence el YYYY-MM-DD" a last_date + every_days
    if(dueDateISO){
      const dueDate = parseISODate(dueDateISO);
      if(!dueDate){
        toast('La fecha está rara. Eso no es culpa de la moto 😅', 'warn', 2600);
        setStatus('Fecha inválida', 'warn', 1800);
        return;
      }

      const diffDays = daysBetween(today, dueDate);

      if(diffDays > 0){
        r.last_date = todayISO();
        r.every_days = diffDays;
      } else {
        // Ya vencido: truco equivalente
        r.last_date = dueDateISO;
        r.every_days = 1;
      }
    }

    moto.reminders = Array.isArray(moto.reminders) ? moto.reminders : [];
    moto.reminders.push(r);

    store.selected_moto = motoKey;
    saveStore(store);

    toast('Recordatorio guardado ✅', 'ok', 1600);
    closeReminderModal();
    fullRender();
    activateTabById('tabRecordatorios', true);
  }

  /* =========================
     Menú simple (opcional)
  ========================= */
  function openMenu(){
    const store = loadStore();
    const key = getMotoKey(store);
    const motoName = store.motos?.[key]?.meta?.name || key;

    const choice = prompt(
      `Menú MotoLog (${motoName}):\n` +
      '1) Exportar backup\n' +
      '2) Importar backup\n' +
      '3) Agregar moto\n' +
      '4) Eliminar moto\n' +
      '5) Ir a Dashboard\n' +
      '6) Ir a Registrar\n' +
      '7) Ir a Historial\n' +
      '8) Nuevo recordatorio\n\n' +
      'Escribe el número:'
    );
    const n = Number(choice);

    if(n === 1) doExport();
    if(n === 2) $btnImport?.click();
    if(n === 3) openMotoModal();
    if(n === 4) openDelMotoModal();
    if(n === 5) activateTabById('tabDashboard', true);
    if(n === 6) activateTabById('tabRegistrar', true);
    if(n === 7) activateTabById('tabHistorial', true);
    if(n === 8) { activateTabById('tabRecordatorios', true); openReminderModal(); }
  }

  /* =========================
     Bindings UI
  ========================= */
  function initButtons(){
    (buttons || []).forEach(btn=>{
      on(btn, 'click', ()=>{
        const type = btn.dataset.type;
        if(!type) return;
        showFormForType(type);
        activateTabById('tabRegistrar', true);
      });
    });

    ($quickActions || []).forEach(btn=>{
      on(btn, 'click', ()=>{
        const go = btn.getAttribute('data-go') || 'tabRegistrar';
        const type = btn.getAttribute('data-type') || 'mantenimiento';
        activateTabById(go, true);
        showFormForType(type);
      });
    });

    on($fabAdd, 'click', ()=>{
      activateTabById('tabRegistrar', true);
      showFormForType('mantenimiento');
    });

    on(cancelarBtn, 'click', (ev)=>{
      ev.preventDefault?.();
      closeForm();
    });

    on(guardarBtn, 'click', (ev)=>{
      ev.preventDefault?.();
      try{
        const { event, error } = buildEventFromForm();
        if(error){
          toast(error, 'warn', 2600);
          setStatus(error, 'warn', 1800);
          return;
        }
        pushEvent(event);
        toast('Evento guardado ✅', 'ok', 1600);
        closeForm();
        fullRender();
        activateTabById('tabDashboard', true);
      } catch (e){
        console.error(e);
        toast('Se rompió algo al guardar (mira consola).', 'bad', 4500);
        setStatus('Error guardando', 'bad', 2200);
      }
    });

    on(formInner, 'submit', (e)=> e.preventDefault());
    on(formSection, 'submit', (e)=> e.preventDefault());
  }

  function initDocs(){
    on($btnEditDocs,  'click', openDocsModal);
    on($btnEditDocs2, 'click', openDocsModal);
    on($btnEditImp,   'click', openDocsModal);

    on($docsClose,  'click', closeDocsModal);
    on($docsCancel, 'click', closeDocsModal);
    on($docsSave,   'click', saveDocsFromModal);
    on($docsOverlay,'click', closeDocsModal);
  }

  function initReminders(){
    // Antes: creaba "Nuevo recordatorio" sin preguntar nada
    // Ahora: abre modal y guarda con info real
    on($btnAddReminder, 'click', ()=>{
      activateTabById('tabRecordatorios', true);
      openReminderModal();
    });

    // Modal bindings
    on($reminderClose, 'click', closeReminderModal);
    on($reminderCancel,'click', closeReminderModal);
    on($reminderOverlay,'click', closeReminderModal);
    on($reminderSave,  'click', saveReminderFromModal);

    // Enter en modal => guardar (pero sin romper textarea)
    on($reminderModal, 'keydown', (e)=>{
      if(e.key !== 'Enter') return;
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if(tag === 'textarea') return;
      e.preventDefault();
      saveReminderFromModal();
    });
  }

  function initHistoryFilters(){
    on($filterTipo, 'change', ()=> fullRender());

    if($searchTxt){
      const debounced = debounce(() => fullRender(), 160);
      on($searchTxt, 'input', debounced);
    }
  }

  function initMotoSelect(){
    on(motoSelect, 'change', ()=>{
      closeForm();
      const store = loadStore();
      const val = motoSelect.value;

      const key = normalizeMotoKey ? normalizeMotoKey(val) : val;
      store.selected_moto = (store.motos && store.motos[key]) ? key : val;

      saveStore(store);
      toast('Moto cambiada 🏍️', 'ok', 1400);
      fullRender();
    });
  }

  function initMotoModal(){
    on($btnAddMoto, 'click', openMotoModal);
    on($motoClose, 'click', closeMotoModal);
    on($motoCancel,'click', closeMotoModal);
    on($motoOverlay,'click', closeMotoModal);
    on($motoSave,  'click', addMotoFromModal);

    on($motoModal, 'keydown', (e)=>{
      if(e.key === 'Enter'){
        e.preventDefault();
        addMotoFromModal();
      }
    });
  }

  function initDelMotoModal(){
    on($btnDelMoto, 'click', openDelMotoModal);
    on($delMotoClose, 'click', closeDelMotoModal);
    on($delMotoCancel,'click', closeDelMotoModal);
    on($delMotoOverlay,'click', closeDelMotoModal);
    on($delMotoConfirm,'click', deleteCurrentMoto);

    on($delMotoModal, 'keydown', (e)=>{
      if(e.key === 'Enter'){
        e.preventDefault();
        deleteCurrentMoto();
      }
    });
  }

  function initExportImport(){
    on($btnExport, 'click', doExport);

    on($btnImport, 'click', ()=>{
      if($importFile) $importFile.click();
      else toast('No encuentro el input de importación 😅', 'warn');
    });

    on($importFile, 'change', (e)=>{
      const file = e.target.files && e.target.files[0];
      doImportFromFile(file);
      e.target.value = '';
    });
  }

  function initMenu(){
    on($btnMenu, 'click', openMenu);
  }

  function initGlobalKeys(){
    document.addEventListener('keydown', (e)=>{
      if(e.key !== 'Escape') return;
      closeAnyOpenModal();
    });
  }

  /* =========================
     Init general
  ========================= */
  function init(){
    initTabs();

    const store = loadStore();
    hydrateMotoSelect(store, store.selected_moto);

    initButtons();
    initDocs();
    initReminders();
    initHistoryFilters();
    initMotoSelect();
    initMotoModal();
    initDelMotoModal();
    initExportImport();
    initMenu();
    initGlobalKeys();

    setStatus('Listo', 'ok');
    fullRender();

    try{
      const $fecha = qs('#fecha');
      if($fecha && !$fecha.value) $fecha.value = todayISO();
    } catch {}
  }

  init();

})();