document.addEventListener('DOMContentLoaded', () => {

    /* ================================================================
       MOBILE MENU
       ================================================================ */
    const mobileMenuButton = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuButton.classList.toggle('is-active');
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuButton.classList.remove('is-active');
            });
        });
    }

    /* ================================================================
       HEADER — SCROLL EFFECT
       ================================================================ */
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }

    /* ================================================================
       SCROLL REVEAL
       ================================================================ */
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => observer.observe(el));
    }

    /* ================================================================
       BOUTIQUE — ÉTAT PARTAGÉ
       Les trois systèmes (catégorie, marque, recherche) s'appuient
       sur un seul objet `state` et un seul moteur `applyFilters()`.
       ================================================================ */
    const productCards    = document.querySelectorAll('.product-card');
    const categoryBtns   = document.querySelectorAll('.filter-btn[data-filter]');
    const brandPanels    = document.querySelectorAll('.brand-panel');
    const emptyState     = document.getElementById('empty-state');
    const resultsNum     = document.getElementById('results-num');
    const filtersDisplay = document.getElementById('active-filters-display');

// 1. On ajoute 'consommables' pour activer le menu accordéon
    const BRAND_CATEGORIES = ['laptops', 'desktops', 'accessoires', 'consommables'];

    let state = {
        category: 'all',
        brand:    'all',
        query:    ''
    };

    // 2. On ajoute les nouveaux labels pour afficher les pastilles de filtre correctement
    const LABELS = {
        category: {
            all: 'Tout voir', laptops: 'Portables',
            desktops: 'Bureaux', accessoires: 'Accessoires', consommables: 'Consommables'
        },
        brand: { 
            hp: 'HP', dell: 'Dell', lenovo: 'Lenovo',
            
            // Labels Accessoires (si vous les aviez ajoutés précédemment)
            'imprimante-scanner': 'Imprimantes & Scanners',
            'saisie-controle': 'Saisie & Contrôle',
            'affichage-multimedia': 'Affichage & Multimédia',
            'stockage-connectivite': 'Stockage & Connectivité',
            'energie-alimentation': 'Énergie & Alimentation',
            'divers': 'Divers',

            // NOUVEAUX Labels Consommables
            'impression': 'Impression',
            'papiers-supports': 'Papiers & Supports',
            'composants': 'Composants'
        }
    };
    
    /* ----------------------------------------------------------------
       Normalise : minuscules + suppression des accents
       Permet : "portable" → "portable", "portablé" → "portable"
    ---------------------------------------------------------------- */
    function norm(str) {
        return str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    /* ----------------------------------------------------------------
       applyFilters() — moteur de filtre UNIQUE
       Gère catégorie + marque + recherche en un seul passage.
    ---------------------------------------------------------------- */
    function applyFilters() {
        const q           = norm(state.query.trim());
        const searchMode  = q.length > 0;
        let   visible     = 0;

        productCards.forEach(card => {
            let show;

            if (searchMode) {
                /* ---- MODE RECHERCHE ----
                   La recherche cherche dans : titre, description, marque,
                   catégorie, et le tag de marque affiché sur la carte.
                   Les filtres catégorie/marque sont IGNORÉS en mode recherche
                   pour un résultat global sur tout le catalogue.           */
                const fields = [
                    card.querySelector('.product-title')?.textContent || '',
                    card.querySelector('.product-desc')?.textContent  || '',
                    card.querySelector('.product-cat')?.textContent   || '',
                    card.querySelector('.brand-tag')?.textContent     || '',
                    card.dataset.brand    || '',
                    card.dataset.category || ''
                ].map(norm).join(' ');

                show = fields.includes(q);
            } else {
                /* ---- MODE FILTRE (catégorie + marque) ---- */
                const catMatch   = state.category === 'all' || card.dataset.category === state.category;
                const brandMatch = state.brand    === 'all' || card.dataset.brand    === state.brand;
                show = catMatch && brandMatch;
            }

            /* Transition douce : opacity + translateY */
            if (show) {
                card.style.display = 'flex';
                requestAnimationFrame(() => {
                    card.style.opacity   = '1';
                    card.style.transform = '';
                });
                visible++;
            } else {
                card.style.opacity   = '0';
                card.style.transform = 'translateY(12px)';
                setTimeout(() => {
                    if (card.style.opacity === '0') card.style.display = 'none';
                }, 270);
            }
        });

        /* Compteur */
        if (resultsNum) resultsNum.textContent = visible;

        /* État vide */
        if (emptyState) emptyState.classList.toggle('visible', visible === 0);

        /* Chips de filtre actif */
        updateChips();
    }

    /* ----------------------------------------------------------------
       updateChips() — pastilles qui résument les filtres actifs
    ---------------------------------------------------------------- */
    function updateChips() {
        if (!filtersDisplay) return;
        filtersDisplay.innerHTML = '';

        if (state.query) {
            const chip = document.createElement('span');
            chip.className = 'filter-chip';
            chip.innerHTML = `<i class="fas fa-search" style="font-size:9px"></i>&nbsp;« ${state.query} »`;
            filtersDisplay.appendChild(chip);
            return; // en mode recherche, on n'affiche que le chip recherche
        }

        if (state.category !== 'all') {
            const chip = document.createElement('span');
            chip.className = 'filter-chip';
            chip.innerHTML = `<i class="fas fa-tag" style="font-size:9px"></i>${LABELS.category[state.category] || state.category}`;
            filtersDisplay.appendChild(chip);
        }

        if (state.brand !== 'all') {
            const chip = document.createElement('span');
            chip.className = 'filter-chip chip-brand';
            chip.innerHTML = `<i class="fas fa-building" style="font-size:9px"></i>${LABELS.brand[state.brand] || state.brand}`;
            filtersDisplay.appendChild(chip);
        }
    }

    /* ----------------------------------------------------------------
       Helpers : gestion des panneaux marque
    ---------------------------------------------------------------- */
    function openBrandPanel(category) {
        brandPanels.forEach(panel => {
            panel.classList.toggle('open', panel.id === `panel-${category}`);
        });
    }

    function closeAllPanels() {
        brandPanels.forEach(p => p.classList.remove('open'));
    }

    function resetBrandBtnsInPanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        panel.querySelectorAll('.brand-btn').forEach(b => b.classList.remove('active'));
        const allBtn = panel.querySelector('.brand-btn[data-brand="all"]');
        if (allBtn) allBtn.classList.add('active');
    }

    /* ----------------------------------------------------------------
       Réinitialise le visuel des filtres catégorie/marque
       (utile quand la recherche prend le relais)
    ---------------------------------------------------------------- */
    function resetFilterUI() {
        categoryBtns.forEach(b => b.classList.remove('active'));
        const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
        if (allBtn) allBtn.classList.add('active');
        closeAllPanels();
        state.category = 'all';
        state.brand    = 'all';
    }

    /* ================================================================
       ÉCOUTEURS — FILTRES CATÉGORIE (niveau 1)
       ================================================================ */
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            /* Si une recherche est en cours, on la vide */
            if (state.query) {
                state.query = '';
                if (searchInput)  searchInput.value = '';
                if (searchClear)  searchClear.classList.remove('visible');
                document.querySelectorAll('.search-tag').forEach(t => t.classList.remove('active'));
            }

            state.category = btn.dataset.filter;
            state.brand    = 'all';

            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (BRAND_CATEGORIES.includes(state.category)) {
                openBrandPanel(state.category);
                resetBrandBtnsInPanel(`panel-${state.category}`);
            } else {
                closeAllPanels();
            }

            applyFilters();
        });
    });

    /* ================================================================
       ÉCOUTEURS — FILTRES MARQUE (niveau 2)
       ================================================================ */
    brandPanels.forEach(panel => {
        panel.querySelectorAll('.brand-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.brand = btn.dataset.brand;
                panel.querySelectorAll('.brand-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyFilters();
            });
        });
    });

    /* ================================================================
       BARRE DE RECHERCHE
       ================================================================ */
    const searchInput = document.getElementById('product-search');
    const searchClear = document.getElementById('search-clear');
    const searchTags  = document.querySelectorAll('.search-tag');

    if (searchInput) {

        /* Saisie au clavier — recherche en temps réel */
        searchInput.addEventListener('input', () => {
            state.query = searchInput.value;

            /* Affiche / cache le bouton ✕ */
            const hasText = state.query.length > 0;
            searchClear.classList.toggle('visible', hasText);

            /* Si on commence à taper, on neutralise le filtre catégorie/marque visuellement */
            if (hasText) {
                categoryBtns.forEach(b => b.classList.remove('active'));
                closeAllPanels();
                searchTags.forEach(t => t.classList.remove('active'));
            } else {
                /* Champ vidé : on revient à "Tout voir" */
                resetFilterUI();
                const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
                if (allBtn) allBtn.classList.add('active');
            }

            applyFilters();
        });

        /* Bouton ✕ — efface et remet l'état initial */
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                state.query = '';
                searchClear.classList.remove('visible');
                searchTags.forEach(t => t.classList.remove('active'));
                resetFilterUI();
                const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
                if (allBtn) allBtn.classList.add('active');
                applyFilters();
                searchInput.focus();
            });
        }

        /* Touche Échap — même effet que le bouton ✕ */
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') searchClear.click();
        });
    }

    /* Tags de recherche rapide */
    if (searchTags.length > 0 && searchInput) {
        searchTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const query = tag.dataset.query;

                /* Toggle : si déjà actif, on efface */
                if (tag.classList.contains('active')) {
                    searchClear.click();
                    return;
                }

                /* Sinon : active ce tag, désactive les autres */
                searchTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');

                searchInput.value = query;
                state.query = query;
                searchClear.classList.add('visible');

                /* Neutralise les filtres sidebar */
                categoryBtns.forEach(b => b.classList.remove('active'));
                closeAllPanels();

                applyFilters();
            });
        });
    }

    /* ================================================================
       TRONCATURE DES DESCRIPTIONS (VOIR PLUS / VOIR MOINS)
       Exécuté AVANT applyFilters() pour lire les hauteurs réelles.
       ================================================================ */
    document.querySelectorAll('.product-desc').forEach(desc => {
        if (desc.scrollHeight > 58) {
            desc.classList.add('clamped');

            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'read-more-btn';
            toggleBtn.innerHTML = 'Voir plus <i class="fas fa-chevron-down"></i>';
            desc.parentNode.insertBefore(toggleBtn, desc.nextSibling);

            toggleBtn.addEventListener('click', () => {
                const open = !desc.classList.contains('clamped');
                desc.classList.toggle('clamped');
                toggleBtn.innerHTML = open
                    ? 'Voir plus <i class="fas fa-chevron-down"></i>'
                    : 'Voir moins <i class="fas fa-chevron-up"></i>';
            });
        }
    });

    /* ================================================================
       Initialisation des transitions sur les cartes + premier rendu
       ================================================================ */
    productCards.forEach(card => {
        card.style.transition =
            'opacity 0.25s ease, transform 0.25s ease, border-color 0.3s ease, box-shadow 0.3s ease';
    });

    applyFilters();

    /* ================================================================
       FORMULAIRE CONTACT
       ================================================================ */
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('.submit-btn');
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Message envoyé !';
            btn.style.background = 'linear-gradient(135deg,#25D366,#1da851)';
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = '';
                form.reset();
            }, 3500);
        });
    }
});
