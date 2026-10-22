// script.js - Mythic 1:1 Collector's Edition Engine & PES Diamond SVG (0-100 Scale, 77 Characters)

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('hero-grid');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const moralFilter = document.getElementById('moral-filter');
    const sortSelect = document.getElementById('sort-select');
    const factionPills = document.querySelectorAll('.filter-pill');
    const noResultsMsg = document.getElementById('no-results');
    const resultCount = document.getElementById('result-count');
    const statsSummary = document.getElementById('stats-summary');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    // Modal & Navigation
    const modal = document.getElementById('hero-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const prevHeroBtn = document.getElementById('prev-hero-btn');
    const nextHeroBtn = document.getElementById('next-hero-btn');

    // Lightbox Full 1:1 Preview
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    // Audio
    const bgMusic = document.getElementById('bg-music');
    const audioToggleBtn = document.getElementById('audio-toggle-btn');
    const audioStatusText = document.getElementById('audio-status-text');
    const eqBars = document.getElementById('eq-bars');
    const audioVolume = document.getElementById('audio-volume');

    let allHeroes = [];
    let currentFilteredHeroes = [];
    let currentHeroIndex = 0;
    let activeFaction = 'all';

    // 1. SMART AUDIO ENGINE
    if (bgMusic) {
        bgMusic.volume = parseFloat(audioVolume.value);

        function updateAudioUI(isPlaying) {
            if (isPlaying) {
                eqBars.classList.remove('paused');
                audioStatusText.textContent = 'Musik: ON';
            } else {
                eqBars.classList.add('paused');
                audioStatusText.textContent = 'Musik: OFF';
            }
        }

        function tryPlayAudio() {
            bgMusic.play().then(() => {
                updateAudioUI(true);
                removeUnlockListeners();
            }).catch(() => {
                updateAudioUI(false);
            });
        }

        function removeUnlockListeners() {
            document.removeEventListener('click', tryPlayAudio);
            document.removeEventListener('keydown', tryPlayAudio);
        }

        tryPlayAudio();
        document.addEventListener('click', tryPlayAudio);
        document.addEventListener('keydown', tryPlayAudio);

        audioToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (bgMusic.paused) {
                bgMusic.play().then(() => updateAudioUI(true)).catch(() => {});
            } else {
                bgMusic.pause();
                updateAudioUI(false);
            }
        });

        audioVolume.addEventListener('input', (e) => {
            bgMusic.volume = parseFloat(e.target.value);
        });
    }

    // 2. LOAD DATA JSON (assets/heroes.json atau heroes.json)
    fetch('assets/heroes.json', { cache: 'no-cache' })
        .then(res => {
            if (!res.ok) return fetch('heroes.json', { cache: 'no-cache' });
            return res;
        })
        .then(res => {
            if (!res || !res.ok) throw new Error('Gagal memuat heroes.json');
            return res.json();
        })
        .then(data => {
            allHeroes = normalizeStatsTo100(data);
            initApp();
        })
        .catch(err => {
            console.error(err);
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">⚠️</div>
                    <h3>File heroes.json Belum Terbaca</h3>
                    <p>Pastikan file <strong>heroes.json</strong> berada di dalam folder <strong>assets/heroes.json</strong> (atau sejajar dengan index.html) dan jalankan dengan <strong>Live Server</strong>.</p>
                </div>`;
        });

    function normalizeStatsTo100(data) {
        return data.map(h => {
            const to100 = (val) => (val <= 10 ? val * 10 : val);
            h.kekuatan = to100(Number(h.kekuatan) || 70);
            h.kecepatan = to100(Number(h.kecepatan) || 70);
            h.taktik = to100(Number(h.taktik) || 70);
            h.kepemimpinan = to100(Number(h.kepemimpinan) || 70);
            h.ovr = Math.round((h.kekuatan + h.kecepatan + h.taktik + h.kepemimpinan) / 4);
            h.role = h.role || 'Homeric Figure';
            h.status_pedoman = h.status_pedoman || 'Ambil Hikmahnya';
            return h;
        });
    }

    function initApp() {
        renderSummary();
        applyFilters();
    }

    // 3. KATEGORI FAKSI, POLITISI & MORAL
    function isPoliticalOrRoyal(hero) {
        const text = (hero.faksi + ' ' + hero.role + ' ' + hero.nama).toLowerCase();
        return text.includes('politik') ||
               text.includes('kerajaan') ||
               text.includes('raja') ||
               text.includes('ratu') ||
               text.includes('putri') ||
               text.includes('statesman') ||
               text.includes('diplomat') ||
               text.includes('strategist') ||
               text.includes('counselor') ||
               text.includes('seer');
    }

    function getFactionGroup(f) {
        f = f.toLowerCase();
        if (f.includes('zhovaga')) return 'Zhovaga';
        if (f.includes('olympus') || f.includes('dewa')) return 'Olympus';
        if (f.includes('politik') || f.includes('kerajaan')) return 'Politik';
        if (f.includes('legenda')) return 'Legenda';
        if (f.includes('danakai')) return 'Danakai';
        if (f.includes('amazonia')) return 'Amazonia';
        if (f.includes('mitos') || f.includes('monster')) return 'Mitos';
        return 'Troya';
    }

    function getFactionTheme(f) {
        const g = getFactionGroup(f);
        if (g === 'Zhovaga') return { badge: 'badge-zhovaga', hex: '#facc15' };
        if (g === 'Olympus') return { badge: 'badge-olympus', hex: '#fbbf24' };
        if (g === 'Politik') return { badge: 'badge-politik', hex: '#f472b6' };
        if (g === 'Legenda') return { badge: 'badge-legenda', hex: '#f59e0b' };
        if (g === 'Danakai') return { badge: 'badge-danakai', hex: '#38bdf8' };
        if (g === 'Amazonia') return { badge: 'badge-amazonia', hex: '#4ade80' };
        if (g === 'Mitos') return { badge: 'badge-mitos', hex: '#c084fc' };
        return { badge: 'badge-troya', hex: '#f87171' };
    }

    function getMoral(hero) {
        const p = (hero.status_pedoman + ' ' + hero.pedoman).toLowerCase();
        if (p.includes('jangan')) return { cat: 'Jangan', cls: 'moral-bad', text: '⚠️ ' + (hero.status_pedoman || 'Jangan Ditiru') };
        if (p.includes('teladan') || p.includes('layak')) return { cat: 'Teladan', cls: 'moral-good', text: '⭐ ' + (hero.status_pedoman || 'Teladan Utama') };
        if (p.includes('tragis')) return { cat: 'Hikmah', cls: 'moral-bad', text: '🥀 ' + (hero.status_pedoman || 'Kisah Tragis') };
        return { cat: 'Hikmah', cls: 'moral-neutral', text: '⚖️ ' + (hero.status_pedoman || 'Ambil Hikmahnya') };
    }

    function getOvrClass(ovr) {
        if (ovr >= 92) return 'ovr-tier-god';
        if (ovr >= 85) return 'ovr-tier-legend';
        if (ovr >= 78) return 'ovr-tier-epic';
        return 'ovr-tier-rare';
    }

    function renderSummary() {
        const tot = allHeroes.length;
        const poli = allHeroes.filter(h => isPoliticalOrRoyal(h) || getFactionGroup(h.faksi) === 'Olympus').length;
        const tel = allHeroes.filter(h => getMoral(h).cat === 'Teladan').length;
        statsSummary.innerHTML = `
            <span class="summary-chip"><strong style="color:#f5d77f">${tot}</strong> Total Karakter (1:1 Utuh)</span>
            <span class="summary-chip"><strong style="color:#f9a8d4">${poli}</strong> Dewa, Raja & Politisi</span>
            <span class="summary-chip"><strong style="color:#86efac">${tel}</strong> Tokoh Teladan</span>
        `;
    }

    // 4. RENDER GRID KARTU (1:1 UTUH TANPA POTONG KEPALA)
    function renderGrid(arr) {
        currentFilteredHeroes = arr;
        grid.innerHTML = '';
        resultCount.textContent = `Menampilkan ${arr.length} dari ${allHeroes.length} karakter`;
        if (arr.length === 0) {
            noResultsMsg.classList.remove('hidden');
            return;
        }
        noResultsMsg.classList.add('hidden');

        const frag = document.createDocumentFragment();
        arr.forEach((h, index) => {
            const card = document.createElement('article');
            card.className = 'hero-card';
            const theme = getFactionTheme(h.faksi);
            const moral = getMoral(h);
            const oClass = getOvrClass(h.ovr);

            card.innerHTML = `
                <div class="card-img-frame">
                    <div class="card-img-box">
                        <div class="img-placeholder">🖼️<br>assets/${h.image}</div>
                        <img src="assets/${h.image}" alt="${h.nama}" loading="lazy"
                             onerror="if(!this.dataset.tried){this.dataset.tried='1';this.src='img/${h.image}';}else{this.style.opacity='0';}">
                        <div class="card-gradient-bottom"></div>
                        <div class="ovr-badge ${oClass} card-ovr-pos">
                            <span class="ovr-label">OVR</span>
                            <span class="ovr-num">${h.ovr}</span>
                        </div>
                        <div class="card-role-pos">✨ ${h.role}</div>
                    </div>
                </div>
                <div class="card-body">
                    <div>
                        <div class="card-tags-row">
                            <span class="faction-tag ${theme.badge}">${h.faksi}</span>
                            <span class="moral-pill-inline ${moral.cls}">${moral.text}</span>
                        </div>
                        <h2 class="card-title">${h.nama}</h2>
                    </div>
                    <div class="stat-mini-grid">
                        <div class="stat-mini-box"><span class="stat-mini-lbl">STR</span><span class="stat-mini-val ${h.kekuatan >= 88 ? 'val-high-str' : ''}">${h.kekuatan}</span></div>
                        <div class="stat-mini-box"><span class="stat-mini-lbl">SPD</span><span class="stat-mini-val ${h.kecepatan >= 88 ? 'val-high-spd' : ''}">${h.kecepatan}</span></div>
                        <div class="stat-mini-box"><span class="stat-mini-lbl">TAC</span><span class="stat-mini-val ${h.taktik >= 88 ? 'val-high-tac' : ''}">${h.taktik}</span></div>
                        <div class="stat-mini-box"><span class="stat-mini-lbl">CHA</span><span class="stat-mini-val ${h.kepemimpinan >= 88 ? 'val-high-cha' : ''}">${h.kepemimpinan}</span></div>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => openHeroModal(index));
            frag.appendChild(card);
        });
        grid.appendChild(frag);
    }

    // 5. PES DIAMOND RADAR SVG (Skala 0–100)
    function createDiamondSVG(h, theme) {
        const center = 150;
        const mr = 94;
        const gT = (v) => [center, center - (v / 100) * mr];
        const gR = (v) => [center + (v / 100) * mr, center];
        const gB = (v) => [center, center + (v / 100) * mr];
        const gL = (v) => [center - (v / 100) * mr, center];

        const grids = [20, 40, 60, 80, 100].map(lvl => {
            const out = lvl === 100;
            return `<polygon points="${gT(lvl)} ${gR(lvl)} ${gB(lvl)} ${gL(lvl)}"
                        fill="${out ? 'rgba(255,255,255,0.02)' : 'none'}"
                        stroke="${out ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.12)'}"
                        stroke-width="${out ? '1.5' : '1'}"
                        ${lvl === 60 ? 'stroke-dasharray="3,3"' : ''} />`;
        }).join('');

        const ptStr = gT(h.kekuatan);
        const ptSpd = gR(h.kecepatan);
        const ptTac = gB(h.taktik);
        const ptCha = gL(h.kepemimpinan);
        const pts = `${ptStr} ${ptSpd} ${ptTac} ${ptCha}`;

        return `
            <svg viewBox="0 0 300 300" class="pes-svg">
                <defs>
                    <radialGradient id="pesGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#f5d77f" stop-opacity="0.65"/>
                        <stop offset="100%" stop-color="${theme.hex}" stop-opacity="0.35"/>
                    </radialGradient>
                </defs>
                ${grids}
                <line x1="${center}" y1="${center - mr}" x2="${center}" y2="${center + mr}" stroke="rgba(255,255,255,0.18)"/>
                <line x1="${center - mr}" y1="${center}" x2="${center + mr}" y2="${center}" stroke="rgba(255,255,255,0.18)"/>
                <circle cx="${center}" cy="${center}" r="2.5" fill="rgba(255,255,255,0.4)"/>
                <polygon class="pes-polygon" points="${pts}" fill="url(#pesGrad)" stroke="#f5d77f" stroke-width="2.5" stroke-linejoin="round" />
                <circle cx="${ptStr[0]}" cy="${ptStr[1]}" r="5" fill="#fff" stroke="#d4af37" stroke-width="2.5"/>
                <circle cx="${ptSpd[0]}" cy="${ptSpd[1]}" r="5" fill="#fff" stroke="#d4af37" stroke-width="2.5"/>
                <circle cx="${ptTac[0]}" cy="${ptTac[1]}" r="5" fill="#fff" stroke="#d4af37" stroke-width="2.5"/>
                <circle cx="${ptCha[0]}" cy="${ptCha[1]}" r="5" fill="#fff" stroke="#d4af37" stroke-width="2.5"/>
                <text x="${center}" y="22" text-anchor="middle" fill="#d4af37" font-size="11" font-weight="800">KEKUATAN</text>
                <text x="${center}" y="40" text-anchor="middle" fill="#fff" font-size="14" font-weight="800">${h.kekuatan}/100</text>
                <text x="${center + mr + 8}" y="${center - 5}" text-anchor="start" fill="#d4af37" font-size="10.5" font-weight="800">KECEPATAN</text>
                <text x="${center + mr + 8}" y="${center + 12}" text-anchor="start" fill="#fff" font-size="14" font-weight="800">${h.kecepatan}/100</text>
                <text x="${center}" y="${center + mr + 20}" text-anchor="middle" fill="#d4af37" font-size="11" font-weight="800">TAKTIK</text>
                <text x="${center}" y="${center + mr + 37}" text-anchor="middle" fill="#fff" font-size="14" font-weight="800">${h.taktik}/100</text>
                <text x="${center - mr - 8}" y="${center - 5}" text-anchor="end" fill="#d4af37" font-size="10.5" font-weight="800">KHARISMA</text>
                <text x="${center - mr - 8}" y="${center + 12}" text-anchor="end" fill="#fff" font-size="14" font-weight="800">${h.kepemimpinan}/100</text>
            </svg>
        `;
    }

    // 6. MODAL CODEX 3-KOLOM (GAMBAR 1:1 UTUH TIDAK TERTUTUP TEKS)
    function openHeroModal(index) {
        if (!currentFilteredHeroes.length) return;
        currentHeroIndex = (index + currentFilteredHeroes.length) % currentFilteredHeroes.length;
        const h = currentFilteredHeroes[currentHeroIndex];

        const t = getFactionTheme(h.faksi);
        const m = getMoral(h);
        const oc = getOvrClass(h.ovr);
        const svg = createDiamondSVG(h, t);
        const abs = (h.kemampuan_spesial || []).map(s => `<li>▸ ${s}</li>`).join('');

        modalBody.innerHTML = `
            <div class="modal-codex-header">
                <div class="modal-ambient-bg" style="background-image: url('assets/${h.image}');"></div>
                <div class="modal-codex-grid">
                    
                    <!-- Kolom 1: Bingkai Potret 1:1 Utuh -->
                    <div class="modal-portrait-pedestal">
                        <div class="modal-portrait-frame" id="modal-zoom-trigger" title="Klik untuk melihat gambar 1:1 penuh">
                            <div class="img-placeholder">🖼️ assets/${h.image}</div>
                            <img id="modal-main-img" src="assets/${h.image}" alt="${h.nama}"
                                 onerror="if(!this.dataset.tried){this.dataset.tried='1';this.src='img/${h.image}';}else{this.style.opacity='0';}">
                        </div>
                        <span class="zoom-hint">🔍 Klik potret untuk layar penuh 1:1</span>
                    </div>

                    <!-- Kolom 2: Identitas & Statistik Bar (Tanpa Menutupi Gambar) -->
                    <div class="modal-identity-col">
                        <div class="modal-badges-row">
                            <span class="faction-tag ${t.badge}">${h.faksi}</span>
                            <span class="moral-pill-inline ${m.cls}">${m.text}</span>
                        </div>
                        <div class="modal-title-row">
                            <div class="ovr-badge ${oc}">
                                <span class="ovr-label">OVR</span>
                                <span class="ovr-num">${h.ovr}</span>
                            </div>
                            <div>
                                <h2 class="modal-hero-name">${h.nama}</h2>
                                <p class="modal-hero-role">✨ ${h.role}</p>
                            </div>
                        </div>
                        <div class="meta-pills">
                            <span class="meta-pill">⏳ Umur / Era: <strong>${h.umur || '?'}</strong></span>
                            <span class="meta-pill">📏 Tinggi: <strong>${h.tinggi || '?'}</strong></span>
                            <span class="meta-pill">📊 Rumus OVR: <strong>(${h.kekuatan}+${h.kecepatan}+${h.taktik}+${h.kepemimpinan}) ÷ 4 = ${h.ovr}</strong></span>
                        </div>

                        <div class="modal-stat-bars">
                            <div class="m-stat-item">
                                <div class="m-stat-head"><span>⚔️ Kekuatan (STR)</span><span style="color:#fb7185">${h.kekuatan}/100</span></div>
                                <div class="m-stat-track"><div class="m-stat-fill" style="width:${h.kekuatan}%;background:#fb7185"></div></div>
                            </div>
                            <div class="m-stat-item">
                                <div class="m-stat-head"><span>⚡ Kecepatan (SPD)</span><span style="color:#fbbf24">${h.kecepatan}/100</span></div>
                                <div class="m-stat-track"><div class="m-stat-fill" style="width:${h.kecepatan}%;background:#fbbf24"></div></div>
                            </div>
                            <div class="m-stat-item">
                                <div class="m-stat-head"><span>🧠 Taktik (TAC)</span><span style="color:#38bdf8">${h.taktik}/100</span></div>
                                <div class="m-stat-track"><div class="m-stat-fill" style="width:${h.taktik}%;background:#38bdf8"></div></div>
                            </div>
                            <div class="m-stat-item">
                                <div class="m-stat-head"><span>👑 Kharisma (CHA)</span><span style="color:#34d399">${h.kepemimpinan}/100</span></div>
                                <div class="m-stat-track"><div class="m-stat-fill" style="width:${h.kepemimpinan}%;background:#34d399"></div></div>
                            </div>
                        </div>
                    </div>

                    <!-- Kolom 3: PES Ability Diamond Radar -->
                    <div class="modal-radar-box">
                        <span class="radar-heading">PES Ability Diamond</span>
                        <span class="radar-sub">Skala Murni 0 – 100</span>
                        ${svg}
                    </div>
                </div>
            </div>

            <div class="modal-details">
                <div class="detail-col">
                    <div>
                        <h3 class="sec-title">📜 Latar Belakang Sejarah / Mitos</h3>
                        <p class="sec-text">${h.latar_belakang}</p>
                    </div>
                    <div>
                        <h3 class="sec-title">⚡ Keunggulan Spesifik</h3>
                        <ul class="skill-list">${abs}</ul>
                    </div>
                    <div class="box-weakness">
                        <h4>🛡️ Titik Kelemahan Fatal</h4>
                        <p class="sec-text">${h.kelemahan}</p>
                    </div>
                </div>
                <div class="detail-col">
                    <div>
                        <h3 class="sec-title">💎 Fakta Unik</h3>
                        <p class="sec-text">${h.fakta_unik}</p>
                    </div>
                    <div>
                        <h3 class="sec-title">🏛️ Akhir Takdir</h3>
                        <div class="box-fate">"${h.akhir_kisah}"</div>
                    </div>
                    <div class="box-moral">
                        <h4>🧭 Pesan Moral & Pedoman Kehidupan</h4>
                        <p class="sec-text">${h.pedoman}</p>
                    </div>
                </div>
            </div>
        `;

        // Klik bingkai potret untuk membuka gambar 1:1 ukuran penuh (Lightbox)
        const zoomTrigger = document.getElementById('modal-zoom-trigger');
        const mainImg = document.getElementById('modal-main-img');
        if (zoomTrigger && mainImg) {
            zoomTrigger.addEventListener('click', () => {
                lightboxImg.src = mainImg.src;
                lightbox.classList.remove('hidden');
            });
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    prevHeroBtn.addEventListener('click', () => openHeroModal(currentHeroIndex - 1));
    nextHeroBtn.addEventListener('click', () => openHeroModal(currentHeroIndex + 1));

    lightbox.addEventListener('click', () => {
        lightbox.classList.add('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    });
    modal.addEventListener('click', e => { if (e.target === modal) closeModalBtn.click(); });
    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('hidden')) {
            if (e.key === 'Escape') lightbox.classList.add('hidden');
            return;
        }
        if (!modal.classList.contains('hidden')) {
            if (e.key === 'Escape') closeModalBtn.click();
            if (e.key === 'ArrowLeft') openHeroModal(currentHeroIndex - 1);
            if (e.key === 'ArrowRight') openHeroModal(currentHeroIndex + 1);
        }
    });

    // 7. FILTER & SORTING
    function applyFilters() {
        const q = searchInput.value.trim().toLowerCase();
        const mv = moralFilter.value;
        const sm = sortSelect.value;
        clearSearchBtn.classList.toggle('hidden', q.length === 0);

        let arr = allHeroes.filter(h => {
            const ms = !q ||
                h.nama.toLowerCase().includes(q) ||
                h.faksi.toLowerCase().includes(q) ||
                (h.role && h.role.toLowerCase().includes(query));

            let mf = true;
            if (activeFaction === 'Politik') {
                mf = isPoliticalOrRoyal(h);
            } else if (activeFaction !== 'all') {
                mf = getFactionGroup(h.faksi) === activeFaction;
            }

            const mm = mv === 'all' || getMoral(h).cat === mv;
            return ms && mf && mm;
        });

        if (sm === 'ovr-desc') arr.sort((a, b) => b.ovr - a.ovr);
        else if (sm === 'kekuatan-desc') arr.sort((a, b) => b.kekuatan - a.kekuatan || b.ovr - a.ovr);
        else if (sm === 'kecepatan-desc') arr.sort((a, b) => b.kecepatan - a.kecepatan || b.ovr - a.ovr);
        else if (sm === 'taktik-desc') arr.sort((a, b) => b.taktik - a.taktik || b.ovr - a.ovr);
        else if (sm === 'kepemimpinan-desc') arr.sort((a, b) => b.kepemimpinan - a.kepemimpinan || b.ovr - a.ovr);
        else if (sm === 'nama-asc') arr.sort((a, b) => a.nama.localeCompare(b.nama));

        renderGrid(arr);
    }

    let st;
    searchInput.addEventListener('input', () => {
        clearTimeout(st);
        st = setTimeout(applyFilters, 80);
    });
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        applyFilters();
    });
    moralFilter.addEventListener('change', applyFilters);
    sortSelect.addEventListener('change', applyFilters);

    factionPills.forEach(p => {
        p.addEventListener('click', () => {
            factionPills.forEach(x => x.classList.remove('active'));
            p.classList.add('active');
            activeFaction = p.dataset.faction;
            applyFilters();
        });
    });

    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        moralFilter.value = 'all';
        sortSelect.value = 'default';
        factionPills.forEach(x => x.classList.remove('active'));
        factionPills[0].classList.add('active');
        activeFaction = 'all';
        applyFilters();
    });
});