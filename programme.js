// ============================================================
// MODULE : PROGRAMME DE PRODUCTION & PRÉPARATION DES MILIEUX (MC)
// ============================================================
(function() {
    const STORAGE_KEY = 'microbio_prod_programme_v2';
    let progData = [];
    let progSheets = [];
    let progFileName = '';
    let progImportDate = '';
    let progActiveSheet = '__ALL__';
    let progViewMode = 'detail'; // 'detail' | 'grouped'
    let progPeriodFilter = 'all';

    // --- CSS STYLES ---
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        #prog-container { padding: 16px; max-width: 1250px; margin: 0 auto; font-family: inherit; }
        .prog-header-card {
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
            border-radius: 24px; padding: 22px; color: #fff; margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(49,46,129,0.25); position: relative; overflow: hidden;
        }
        .prog-header-card::after {
            content: ''; position: absolute; right: -20px; bottom: -30px;
            width: 140px; height: 140px; background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%);
            border-radius: 50%; pointer-events: none;
        }
        .prog-badge-mc {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
            padding: 4px 12px; border-radius: 50px; font-size: 0.72rem; font-weight: 700;
        }
        .prog-kpi-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
            gap: 10px; margin-top: 16px;
        }
        .prog-kpi-card {
            background: rgba(255,255,255,0.1); backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.15); border-radius: 16px;
            padding: 12px 10px; text-align: center;
        }
        .prog-kpi-num { font-size: 1.4rem; font-weight: 900; line-height: 1.1; }
        .prog-kpi-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.6px; opacity: 0.85; margin-top: 4px; font-weight: 700; }
        
        .prog-upload-zone {
            border: 2px dashed #4f46e5; border-radius: 20px; padding: 36px 20px;
            text-align: center; background: #f8fafc; cursor: pointer; transition: all 0.25s;
            margin-bottom: 20px;
        }
        .prog-upload-zone:hover, .prog-upload-zone.dragover { background: #eef2ff; border-color: #6366f1; transform: scale(1.005); }
        .prog-file-active-bar {
            display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
            background: #fff; border: 1.5px solid #e2e8f0; border-radius: 16px;
            padding: 12px 18px; margin-bottom: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }
        .prog-filter-panel {
            background: #fff; border-radius: 20px; padding: 18px 20px;
            border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.04);
            margin-bottom: 18px;
        }
        .prog-chips-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
        .prog-chip {
            padding: 6px 14px; border-radius: 30px; border: 1.5px solid #e2e8f0;
            background: #f8fafc; font-size: 0.72rem; font-weight: 700; cursor: pointer;
            transition: all 0.2s; color: #475569;
        }
        .prog-chip:hover { border-color: #4f46e5; color: #4f46e5; }
        .prog-chip.active { background: #4f46e5; color: #fff; border-color: #4f46e5; box-shadow: 0 3px 10px rgba(79,70,229,0.3); }
        .prog-input-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
        .prog-input-group { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 150px; }
        .prog-input-label { font-size: 0.65rem; font-weight: 800; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.8px; }
        .prog-input {
            padding: 10px 12px; border-radius: 10px; border: 1.5px solid #cbd5e1;
            font-size: 0.82rem; font-weight: 700; background: #f8fafc; transition: 0.2s;
        }
        .prog-input:focus { outline: none; border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
        .prog-btn-primary {
            padding: 10px 18px; border-radius: 10px; background: #4f46e5; color: #fff;
            border: none; font-weight: 800; font-size: 0.78rem; cursor: pointer; transition: 0.2s;
            box-shadow: 0 3px 12px rgba(79,70,229,0.25);
        }
        .prog-btn-primary:hover { background: #4338ca; transform: translateY(-1px); }
        .prog-btn-secondary {
            padding: 10px 14px; border-radius: 10px; background: #f1f5f9; color: #475569;
            border: 1.5px solid #cbd5e1; font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: 0.2s;
        }
        .prog-btn-secondary:hover { background: #e2e8f0; }
        .prog-view-toggle { display: inline-flex; background: #f1f5f9; border-radius: 12px; padding: 3px; gap: 4px; }
        .prog-toggle-btn {
            padding: 6px 14px; border-radius: 9px; border: none; font-size: 0.72rem;
            font-weight: 800; cursor: pointer; background: transparent; color: #64748b; transition: 0.2s;
        }
        .prog-toggle-btn.active { background: #fff; color: #4f46e5; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }

        /* SYNTHÈSE / SUMMARY BANNER */
        .prog-summary-banner {
            background: linear-gradient(135deg, #f0fdf4 0%, #e0e7ff 100%);
            border: 1.5px solid #a7f3d0; border-radius: 18px;
            padding: 14px 18px; margin-bottom: 14px;
            box-shadow: 0 4px 16px rgba(5,150,105,0.06);
        }
        .prog-summary-header {
            display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
        }
        .prog-summary-title { display: flex; align-items: center; gap: 10px; }
        .prog-summary-total-badge {
            background: #ffffff; border: 1.5px solid #059669; border-radius: 14px;
            padding: 6px 14px; display: flex; flex-direction: column; align-items: flex-end;
            box-shadow: 0 2px 8px rgba(5,150,105,0.12);
        }

        /* TABLE VIEW (DESKTOP) */
        .prog-table-wrap {
            background: #fff; border-radius: 20px; border: 1px solid #e2e8f0;
            overflow-x: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 24px;
        }
        .prog-table { width: 100%; border-collapse: collapse; text-align: left; }
        .prog-table thead th {
            background: #f8fafc; color: #475569; padding: 12px 14px;
            font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px;
            border-bottom: 2px solid #e2e8f0; white-space: nowrap;
        }
        .prog-table tbody tr { border-top: 1px solid #f1f5f9; transition: 0.15s; }
        .prog-table tbody tr:hover { background: #f8fafc; }
        .prog-table tbody td { padding: 12px 14px; font-size: 0.8rem; font-weight: 600; color: #1e293b; vertical-align: middle; }
        .prog-pf-title { font-weight: 800; color: #1e1b4b; font-size: 0.88rem; display: flex; align-items: center; gap: 8px; }
        .prog-badge-status {
            padding: 3px 9px; border-radius: 6px; font-size: 0.62rem; font-weight: 800; display: inline-block; white-space: nowrap;
        }
        .prog-status-en-cours { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
        .prog-status-a-venir { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
        .prog-status-termine { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
        .prog-action-btn {
            padding: 6px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 800;
            border: 1px solid #cbd5e1; background: #fff; cursor: pointer; transition: 0.15s;
            display: inline-flex; align-items: center; gap: 4px;
        }
        .prog-action-btn:hover { background: #f1f5f9; border-color: #94a3b8; }

        /* MOBILE CARDS VIEW */
        .prog-mobile-cards-wrap { display: none; }
        .prog-m-card {
            background: #fff; border: 1.5px solid #e2e8f0; border-radius: 18px;
            padding: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.03);
            display: flex; flex-direction: column; gap: 10px; transition: 0.2s;
        }
        .prog-m-card:hover { border-color: #6366f1; }
        .prog-m-card-header {
            display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;
        }
        .prog-m-pf-name { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
        .prog-m-title { font-size: 0.95rem; font-weight: 900; color: #1e1b4b; line-height: 1.25; }
        .prog-m-code-badge {
            display: inline-block; font-size: 0.65rem; font-weight: 800;
            color: #4338ca; background: #eef2ff; padding: 2px 6px; border-radius: 4px;
            margin-top: 3px; border: 1px solid #c7d2fe;
        }
        .prog-m-card-body {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
            background: #f8fafc; padding: 10px 12px; border-radius: 14px; border: 1px solid #f1f5f9;
        }
        .prog-m-info-pill { display: flex; flex-direction: column; gap: 2px; }
        .prog-m-info-pill.highlight-qty {
            background: #ecfdf5; padding: 5px 8px; border-radius: 8px; border: 1px solid #a7f3d0;
        }
        .prog-m-label {
            font-size: 0.6rem; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.5px;
        }
        .prog-m-val { font-size: 0.8rem; font-weight: 700; color: #1e293b; }
        .prog-m-lot { font-family: monospace; font-size: 0.88rem; color: #0f172a; font-weight: 800; }
        .prog-m-qty { color: #047857 !important; font-size: 0.92rem !important; font-weight: 900 !important; }
        .prog-m-dates { font-size: 0.74rem; color: #334155; }
        .prog-m-card-actions {
            display: grid; grid-template-columns: 1fr 1.3fr; gap: 8px; margin-top: 2px;
        }
        .prog-m-btn {
            padding: 9px 12px; border-radius: 10px; font-size: 0.74rem; font-weight: 800;
            cursor: pointer; border: none; display: flex; align-items: center; justify-content: center;
            gap: 6px; transition: 0.15s;
        }
        .prog-m-btn.btn-copy { background: #f1f5f9; color: #334155; border: 1.5px solid #cbd5e1; }
        .prog-m-btn.btn-mc {
            background: #059669; color: #fff; box-shadow: 0 2px 8px rgba(5,150,105,0.25);
        }

        /* GROUPED VIEW */
        .prog-grouped-card {
            background: #fff; border: 1.5px solid #e2e8f0; border-radius: 18px;
            padding: 16px; margin-bottom: 12px; transition: 0.2s;
            box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }
        .prog-grouped-card:hover { border-color: #6366f1; transform: translateY(-1px); }
        .prog-g-lots-list {
            display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 10px 0;
            background: #f8fafc; padding: 10px; border-radius: 12px; border: 1px solid #f1f5f9;
        }
        .prog-g-lot-pill {
            display: inline-flex; align-items: center; gap: 6px;
            background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
            padding: 4px 8px; font-size: 0.7rem; font-weight: 700; color: #334155;
        }
        .prog-g-lot-pill strong { color: #0f172a; }
        .prog-g-lot-pill .lot-qty { color: #047857; font-weight: 800; background: #ecfdf5; padding: 1px 5px; border-radius: 4px; }

        /* RESPONSIVE MEDIA QUERIES (MOBILE) */
        @media (max-width: 768px) {
            #prog-container { padding: 10px 6px; }
            .prog-header-card { padding: 16px 14px; border-radius: 18px; margin-bottom: 12px; }
            .prog-kpi-grid {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 8px !important;
            }
            .prog-kpi-card { padding: 10px 8px !important; border-radius: 14px !important; }
            .prog-kpi-card-qty { grid-column: span 2; background: rgba(5,150,105,0.2) !important; border-color: rgba(5,150,105,0.4) !important; }
            .prog-kpi-num { font-size: 1.25rem !important; }
            .prog-kpi-label { font-size: 0.6rem !important; }

            .prog-filter-panel { padding: 14px 12px !important; border-radius: 16px !important; margin-bottom: 12px !important; }
            .prog-chips-bar {
                display: flex !important; flex-wrap: nowrap !important;
                overflow-x: auto !important; padding-bottom: 6px !important;
                -webkit-overflow-scrolling: touch !important; scrollbar-width: none !important;
            }
            .prog-chips-bar::-webkit-scrollbar { display: none; }
            .prog-chip { white-space: nowrap !important; flex-shrink: 0 !important; }

            .prog-input-row { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
            .prog-input-group { min-width: 100% !important; width: 100% !important; }

            .prog-view-toggle { width: 100% !important; display: flex !important; margin-top: 6px; }
            .prog-toggle-btn { flex: 1 !important; text-align: center !important; padding: 8px 6px !important; font-size: 0.72rem !important; }

            .prog-table-wrap { display: none !important; }
            .prog-mobile-cards-wrap { display: flex !important; flex-direction: column; gap: 10px; }

            .prog-file-active-bar { padding: 10px 14px !important; border-radius: 14px !important; }
            .prog-summary-header { flex-direction: column; align-items: flex-start; }
            .prog-summary-total-badge { width: 100%; align-items: flex-start; }
        }

        @media (min-width: 769px) {
            .prog-table-wrap { display: block; }
            .prog-mobile-cards-wrap { display: none !important; }
        }
    `;
    document.head.appendChild(styleEl);

    // --- INITIALIZATION ---
    function initModule() {
        loadSavedData();
    }

    function loadSavedData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                progData = parsed.items || [];
                progSheets = parsed.sheets || [];
                progFileName = parsed.fileName || '';
                progImportDate = parsed.importDate || '';
            }
        } catch(e) {
            console.warn('Erreur chargement programme:', e);
        }
    }

    function saveCurrentData() {
        try {
            const payload = {
                fileName: progFileName,
                importDate: progImportDate,
                sheets: progSheets,
                items: progData
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch(e) {
            console.warn('Erreur sauvegarde localStorage programme:', e);
        }
    }

    window.clearProgrammeData = function() {
        if (!confirm('Supprimer le programme mensuel actuel ?')) return;
        localStorage.removeItem(STORAGE_KEY);
        progData = [];
        progSheets = [];
        progFileName = '';
        progImportDate = '';
        mountView();
        if (window.showToast) window.showToast('Programme supprimé.', 'info');
    };

    // --- MOUNT VIEW ---
    function mountView() {
        const container = document.getElementById('view-programme');
        if (!container) return;
        container.innerHTML = '';

        const wrap = document.createElement('div');
        wrap.id = 'prog-container';
        wrap.innerHTML = buildMainHTML();
        container.appendChild(wrap);

        setupEventListeners();
        if (progData.length > 0) renderResults();
    }
    window.mountProgrammeView = mountView;

    function buildMainHTML() {
        const hasData = progData.length > 0;
        return `
            <!-- HEADER -->
            <div class="prog-header-card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
                    <div>
                        <div style="font-size:1.4rem; font-weight:900; letter-spacing:-0.5px;">📅 Programme Mensuel de Production</div>
                        <div style="font-size:0.75rem; opacity:0.85; margin-top:4px;">
                            Suivi des fabrications de Produits Finis (PF) pour l'anticipation et la préparation des Milieux de Culture (MC)
                        </div>
                    </div>
                    <span class="prog-badge-mc">🧫 Préparation Milieux Microbio</span>
                </div>

                <div class="prog-kpi-grid" id="prog-kpis">
                    <div class="prog-kpi-card"><div class="prog-kpi-num" id="kpi-total">0</div><div class="prog-kpi-label">Lots Totaux</div></div>
                    <div class="prog-kpi-card"><div class="prog-kpi-num" id="kpi-unique-pf">0</div><div class="prog-kpi-label">PF Différents</div></div>
                    <div class="prog-kpi-card prog-kpi-card-qty"><div class="prog-kpi-num" id="kpi-total-qty" style="color:#6ee7b7;">0</div><div class="prog-kpi-label">Total à Produire</div></div>
                    <div class="prog-kpi-card"><div class="prog-kpi-num" id="kpi-encours" style="color:#86efac;">0</div><div class="prog-kpi-label">En Cours</div></div>
                    <div class="prog-kpi-card"><div class="prog-kpi-num" id="kpi-avenir" style="color:#fde047;">0</div><div class="prog-kpi-label">À Venir</div></div>
                </div>
            </div>

            <!-- ACTIVE FILE BAR OR UPLOAD ZONE -->
            ${hasData ? `
                <div class="prog-file-active-bar">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:1.4rem;">📊</span>
                        <div>
                            <div style="font-weight:800; font-size:0.85rem; color:#1e1b4b;">${progFileName}</div>
                            <div style="font-size:0.68rem; color:#64748b;">${progData.length} lignes · ${progSheets.length} feuilles · ${progImportDate}</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button class="prog-action-btn" onclick="document.getElementById('prog-file-input').click()" style="color:#4f46e5; border-color:#818cf8;">🔄 Remplacer Excel</button>
                        <button class="prog-action-btn" onclick="window.clearProgrammeData()" style="color:#dc2626; border-color:#fca5a5;">🗑️ Supprimer</button>
                    </div>
                </div>
            ` : ''}

            <!-- UPLOAD ZONE (toujours présent si pas de données, ou caché si données) -->
            <div class="prog-upload-zone" id="prog-upload-zone" style="${hasData ? 'display:none;' : ''}">
                <div style="font-size:2.5rem; margin-bottom:8px;">📥</div>
                <div style="font-weight:800; font-size:1.05rem; color:#1e1b4b;">Importer le Programme Excel Mensuel</div>
                <div style="font-size:0.75rem; color:#64748b; margin-top:4px;">Glissez-déposez le fichier (.xlsx, .xls) ou cliquez pour parcourir</div>
            </div>
            <input type="file" id="prog-file-input" accept=".xlsx,.xls,.ods" style="display:none;">

            <!-- FILTER PANEL (Affiché dès qu'on a des données) -->
            <div id="prog-filter-panel" class="prog-filter-panel" style="${hasData ? '' : 'display:none;'}">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
                    <div style="font-size:0.7rem; font-weight:800; text-transform:uppercase; color:#4f46e5; letter-spacing:1px;">
                        ⚡ Périodes Rapides
                    </div>
                    <div class="prog-view-toggle">
                        <button class="prog-toggle-btn active" id="btn-toggle-detail" onclick="window.setProgViewMode('detail')">📋 Liste Détaillée</button>
                        <button class="prog-toggle-btn" id="btn-toggle-grouped" onclick="window.setProgViewMode('grouped')">🧫 Synthèse par PF</button>
                    </div>
                </div>

                <!-- QUICK PERIOD CHIPS -->
                <div class="prog-chips-bar">
                    <button class="prog-chip active" onclick="window.setProgPeriod('all', this)">🌟 Tout</button>
                    <button class="prog-chip" onclick="window.setProgPeriod('today', this)">🟢 Aujourd'hui</button>
                    <button class="prog-chip" onclick="window.setProgPeriod('week', this)">📅 Cette Semaine</button>
                    <button class="prog-chip" onclick="window.setProgPeriod('month', this)">🗓️ Ce Mois-ci</button>
                    <button class="prog-chip" onclick="window.setProgPeriod('next7', this)">⏳ 7 Prochains Jours</button>
                    <button class="prog-chip" onclick="window.setProgPeriod('next15', this)">📆 15 Prochains Jours</button>
                    <button class="prog-chip" onclick="window.setProgPeriod('next30', this)">📆 30 Prochains Jours</button>
                </div>

                <!-- INPUTS: RECHERCHE NOM PF & DATES LIBRES -->
                <div class="prog-input-row">
                    <div class="prog-input-group" style="flex:2; min-width:200px;">
                        <span class="prog-input-label">🔍 Nom du PF (Produit Fini)</span>
                        <input type="text" id="prog-search-name" class="prog-input" placeholder="ex: AMOXIL, BIOTANIDE, PARACETAMOL...">
                    </div>
                    <div class="prog-input-group">
                        <span class="prog-input-label">📅 Date Début</span>
                        <input type="date" id="prog-date-start" class="prog-input">
                    </div>
                    <div class="prog-input-group">
                        <span class="prog-input-label">📅 Date Fin</span>
                        <input type="date" id="prog-date-end" class="prog-input">
                    </div>
                    <button class="prog-btn-secondary" onclick="window.resetProgFilters()">✕ Effacer</button>
                </div>

                <!-- SHEETS TABS -->
                <div style="margin-top:16px;">
                    <div style="font-size:0.65rem; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px; letter-spacing:0.8px;">
                        Feuilles du Classeur
                    </div>
                    <div id="prog-sheets-bar" style="display:flex; gap:6px; flex-wrap:wrap;"></div>
                </div>
            </div>

            <!-- RESULTS AREA -->
            <div id="prog-results-area"></div>
        `;
    }

    function setupEventListeners() {
        const zone = document.getElementById('prog-upload-zone');
        const fileInput = document.getElementById('prog-file-input');

        if (zone) {
            zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
            zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.classList.remove('dragover');
                if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
            });
            zone.addEventListener('click', () => fileInput && fileInput.click());
        }

        if (fileInput) {
            fileInput.addEventListener('change', e => {
                if (e.target.files[0]) handleFile(e.target.files[0]);
                e.target.value = '';
            });
        }

        const nameInput = document.getElementById('prog-search-name');
        if (nameInput) nameInput.addEventListener('input', () => renderResults());

        const dateStart = document.getElementById('prog-date-start');
        const dateEnd = document.getElementById('prog-date-end');
        if (dateStart) dateStart.addEventListener('change', () => { progPeriodFilter = 'custom'; updateChipsUI(); renderResults(); });
        if (dateEnd) dateEnd.addEventListener('change', () => { progPeriodFilter = 'custom'; updateChipsUI(); renderResults(); });
    }

    // Feuilles techniques ou de calcul à ignorer (ce ne sont pas des lignes de fabrication)
    const IGNORED_SHEET_NAMES = [
        'SYNTHESE PAR LIGNE', 'CADENCE V ORIGINAL', 'CADENCE V', 'CADENCE', '% OEE',
        'ECART CADENCE COND', 'TOTAL', 'RECAP', 'PARAMETRES', 'PARAM', 'SYNTHESE'
    ];

    function isNonProduct(desig) {
        if (!desig) return true;
        const s = desig.toUpperCase();
        if (s.includes('CLEAN-UP') || s.includes('CLEANUP') || s.includes('CHANGE-OVER') || s.includes('CHANGEOVER')) return true;
        if (s.includes('NETTOYAGE') || s.includes('MAINTENANCE') || s.includes('ATTENTE') || s.includes('ARRET') || s.includes('ARRÊT')) return true;
        if (s.includes('VIDE DE LIGNE') || s.includes('C/O MC') || s.includes('MAJEUR')) return true;
        if (s.startsWith('ESSAI ') || s === 'ESSAI') return true;
        return false;
    }

    function normalizeDate(val) {
        if (!val) return '';
        if (val instanceof Date && !isNaN(val.getTime())) {
            const y = val.getFullYear();
            const m = String(val.getMonth() + 1).padStart(2, '0');
            const d = String(val.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        if (typeof val === 'number') {
            if (val > 30000 && val < 60000) {
                const date = new Date(Math.round((val - 25569) * 86400 * 1000));
                const y = date.getUTCFullYear();
                const m = String(date.getUTCMonth() + 1).padStart(2, '0');
                const d = String(date.getUTCDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            }
            return '';
        }
        const str = String(val).trim();
        // YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);

        // D/M/YYYY or DD/MM/YYYY (avec heure optionnelle)
        const m4 = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
        if (m4) {
            return `${m4[3]}-${m4[2].padStart(2, '0')}-${m4[1].padStart(2, '0')}`;
        }

        // D/M/YY or DD/MM/YY (ex: "30/9/26 23:22" ou "1/10/26")
        const m2 = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})(?:\s|$)/);
        if (m2) {
            let year = parseInt(m2[3], 10);
            year = year < 50 ? 2000 + year : 1900 + year;
            return `${year}-${m2[2].padStart(2, '0')}-${m2[1].padStart(2, '0')}`;
        }

        try {
            const d = new Date(str);
            if (!isNaN(d.getTime()) && d.getFullYear() > 2000 && d.getFullYear() < 2100) {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
            }
        } catch(e) {}
        return '';
    }

    // --- EXCEL PARSING ---
    function handleFile(file) {
        if (!file) return;
        progFileName = file.name;
        progImportDate = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });

                progData = [];
                const detectedSheets = [];

                workbook.SheetNames.forEach(sheetName => {
                    const upperName = sheetName.trim().toUpperCase();
                    // Ignorer les feuilles techniques, de formules ou de cadences
                    if (IGNORED_SHEET_NAMES.some(x => upperName === x || upperName.includes('CADENCE') || upperName === '% OEE')) {
                        return;
                    }

                    const ws = workbook.Sheets[sheetName];
                    if (!ws) return;

                    const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false, dateNF: 'yyyy-mm-dd' });
                    if (!rawRows || rawRows.length < 2) return;

                    // Trouver la ligne d'en-tête (cherche 'date' et 'désignation')
                    let headerRowIdx = -1;
                    const colMap = { dateDebut: null, dateFin: null, designation: null, codePf: null, lot: null, taille: null };

                    for (let r = 0; r < Math.min(10, rawRows.length); r++) {
                        const row = rawRows[r];
                        if (!Array.isArray(row)) continue;

                        let hasDate = false, hasDesig = false;
                        row.forEach((cell, idx) => {
                            const str = String(cell || '').toLowerCase().trim();
                            if (/date.*d[eé]but|^d[eé]but/.test(str)) { colMap.dateDebut = idx; hasDate = true; }
                            else if (/date.*fin|^fin/.test(str)) { colMap.dateFin = idx; hasDate = true; }
                            else if (/d[eé]signation.*pf|d[eé]signation.*produit|^d[eé]signation/.test(str)) { colMap.designation = idx; hasDesig = true; }
                            else if (/code.*pf/.test(str)) colMap.codePf = idx;
                            else if (/n°.*lot|^lot/.test(str)) colMap.lot = idx;
                            else if (/taille.*lot|quantit[eé]/.test(str)) colMap.taille = idx;
                        });

                        if (hasDate && hasDesig) {
                            headerRowIdx = r;
                            break;
                        }
                    }

                    if (headerRowIdx === -1 || colMap.designation === null) return;

                    let countInSheet = 0;
                    for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
                        const row = rawRows[r];
                        if (!row || row.length === 0) continue;

                        const rawDesig = row[colMap.designation];
                        if (!rawDesig) continue;
                        const desig = String(rawDesig).trim();
                        if (desig.length < 2) continue;
                        if (isNonProduct(desig)) continue;

                        const dateDebut = normalizeDate(colMap.dateDebut !== null ? row[colMap.dateDebut] : '');
                        const dateFin = normalizeDate(colMap.dateFin !== null ? row[colMap.dateFin] : '');
                        const lot = colMap.lot !== null ? String(row[colMap.lot] || '').trim() : '';
                        const codePf = colMap.codePf !== null ? String(row[colMap.codePf] || '').trim() : '';
                        const taille = colMap.taille !== null ? String(row[colMap.taille] || '').trim() : '';

                        progData.push({
                            sheet: sheetName.trim(),
                            designation: desig,
                            codePf: codePf,
                            lot: lot,
                            taille: taille,
                            dateDebut: dateDebut,
                            dateFin: dateFin || dateDebut,
                            rowIdx: r
                        });
                        countInSheet++;
                    }

                    if (countInSheet > 0) {
                        detectedSheets.push(sheetName.trim());
                    }
                });

                progSheets = detectedSheets;
                progActiveSheet = '__ALL__';

                saveCurrentData();
                mountView();
                if (window.showToast) window.showToast(`✅ "${progFileName}" importé : ${progData.length} lots trouvés sur ${progSheets.length} ateliers`, 'success', 4000);

            } catch(err) {
                console.error('Erreur import Excel:', err);
                if (window.showToast) window.showToast('Erreur lecture fichier : ' + err.message, 'error', 5000);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // --- PERIOD CONTROLS ---
    window.setProgPeriod = function(period, btn) {
        progPeriodFilter = period;
        const startInput = document.getElementById('prog-date-start');
        const endInput = document.getElementById('prog-date-end');

        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);

        if (period === 'all') {
            if (startInput) startInput.value = '';
            if (endInput) endInput.value = '';
        } else if (period === 'today') {
            if (startInput) startInput.value = todayStr;
            if (endInput) endInput.value = todayStr;
        } else if (period === 'week') {
            // Lundi au Dimanche
            const day = now.getDay() || 7;
            const mon = new Date(now); mon.setDate(now.getDate() - day + 1);
            const sun = new Date(now); sun.setDate(now.getDate() - day + 7);
            if (startInput) startInput.value = mon.toISOString().slice(0, 10);
            if (endInput) endInput.value = sun.toISOString().slice(0, 10);
        } else if (period === 'month') {
            const first = new Date(now.getFullYear(), now.getMonth(), 1);
            const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            if (startInput) startInput.value = first.toISOString().slice(0, 10);
            if (endInput) endInput.value = last.toISOString().slice(0, 10);
        } else if (period === 'next7') {
            const next = new Date(now); next.setDate(now.getDate() + 7);
            if (startInput) startInput.value = todayStr;
            if (endInput) endInput.value = next.toISOString().slice(0, 10);
        } else if (period === 'next15') {
            const next = new Date(now); next.setDate(now.getDate() + 15);
            if (startInput) startInput.value = todayStr;
            if (endInput) endInput.value = next.toISOString().slice(0, 10);
        } else if (period === 'next30') {
            const next = new Date(now); next.setDate(now.getDate() + 30);
            if (startInput) startInput.value = todayStr;
            if (endInput) endInput.value = next.toISOString().slice(0, 10);
        }

        updateChipsUI(btn);
        renderResults();
    };

    function updateChipsUI(activeBtn = null) {
        document.querySelectorAll('.prog-chip').forEach(c => c.classList.remove('active'));
        if (activeBtn) {
            activeBtn.classList.add('active');
        } else if (progPeriodFilter === 'all') {
            const first = document.querySelector('.prog-chip');
            if (first) first.classList.add('active');
        }
    }

    window.resetProgFilters = function() {
        const sName = document.getElementById('prog-search-name');
        const dStart = document.getElementById('prog-date-start');
        const dEnd = document.getElementById('prog-date-end');
        if (sName) sName.value = '';
        if (dStart) dStart.value = '';
        if (dEnd) dEnd.value = '';
        progActiveSheet = '__ALL__';
        window.setProgPeriod('all');
    };

    window.setProgViewMode = function(mode) {
        progViewMode = mode;
        const btnD = document.getElementById('btn-toggle-detail');
        const btnG = document.getElementById('btn-toggle-grouped');
        if (btnD) btnD.classList.toggle('active', mode === 'detail');
        if (btnG) btnG.classList.toggle('active', mode === 'grouped');
        renderResults();
    };

    // --- RENDER RESULTS ---
    function renderResults() {
        const area = document.getElementById('prog-results-area');
        if (!area) return;

        const searchName = (document.getElementById('prog-search-name')?.value || '').toUpperCase().trim();
        const dateStart = document.getElementById('prog-date-start')?.value || '';
        const dateEnd = document.getElementById('prog-date-end')?.value || '';

        // Filter items
        let filtered = progData.filter(item => {
            if (progActiveSheet !== '__ALL__' && item.sheet !== progActiveSheet) return false;
            if (searchName) {
                const desigMatch = item.designation && item.designation.toUpperCase().includes(searchName);
                const lotMatch = item.lot && item.lot.toUpperCase().includes(searchName);
                const codeMatch = item.codePf && item.codePf.toUpperCase().includes(searchName);
                if (!desigMatch && !lotMatch && !codeMatch) return false;
            }

            // Period overlap check
            if (dateStart || dateEnd) {
                const itemStart = item.dateDebut || '0000-01-01';
                const itemEnd = item.dateFin || itemStart || '9999-12-31';
                const fStart = dateStart || '0000-01-01';
                const fEnd = dateEnd || '9999-12-31';
                // Active if itemStart <= fEnd && itemEnd >= fStart
                if (itemStart > fEnd || itemEnd < fStart) return false;
            }
            return true;
        });

        // Update KPIs
        updateKPIs(filtered);
        renderSheetTabs();

        if (filtered.length === 0) {
            area.innerHTML = `
                <div style="background:#fff; border-radius:20px; padding:50px 20px; text-align:center; border:1px solid #e2e8f0;">
                    <div style="font-size:2.8rem; opacity:0.35; margin-bottom:12px;">🔍</div>
                    <div style="font-weight:800; font-size:1rem; color:#1e1b4b;">Aucun produit ne correspond aux critères</div>
                    <div style="font-size:0.75rem; color:#64748b; margin-top:4px;">Modifiez la période ou le nom recherché</div>
                </div>
            `;
            return;
        }

        // Total quantité à produire pour les éléments filtrés
        const totalFilteredQty = filtered.reduce((acc, x) => {
            const n = parseInt(String(x.taille || '').replace(/[\s,]/g, ''), 10);
            return acc + (isNaN(n) ? 0 : n);
        }, 0);

        // Action Toolbar + Synthèse spéciale quand on filtre ou cherche
        let html = '';
        if (totalFilteredQty > 0 || searchName) {
            html += `
                <div class="prog-summary-banner">
                    <div class="prog-summary-header">
                        <div class="prog-summary-title">
                            <span style="font-size:1.6rem;">${searchName ? '🎯' : '📊'}</span>
                            <div>
                                <div style="font-weight:900; font-size:1.05rem; color:#1e1b4b;">
                                    ${searchName ? `Recherche : "${searchName}"` : `Synthèse de fabrication`}
                                </div>
                                <div style="font-size:0.75rem; color:#475569; font-weight:700; margin-top:2px;">
                                    📦 ${filtered.length} lot(s) programmé(s) · 💊 ${new Set(filtered.map(x => x.designation)).size} PF distinct(s)
                                </div>
                            </div>
                        </div>
                        ${totalFilteredQty > 0 ? `
                            <div class="prog-summary-total-badge">
                                <span style="font-size:0.62rem; text-transform:uppercase; font-weight:800; color:#047857; letter-spacing:0.5px;">Quantité Totale à Produire</span>
                                <span style="font-size:1.35rem; font-weight:900; color:#047857;">${totalFilteredQty.toLocaleString('fr-FR')} <small style="font-size:0.75rem; font-weight:700;">unités</small></span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
                <div style="font-size:0.75rem; font-weight:800; color:#4f46e5; background:#eef2ff; padding:6px 14px; border-radius:50px;">
                    📊 ${filtered.length} fabrication(s) trouvée(s)
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="prog-action-btn" onclick="window.exportProgExcel()" style="color:#059669; border-color:#86efac;">📥 Exporter Excel</button>
                    <button class="prog-action-btn" onclick="window.printProgList()" style="color:#4f46e5; border-color:#818cf8;">🖨️ Imprimer Suivi MC</button>
                </div>
            </div>
        `;

        if (progViewMode === 'grouped') {
            html += renderGroupedView(filtered);
        } else {
            html += renderDetailView(filtered);
        }

        area.innerHTML = html;
    }

    function updateKPIs(items) {
        const today = new Date().toISOString().slice(0, 10);
        const uniquePF = new Set(items.map(x => x.designation)).size;
        let enCours = 0, aVenir = 0;
        let totalQty = 0;

        items.forEach(x => {
            const s = x.dateDebut || '';
            const e = x.dateFin || s;
            if (s && e) {
                if (today >= s && today <= e) enCours++;
                else if (today < s) aVenir++;
            }
            const n = parseInt(String(x.taille || '').replace(/[\s,]/g, ''), 10);
            if (!isNaN(n)) totalQty += n;
        });

        const elTot = document.getElementById('kpi-total');
        const elUniq = document.getElementById('kpi-unique-pf');
        const elQty = document.getElementById('kpi-total-qty');
        const elEnCours = document.getElementById('kpi-encours');
        const elAVenir = document.getElementById('kpi-avenir');

        if (elTot) elTot.textContent = items.length;
        if (elUniq) elUniq.textContent = uniquePF;
        if (elQty) elQty.textContent = totalQty > 0 ? totalQty.toLocaleString('fr-FR') : '—';
        if (elEnCours) elEnCours.textContent = enCours;
        if (elAVenir) elAVenir.textContent = aVenir;
    }

    function renderSheetTabs() {
        const bar = document.getElementById('prog-sheets-bar');
        if (!bar) return;
        let html = `<button class="prog-chip ${progActiveSheet === '__ALL__' ? 'active' : ''}" onclick="window.filterBySheet('__ALL__')">🗂 Toutes (${progData.length})</button>`;
        progSheets.forEach(s => {
            const count = progData.filter(x => x.sheet === s).length;
            if (count > 0) {
                html += `<button class="prog-chip ${progActiveSheet === s ? 'active' : ''}" onclick="window.filterBySheet('${s}')">📋 ${s} (${count})</button>`;
            }
        });
        bar.innerHTML = html;
    }

    window.filterBySheet = function(sheet) {
        progActiveSheet = sheet;
        renderResults();
    };

    function renderDetailView(items) {
        const today = new Date().toISOString().slice(0, 10);
        const fmtDate = d => { if (!d) return '—'; const p = d.split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d; };
        const fmtShort = d => { if (!d) return '—'; const p = d.split('-'); return p.length === 3 ? `${p[2]}/${p[1]}` : d; };
        const getStatus = (s, e) => {
            if (!s) return '<span class="prog-badge-status prog-status-termine">TERMINÉ</span>';
            if (today >= s && today <= (e||s)) return '<span class="prog-badge-status prog-status-en-cours">🟢 EN COURS</span>';
            if (today < s) return '<span class="prog-badge-status prog-status-a-venir">⏳ À VENIR</span>';
            return '<span class="prog-badge-status prog-status-termine">TERMINÉ</span>';
        };

        // DESKTOP TABLE
        let rows = items.map(item => {
            const s = item.dateDebut || '', e = item.dateFin || s;
            const qty = item.taille ? Number(item.taille).toLocaleString('fr-FR') : '—';
            return `
                <tr>
                    <td>
                        <div class="prog-pf-title" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                            <span>📦</span>
                            <span style="font-weight:700;">${item.designation}</span>
                            ${item.codePf ? `<span style="font-size:0.65rem;color:#4f46e5;background:#eef2ff;border:1px solid #c7d2fe;padding:2px 6px;border-radius:4px;font-weight:700;">${item.codePf}</span>` : ''}
                        </div>
                    </td>
                    <td>${item.lot ? `<span style="background:#f1f5f9;padding:3px 8px;border-radius:6px;font-weight:700;font-family:monospace;">${item.lot}</span>` : '—'}</td>
                    <td><span style="background:#eef2ff;color:#4338ca;padding:3px 8px;border-radius:6px;font-size:0.68rem;font-weight:800;">${item.sheet}</span></td>
                    <td style="font-weight:700;color:#0f172a;">${fmtDate(item.dateDebut)}</td>
                    <td style="font-weight:700;color:#0f172a;">${fmtDate(item.dateFin)}</td>
                    <td style="color:#047857;font-weight:800;white-space:nowrap;">${qty}</td>
                    <td>${getStatus(s, e)}</td>
                    <td>
                        <div style="display:flex;gap:5px;">
                            <button class="prog-action-btn" onclick="window.copyPF('${item.designation.replace(/'/g, "\\'")}')">📋</button>
                            <button class="prog-action-btn" onclick="window.goToPrepMC('${item.designation.replace(/'/g, "\\'")}')}" style="color:#059669;border-color:#86efac;">🧪 MC</button>
                        </div>
                    </td>
                </tr>`;
        }).join('');

        // MOBILE CARDS
        let cards = items.map(item => {
            const s = item.dateDebut || '', e = item.dateFin || s;
            const qty = item.taille ? Number(item.taille).toLocaleString('fr-FR') : null;
            const dateRange = item.dateDebut
                ? (item.dateFin && item.dateFin !== item.dateDebut ? `${fmtShort(item.dateDebut)} → ${fmtShort(item.dateFin)}` : fmtShort(item.dateDebut))
                : '—';
            const desigSafe = item.designation.replace(/'/g, "\\'");
            return `
                <div class="prog-m-card">
                    <div class="prog-m-card-header">
                        <div class="prog-m-pf-name">
                            <span style="font-size:1.4rem;line-height:1;">📦</span>
                            <div style="flex:1;min-width:0;">
                                <div class="prog-m-title">${item.designation}</div>
                                ${item.codePf ? `<span class="prog-m-code-badge">${item.codePf}</span>` : ''}
                            </div>
                        </div>
                        ${getStatus(s, e)}
                    </div>
                    <div class="prog-m-card-body">
                        <div class="prog-m-info-pill">
                            <span class="prog-m-label">🏷️ N° Lot</span>
                            <span class="prog-m-val prog-m-lot">${item.lot || '—'}</span>
                        </div>
                        <div class="prog-m-info-pill highlight-qty">
                            <span class="prog-m-label">📊 Qté à produire</span>
                            <span class="prog-m-val prog-m-qty">${qty ? qty + ' u.' : '—'}</span>
                        </div>
                        <div class="prog-m-info-pill" style="grid-column:span 2;">
                            <span class="prog-m-label">📅 Période de fabrication</span>
                            <span class="prog-m-val prog-m-dates">${dateRange}</span>
                        </div>
                        <div class="prog-m-info-pill" style="grid-column:span 2;">
                            <span class="prog-m-label">🏭 Atelier / Ligne</span>
                            <span class="prog-m-val" style="color:#4338ca;font-weight:800;">${item.sheet}</span>
                        </div>
                    </div>
                    <div class="prog-m-card-actions">
                        <button class="prog-m-btn btn-copy" onclick="window.copyPF('${desigSafe}')">📋 Copier le nom</button>
                        <button class="prog-m-btn btn-mc" onclick="window.goToPrepMC('${desigSafe}')">🧪 Préparer Milieux</button>
                    </div>
                </div>`;
        }).join('');

        return `
            <div class="prog-table-wrap">
                <table class="prog-table">
                    <thead><tr>
                        <th>📦 Produit Fini (PF)</th>
                        <th>🏷️ Lot</th>
                        <th>📋 Atelier</th>
                        <th>📅 Début</th>
                        <th>📅 Fin</th>
                        <th>📊 Quantité</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div class="prog-mobile-cards-wrap">${cards}</div>
        `;
    }

    function renderGroupedView(items) {
        const groups = {};
        items.forEach(x => {
            if (!groups[x.designation]) groups[x.designation] = [];
            groups[x.designation].push(x);
        });
        const sortedPFs = Object.keys(groups).sort();
        const today = new Date().toISOString().slice(0, 10);
        const fmtD = d => { if (!d) return '—'; const p = d.split('-'); return p.length === 3 ? `${p[2]}/${p[1]}` : d; };

        let cardHtml = sortedPFs.map(pf => {
            const list = groups[pf];
            const codePf = list.find(x => x.codePf)?.codePf || '';
            const sheets = [...new Set(list.map(x => x.sheet))].join(', ');
            const totalQty = list.reduce((acc, x) => {
                const n = parseInt(String(x.taille || '').replace(/[\s,]/g, ''), 10);
                return acc + (isNaN(n) ? 0 : n);
            }, 0);
            const totalStr = totalQty > 0 ? totalQty.toLocaleString('fr-FR') + ' u.' : '—';
            const datesD = list.filter(x => x.dateDebut).map(x => x.dateDebut).sort();
            const datesF = list.filter(x => x.dateFin).map(x => x.dateFin).sort();
            const firstD = datesD[0] ? fmtD(datesD[0]) : '—';
            const lastF = datesF[datesF.length - 1] ? fmtD(datesF[datesF.length - 1]) : '—';
            const period = firstD === lastF ? firstD : `${firstD} → ${lastF}`;
            let gStatus = 'termine';
            for (const x of list) {
                const s = x.dateDebut || '', e = x.dateFin || s;
                if (s && today >= s && today <= e) { gStatus = 'en-cours'; break; }
                if (s && today < s) gStatus = 'a-venir';
            }
            const sBadge = { 'en-cours': '🟢 EN COURS', 'a-venir': '⏳ À VENIR', 'termine': 'TERMINÉ' };
            const statusHtml = `<span class="prog-badge-status prog-status-${gStatus}">${sBadge[gStatus]}</span>`;
            const lotsHtml = list.slice(0, 15).map(x => {
                const q = x.taille ? Number(x.taille).toLocaleString('fr-FR') : null;
                return `<span class="prog-g-lot-pill"><strong>${x.lot || '?'}</strong>${q ? `<span class="lot-qty">${q}</span>` : ''}</span>`;
            }).join('') + (list.length > 15 ? `<span class="prog-g-lot-pill" style="color:#64748b;">+${list.length - 15} autres</span>` : '');
            const pfSafe = pf.replace(/'/g, "\\'");
            return `
                <div class="prog-grouped-card">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
                        <div style="flex:1;min-width:0;">
                            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                                <span style="font-size:1.15rem;">🧫</span>
                                <span style="font-size:1rem;font-weight:900;color:#1e1b4b;">${pf}</span>
                                ${codePf ? `<span style="font-size:0.65rem;color:#4f46e5;background:#eef2ff;border:1px solid #c7d2fe;padding:2px 7px;border-radius:5px;font-weight:800;">${codePf}</span>` : ''}
                                ${statusHtml}
                            </div>
                            <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;">
                                <div><div style="font-size:0.6rem;text-transform:uppercase;font-weight:800;color:#64748b;">🏭 Atelier(s)</div><div style="font-size:0.8rem;font-weight:700;color:#334155;">${sheets}</div></div>
                                <div><div style="font-size:0.6rem;text-transform:uppercase;font-weight:800;color:#64748b;">📅 Période</div><div style="font-size:0.8rem;font-weight:700;color:#334155;">${period}</div></div>
                                <div style="background:#ecfdf5;border:1.5px solid #a7f3d0;border-radius:10px;padding:4px 12px;">
                                    <div style="font-size:0.6rem;text-transform:uppercase;font-weight:800;color:#047857;">📊 Total à produire</div>
                                    <div style="font-size:1.05rem;font-weight:900;color:#047857;">${totalStr}</div>
                                </div>
                                <div><div style="font-size:0.6rem;text-transform:uppercase;font-weight:800;color:#64748b;">🔢 Nb Lots</div><div style="font-size:0.8rem;font-weight:700;color:#334155;">${list.length}</div></div>
                            </div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;flex-shrink:0;">
                            <button class="prog-action-btn" onclick="window.copyPF('${pfSafe}')">📋 Copier</button>
                            <button class="prog-action-btn" onclick="window.goToPrepMC('${pfSafe}')" style="background:#059669;color:#fff;border-color:#059669;">🧪 Préparer MC</button>
                        </div>
                    </div>
                    <div class="prog-g-lots-list">${lotsHtml}</div>
                </div>
            `;
        }).join('');
        return `<div>${cardHtml}</div>`;
    }

    // --- ACTIONS ---
    window.copyPF = function(text) {
        navigator.clipboard.writeText(text).then(() => {
            if (window.showToast) window.showToast(`📋 Copié : "${text}"`, 'success', 2000);
        });
    };

    window.goToPrepMC = function(pfName) {
        // Switch to fiches tab and search this PF
        window.switchTab('fiches');
        setTimeout(() => {
            const si = document.getElementById('searchInput');
            if (si) {
                si.value = pfName;
                si.dispatchEvent(new Event('input'));
            }
        }, 300);
    };

    window.exportProgExcel = function() {
        try {
            const searchName = (document.getElementById('prog-search-name')?.value || '').toUpperCase().trim();
            const dateStart = document.getElementById('prog-date-start')?.value || '';
            const dateEnd = document.getElementById('prog-date-end')?.value || '';

            let filtered = progData.filter(item => {
                if (progActiveSheet !== '__ALL__' && item.sheet !== progActiveSheet) return false;
                if (searchName && !item.designation.includes(searchName)) return false;
                if (dateStart || dateEnd) {
                    const s = item.dateDebut || '0000-01-01';
                    const e = item.dateFin || s || '9999-12-31';
                    if (s > (dateEnd || '9999-12-31') || e < (dateStart || '0000-01-01')) return false;
                }
                return true;
            });

            const rows = [
                ['Désignation PF', 'Lot', 'Atelier / Feuille', 'Date Début', 'Date Fin'],
                ...filtered.map(x => [x.designation, x.lot || '', x.sheet, x.dateDebut || '', x.dateFin || ''])
            ];
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, 'Programme');
            XLSX.writeFile(wb, `Programme_Production_${new Date().toISOString().slice(0, 10)}.xlsx`);
            if (window.showToast) window.showToast('Export Excel réussi !', 'success');
        } catch(e) {
            console.error(e);
        }
    };

    window.printProgList = function() {
        window.print();
    };

    // --- INTEGRATION WITH switchTab ---
    const prevSwitchTab = window.switchTab;
    window.switchTab = function(tab) {
        const progView = document.getElementById('view-programme');
        const fichesList = document.getElementById('fiches-list');
        const addBtn = document.getElementById('addBtn');
        const footer = document.querySelector('footer');

        if (tab === 'programme') {
            if (!document.getElementById('prog-container')) {
                window.mountProgrammeView();
            } else {
                renderResults();
            }
            if (progView) progView.style.display = 'flex';
            if (fichesList) fichesList.style.display = 'none';
            if (addBtn) addBtn.style.display = 'none';
            if (footer) footer.style.display = 'none';

            document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
            const at = document.getElementById('tab-programme');
            if (at) { at.classList.add('active'); at.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' }); }
            window.currentTab = 'programme';
            localStorage.setItem('microbio_last_visit_tab', 'programme');

            const si = document.getElementById('searchInput');
            if (si) si.placeholder = 'Rechercher un PF dans le programme...';
        } else {
            if (progView) progView.style.display = 'none';
            if (fichesList) fichesList.style.display = '';
            if (footer) footer.style.display = '';
            if (prevSwitchTab) prevSwitchTab(tab);
        }
    };

    initModule();
})();
