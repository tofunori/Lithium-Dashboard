// Variables globales pour la gestion du tri
let currentSortColumn = null;
let currentSortDirection = 'asc';

// Fonction pour mettre à jour la visualisation par pays
function updateCountriesView(filteredRefineries) {
    const countriesContainer = document.querySelector('.countries-container');
    countriesContainer.innerHTML = '';
    
    // Regrouper les installations par pays
    const countries = [...new Set(refineries.map(r => r.country))];
    
    // Couleurs de fond pour les pays
    const countryColors = {
        'Canada': '#e6f2ff',
        'États-Unis': '#ffece6',
        'Mexique': '#e6ffed'
    };
    
    // Mode sombre pour les couleurs
    if (document.body.classList.contains('dark-mode')) {
        countryColors['Canada'] = '#1e3a8a'; // Bleu foncé
        countryColors['États-Unis'] = '#7f1d1d'; // Rouge foncé
        countryColors['Mexique'] = '#064e3b'; // Vert foncé
    }
    
    countries.forEach(country => {
        const countryRefineries = filteredRefineries.filter(r => r.country === country);
        
        // Ne pas afficher le pays s'il n'a pas d'installations après filtrage
        if (countryRefineries.length === 0) return;
        
        const countryCard = document.createElement('div');
        countryCard.className = 'country-card';
        countryCard.style.backgroundColor = countryColors[country];
        
        countryCard.innerHTML = `<h3>${country}</h3>`;
        
        countryRefineries.forEach(refinery => {
            const refineryItem = document.createElement('div');
            refineryItem.className = 'refinery-item';
            refineryItem.setAttribute('data-id', refinery.id);
            
            // Corriger l'attribution des classes de statut pour inclure "En pause"
            let statusClass = '';
            if (refinery.status === 'Opérationnel') {
                statusClass = 'status-operational';
            } else if (refinery.status === 'En construction') {
                statusClass = 'status-construction';
            } else if (refinery.status === 'En suspens' || refinery.status === 'En pause') {
                statusClass = 'status-suspended';
            } else {
                statusClass = 'status-planned';
            }
            
            refineryItem.innerHTML = `
                <div class="status-dot ${statusClass}"></div>
                <span>${refinery.name}</span>
            `;
            
            refineryItem.addEventListener('click', () => showRefineryDetails(refinery));
            
            countryCard.appendChild(refineryItem);
        });
        
        countriesContainer.appendChild(countryCard);
    });
}

// Fonction pour afficher les détails d'une installation
function showRefineryDetails(refinery) {
    const refineryDetails = document.getElementById('refinery-details');
    refineryDetails.innerHTML = `
        <h3>
            ${refinery.name}
            <button class="close-btn">&times;</button>
        </h3>
        <div class="details-grid">
            <div>
                <p><strong>Emplacement:</strong> ${refinery.location}</p>
                <p><strong>Coordonnées:</strong> ${refinery.coordinates[0]}, ${refinery.coordinates[1]}</p>
                <p><strong>Statut:</strong> 
                    <span style="display: inline-block; padding: 2px 8px; border-radius: 10px; background-color: ${STATUS_COLORS[refinery.status]}20; color: ${STATUS_COLORS[refinery.status]};">
                        ${refinery.status}
                    </span>
                </p>
            </div>
            <div>
                <p><strong>Capacité:</strong> ${refinery.production} tpa</p>
                <p><strong>Technologie:</strong> ${refinery.processing}</p>
                <p><strong>Notes:</strong> ${refinery.notes}</p>
                ${refinery.website !== 'N/A' ? `
                <a href="${refinery.website}" target="_blank" style="color: var(--primary-color); text-decoration: none;">
                    Site web
                </a>` : ''}
            </div>
        </div>
        <div style="margin-top: 15px; text-align: right;">
            <button class="edit-btn" style="margin-right: 10px; background-color: rgba(200, 200, 200, 0.1); color: var(--text-color);">Modifier</button>
            <button class="delete-btn" style="background-color: #f44336;">Supprimer</button>
        </div>
    `;
    
    refineryDetails.style.display = 'block';
    
    // Gestionnaires d'événements
    refineryDetails.querySelector('.close-btn').addEventListener('click', () => {
        refineryDetails.style.display = 'none';
    });
    
    refineryDetails.querySelector('.edit-btn').addEventListener('click', () => {
        openEditModal(refinery);
    });
    
    refineryDetails.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${refinery.name}?`)) {
            deleteRefinery(refinery.id);
        }
    });
    
    // Centrer la carte sur l'installation
    focusOnRefinery(refinery);
}

// Fonction pour comparer les valeurs pour le tri
function compareValues(a, b, column, direction) {
    let valueA, valueB;
    
    // Extraire les valeurs en fonction de la colonne
    switch(column) {
        case 'name':
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
            break;
        case 'location':
            valueA = a.location.toLowerCase();
            valueB = b.location.toLowerCase();
            break;
        case 'country':
            valueA = a.country.toLowerCase();
            valueB = b.country.toLowerCase();
            break;
        case 'status':
            valueA = a.status.toLowerCase();
            valueB = b.status.toLowerCase();
            break;
        case 'production':
            // Gestion spéciale pour les valeurs de production
            valueA = a.production;
            valueB = b.production;
            
            // Extraire les nombres si possible
            const numA = extractNumberFromProduction(valueA);
            const numB = extractNumberFromProduction(valueB);
            
            if (numA !== null && numB !== null) {
                return direction === 'asc' ? numA - numB : numB - numA;
            }
            
            // Si on ne peut pas extraire de nombres, trier alphabétiquement
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
            break;
        case 'processing':
            valueA = a.processing.toLowerCase();
            valueB = b.processing.toLowerCase();
            break;
        case 'website':
            valueA = a.website.toLowerCase();
            valueB = b.website.toLowerCase();
            break;
        default:
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
    }
    
    // Comparer les valeurs
    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
}

// Fonction pour extraire un nombre de la valeur de production
function extractNumberFromProduction(production) {
    if (production === 'N/A' || production === 'Variable') {
        return null;
    }
    
    // Extraire les chiffres de la chaîne de production
    const match = production.match(/\d[\d\s]*[\d,\.]+/);
    if (match) {
        // Nettoyer et convertir en nombre
        const cleanNum = match[0].replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '');
        const num = parseInt(cleanNum);
        if (!isNaN(num)) {
            return num;
        }
    }
    
    return null;
}

// Fonction pour configurer les en-têtes triables du tableau
function setupSortableTableHeaders() {
    const tableHead = document.querySelector('#refineries-table thead');
    const headerRow = tableHead.querySelector('tr');
    
    // Remplacer les en-têtes actuels par des en-têtes triables
    headerRow.innerHTML = `
        <th data-sort="name" class="sortable">Nom ${currentSortColumn === 'name' ? (currentSortDirection === 'asc' ? '▲' : '▼') : ''}</th>
        <th data-sort="location" class="sortable">Emplacement ${currentSortColumn === 'location' ? (currentSortDirection === 'asc' ? '▲' : '▼') : ''}</th>
        <th data-sort="country" class="sortable">Pays ${currentSortColumn === 'country' ? (currentSortDirection === 'asc' ? '▲' : '▼') : ''}</th>
        <th data-sort="status" class="sortable">Statut ${currentSortColumn === 'status' ? (currentSortDirection === 'asc' ? '▲' : '▼') : ''}</th>
        <th data-sort="production" class="sortable">Production ${currentSortColumn === 'production' ? (currentSortDirection === 'asc' ? '▲' : '▼') : ''}</th>
        <th data-sort="processing" class="sortable">Technologie ${currentSortColumn === 'processing' ? (currentSortDirection === 'asc' ? '▲' : '▼') : ''}</th>
        <th data-sort="website" class="sortable">Site web ${currentSortColumn === 'website' ? (currentSortDirection === 'asc' ? '▲' : '▼') : ''}</th>
    `;
    
    // Ajouter des écouteurs d'événements pour le tri
    tableHead.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-sort');
            
            // Inverser la direction si on clique sur la même colonne
            if (column === currentSortColumn) {
                currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortColumn = column;
                currentSortDirection = 'asc';
            }
            
            // Mettre à jour les symboles de tri dans les en-têtes
            tableHead.querySelectorAll('th.sortable').forEach(header => {
                const headerColumn = header.getAttribute('data-sort');
                if (headerColumn === currentSortColumn) {
                    header.innerHTML = `${header.textContent.replace(/[▲▼]$/, '')} ${currentSortDirection === 'asc' ? '▲' : '▼'}`;
                } else {
                    header.innerHTML = header.textContent.replace(/[▲▼]$/, '');
                }
            });
            
            // Trier et mettre à jour le tableau
            updateDashboard();
        });
        
        // Ajouter un curseur de pointeur pour indiquer que les en-têtes sont cliquables
        th.style.cursor = 'pointer';
    });
    
    // Ajouter du style CSS pour les colonnes triables
    const style = document.getElementById('sortable-style') || document.createElement('style');
    style.id = 'sortable-style';
    style.textContent = `
        .sortable {
            position: relative;
            cursor: pointer;
            user-select: none;
        }
        .sortable:hover {
            background-color: rgba(128, 128, 128, 0.1);
        }
    `;
    if (!document.getElementById('sortable-style')) {
        document.head.appendChild(style);
    }
}

// Fonction pour mettre à jour le tableau
function updateTable(filteredRefineries) {
    const tableBody = document.querySelector('#refineries-table tbody');
    
    // Configurer les en-têtes triables si ce n'est pas déjà fait
    // Cette ligne est nécessaire car la condition dans l'ancien code pourrait ne pas toujours fonctionner
    setupSortableTableHeaders();
    
    // Vider le tableau
    tableBody.innerHTML = '';
    
    // Trier les données si nécessaire
    let sortedRefineries = [...filteredRefineries];
    if (currentSortColumn) {
        sortedRefineries.sort((a, b) => compareValues(a, b, currentSortColumn, currentSortDirection));
    }
    
    // Afficher les données triées et filtrées
    sortedRefineries.forEach(refinery => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                ${refinery.website !== 'N/A' 
                    ? `<a href="${refinery.website}" target="_blank" style="color: var(--primary-color); text-decoration: none;">${refinery.name}</a>` 
                    : refinery.name}
            </td>
            <td>${refinery.location}</td>
            <td>${refinery.country}</td>
            <td>
                <span style="display: inline-block; padding: 2px 8px; border-radius: 10px; background-color: ${STATUS_COLORS[refinery.status]}20; color: ${STATUS_COLORS[refinery.status]};">
                    ${refinery.status}
                </span>
            </td>
            <td>${refinery.production}</td>
            <td>${refinery.processing}</td>
            <td>
                ${refinery.website !== 'N/A' 
                    ? `<a href="${refinery.website}" target="_blank" style="color: var(--primary-color); text-decoration: none;">Site</a>` 
                    : '-'}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Mettre à jour les statistiques globales (avec toutes les installations)
function updateGlobalStats() {
    const totalRefineries = document.getElementById('total-refineries');
    const operationalRefineries = document.getElementById('operational-refineries');
    const constructionRefineries = document.getElementById('construction-refineries');
    const totalCapacity = document.getElementById('total-capacity');
    
    // Utiliser toutes les installations, pas seulement les filtrées
    totalRefineries.textContent = refineries.length;
    operationalRefineries.textContent = refineries.filter(r => r.status === 'Opérationnel').length;
    constructionRefineries.textContent = refineries.filter(r => r.status === 'En construction').length;
    
    // Calculer la capacité totale
    let capacity = 0;
    refineries.forEach(refinery => {
        if (refinery.production !== 'N/A' && refinery.production !== 'Variable') {
            // Extraire les chiffres de la chaîne de production
            const match = refinery.production.match(/\d[\d\s]*[\d,\.]+/);
            if (match) {
                // Nettoyer et convertir en nombre
                const cleanNum = match[0].replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '');
                const num = parseInt(cleanNum);
                if (!isNaN(num)) {
                    capacity += num;
                }
            }
        }
    });
    
    totalCapacity.textContent = capacity.toLocaleString();
}

// Mettre à jour les statistiques filtrées
function updateStats(filteredRefineries) {
    // Premièrement, mettre à jour les statistiques globales
    updateGlobalStats();
    
    // Si aucun filtre n'est activé, nous avons déjà les bonnes statistiques
    const countryFilter = document.getElementById('country-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const capacityFilter = parseInt(document.getElementById('capacity-filter').value) || 0;
    
    // Si des filtres sont actifs, mettre à jour les statistiques avec les données filtrées
    if (countryFilter !== 'all' || statusFilter !== 'all' || capacityFilter > 0) {
        const totalRefineries = document.getElementById('total-refineries');
        const operationalRefineries = document.getElementById('operational-refineries');
        const constructionRefineries = document.getElementById('construction-refineries');
        const totalCapacity = document.getElementById('total-capacity');
        
        totalRefineries.textContent = filteredRefineries.length;
        operationalRefineries.textContent = filteredRefineries.filter(r => r.status === 'Opérationnel').length;
        constructionRefineries.textContent = filteredRefineries.filter(r => r.status === 'En construction').length;
        
        // Calculer la capacité totale des installations filtrées
        let capacity = 0;
        filteredRefineries.forEach(refinery => {
            if (refinery.production !== 'N/A' && refinery.production !== 'Variable') {
                // Extraire les chiffres de la chaîne de production
                const match = refinery.production.match(/\d[\d\s]*[\d,\.]+/);
                if (match) {
                    // Nettoyer et convertir en nombre
                    const cleanNum = match[0].replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '');
                    const num = parseInt(cleanNum);
                    if (!isNaN(num)) {
                        capacity += num;
                    }
                }
            }
        });
        
        totalCapacity.textContent = capacity.toLocaleString();
    }
}