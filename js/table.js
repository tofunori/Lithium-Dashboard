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
            
            let statusClass = '';
            if (refinery.status === 'Opérationnel') statusClass = 'status-operational';
            else if (refinery.status === 'En construction') statusClass = 'status-construction';
            else if (refinery.status === 'En suspens') statusClass = 'status-suspended';
            else statusClass = 'status-planned';
            
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

// Fonction pour mettre à jour le tableau
function updateTable(filteredRefineries) {
    const tableBody = document.getElementById('refineries-table-body');
    tableBody.innerHTML = '';
    
    filteredRefineries.forEach(refinery => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                ${refinery.website !== 'N/A' 
                    ? `<a href="${refinery.website}" target="_blank" style="color: var(--primary-color); text-decoration: none;">${refinery.name}</a>` 
                    : refinery.name}
            </td>
            <td>${refinery.location}</td>
            <td>
                <span style="display: inline-block; padding: 2px 8px; border-radius: 10px; background-color: ${STATUS_COLORS[refinery.status]}20; color: ${STATUS_COLORS[refinery.status]};">
                    ${refinery.status}
                </span>
            </td>
            <td>${refinery.production}</td>
            <td>${refinery.processing}</td>
            <td>
                <button class="edit-row-btn" data-id="${refinery.id}" style="background: none; border: none; color: var(--primary-color); cursor: pointer; margin-right: 10px;">Modifier</button>
                <button class="delete-row-btn" data-id="${refinery.id}" style="background: none; border: none; color: #f44336; cursor: pointer;">Supprimer</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Ajouter des gestionnaires d'événements pour les boutons
    document.querySelectorAll('.edit-row-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const refinery = refineries.find(r => r.id === id);
            openEditModal(refinery);
        });
    });
    
    document.querySelectorAll('.delete-row-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const refinery = refineries.find(r => r.id === id);
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${refinery.name}?`)) {
                deleteRefinery(id);
            }
        });
    });
}

// Mettre à jour les statistiques
function updateStats(filteredRefineries) {
    const totalRefineries = document.getElementById('total-refineries');
    const operationalRefineries = document.getElementById('operational-refineries');
    const constructionRefineries = document.getElementById('construction-refineries');
    const totalCapacity = document.getElementById('total-capacity');
    
    totalRefineries.textContent = filteredRefineries.length;
    operationalRefineries.textContent = filteredRefineries.filter(r => r.status === 'Opérationnel').length;
    constructionRefineries.textContent = filteredRefineries.filter(r => r.status === 'En construction').length;
    
    // Calculer la capacité totale
    let capacity = 0;
    filteredRefineries.forEach(refinery => {
        if (refinery.production !== 'N/A' && refinery.production !== 'Variable') {
            capacity += parseInt(refinery.production.replace(/,/g, '')) || 0;
        }
    });
    
    totalCapacity.textContent = capacity.toLocaleString();
}