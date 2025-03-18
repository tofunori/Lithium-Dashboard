// Script pour la gestion des installations via une interface de type tableur
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentData = null;
    let installationsTable = document.getElementById('installations-table');
    let addRowBtn = document.getElementById('add-row-btn');
    let saveTableBtn = document.getElementById('save-table-btn');
    let refreshTableBtn = document.getElementById('refresh-table-btn');
    let tableNotification = document.getElementById('table-notification');
    let tableVersionInfo = document.getElementById('table-version-info');
    let incrementVersionBtn = document.getElementById('increment-version-btn');
    
    // Charger les données initiales
    loadInstallationsData();
    
    // Gestionnaires d'événements
    if (addRowBtn) addRowBtn.addEventListener('click', addNewRow);
    if (saveTableBtn) saveTableBtn.addEventListener('click', saveTableData);
    if (refreshTableBtn) refreshTableBtn.addEventListener('click', loadInstallationsData);
    if (incrementVersionBtn) incrementVersionBtn.addEventListener('click', incrementVersion);
    
    // Fonction pour charger les données
    async function loadInstallationsData() {
        try {
            const response = await fetch('data/refineries.json');
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            currentData = await response.json();
            renderTable();
            
            // Mettre à jour l'info de version
            if (tableVersionInfo) {
                tableVersionInfo.textContent = `Version actuelle: ${currentData.version || 'non définie'}`;
            }
            
            showNotification('Données chargées avec succès!', 'success');
        } catch (error) {
            showNotification(`Erreur lors du chargement des données: ${error.message}`, 'error');
            console.error('Erreur:', error);
        }
    }
    
    // Fonction pour afficher une notification
    function showNotification(message, type) {
        if (!tableNotification) return;
        
        tableNotification.textContent = message;
        tableNotification.className = `notification ${type}`;
        tableNotification.style.display = 'block';
        
        // Masquer la notification après 5 secondes
        setTimeout(() => {
            tableNotification.style.display = 'none';
        }, 5000);
    }
    
    // Fonction pour rendre le tableau
    function renderTable() {
        if (!installationsTable || !currentData || !currentData.refineries) return;
        
        // Vider le tableau existant
        installationsTable.innerHTML = '';
        
        // Créer l'en-tête du tableau
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = [
            'ID', 'Nom', 'Emplacement', 'Pays', 'Coordonnées', 
            'Statut', 'Production', 'Technologie', 'Site web', 'Notes', 'Actions'
        ];
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        installationsTable.appendChild(thead);
        
        // Créer le corps du tableau
        const tbody = document.createElement('tbody');
        
        // Trier les installations par ID
        const sortedRefineries = [...currentData.refineries].sort((a, b) => a.id - b.id);
        
        sortedRefineries.forEach(refinery => {
            const tr = createTableRow(refinery);
            tbody.appendChild(tr);
        });
        
        installationsTable.appendChild(tbody);
    }
    
    // Fonction pour créer une ligne de tableau
    function createTableRow(refinery) {
        const tr = document.createElement('tr');
        tr.dataset.id = refinery.id;
        
        // Cellule ID
        const tdId = document.createElement('td');
        tdId.textContent = refinery.id;
        tdId.className = 'read-only';
        tr.appendChild(tdId);
        
        // Cellule Nom
        const tdName = document.createElement('td');
        tdName.contentEditable = 'true';
        tdName.textContent = refinery.name || '';
        tdName.dataset.field = 'name';
        tr.appendChild(tdName);
        
        // Cellule Emplacement
        const tdLocation = document.createElement('td');
        tdLocation.contentEditable = 'true';
        tdLocation.textContent = refinery.location || '';
        tdLocation.dataset.field = 'location';
        tr.appendChild(tdLocation);
        
        // Cellule Pays
        const tdCountry = document.createElement('td');
        const countrySelect = document.createElement('select');
        countrySelect.dataset.field = 'country';
        
        ['Canada', 'États-Unis', 'Mexique'].forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            if (refinery.country === country) {
                option.selected = true;
            }
            countrySelect.appendChild(option);
        });
        
        tdCountry.appendChild(countrySelect);
        tr.appendChild(tdCountry);
        
        // Cellule Coordonnées
        const tdCoordinates = document.createElement('td');
        tdCoordinates.contentEditable = 'true';
        tdCoordinates.textContent = refinery.coordinates ? 
            `${refinery.coordinates[0]}, ${refinery.coordinates[1]}` : '';
        tdCoordinates.dataset.field = 'coordinates';
        tr.appendChild(tdCoordinates);
        
        // Cellule Statut
        const tdStatus = document.createElement('td');
        const statusSelect = document.createElement('select');
        statusSelect.dataset.field = 'status';
        
        ['Opérationnel', 'En construction', 'Planifié', 'Approuvé', 'En suspens'].forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            if (refinery.status === status) {
                option.selected = true;
            }
            statusSelect.appendChild(option);
        });
        
        tdStatus.appendChild(statusSelect);
        tr.appendChild(tdStatus);
        
        // Cellule Production
        const tdProduction = document.createElement('td');
        tdProduction.contentEditable = 'true';
        tdProduction.textContent = refinery.production || '';
        tdProduction.dataset.field = 'production';
        tr.appendChild(tdProduction);
        
        // Cellule Technologie
        const tdProcessing = document.createElement('td');
        tdProcessing.contentEditable = 'true';
        tdProcessing.textContent = refinery.processing || '';
        tdProcessing.dataset.field = 'processing';
        tr.appendChild(tdProcessing);
        
        // Cellule Site web
        const tdWebsite = document.createElement('td');
        tdWebsite.contentEditable = 'true';
        tdWebsite.textContent = refinery.website || '';
        tdWebsite.dataset.field = 'website';
        tr.appendChild(tdWebsite);
        
        // Cellule Notes
        const tdNotes = document.createElement('td');
        tdNotes.contentEditable = 'true';
        tdNotes.textContent = refinery.notes || '';
        tdNotes.dataset.field = 'notes';
        tr.appendChild(tdNotes);
        
        // Cellule Actions
        const tdActions = document.createElement('td');
        tdActions.className = 'actions';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'danger';
        deleteBtn.textContent = 'Supprimer';
        deleteBtn.addEventListener('click', function() {
            if (confirm('Êtes-vous sûr de vouloir supprimer cette installation ?')) {
                tr.remove();
            }
        });
        
        tdActions.appendChild(deleteBtn);
        tr.appendChild(tdActions);
        
        return tr;
    }
    
    // Fonction pour ajouter une nouvelle ligne
    function addNewRow() {
        if (!installationsTable) return;
        
        const tbody = installationsTable.querySelector('tbody');
        if (!tbody) return;
        
        // Calculer le prochain ID
        const maxId = Math.max(...currentData.refineries.map(r => r.id), 0);
        const newId = maxId + 1;
        
        // Créer une nouvelle installation vide
        const newRefinery = {
            id: newId,
            name: '',
            location: '',
            country: 'Canada',
            coordinates: [0, 0],
            status: 'Planifié',
            production: '',
            processing: '',
            website: '',
            notes: ''
        };
        
        // Ajouter la ligne au tableau
        const tr = createTableRow(newRefinery);
        tbody.appendChild(tr);
        
        // Mettre le focus sur le champ nom
        const nameCell = tr.querySelector('[data-field="name"]');
        if (nameCell) {
            nameCell.focus();
        }
    }
    
    // Fonction pour sauvegarder les données
    function saveTableData() {
        if (!installationsTable || !currentData) return;
        
        // Recueillir toutes les installations du tableau
        const rows = installationsTable.querySelectorAll('tbody tr');
        const updatedRefineries = [];
        
        rows.forEach(row => {
            const id = parseInt(row.dataset.id);
            
            const refinery = {
                id: id,
                name: row.querySelector('[data-field="name"]').textContent,
                location: row.querySelector('[data-field="location"]').textContent,
                country: row.querySelector('[data-field="country"]').value,
                status: row.querySelector('[data-field="status"]').value,
                production: row.querySelector('[data-field="production"]').textContent,
                processing: row.querySelector('[data-field="processing"]').textContent,
                website: row.querySelector('[data-field="website"]').textContent,
                notes: row.querySelector('[data-field="notes"]').textContent
            };
            
            // Traiter les coordonnées
            const coordinatesText = row.querySelector('[data-field="coordinates"]').textContent;
            if (coordinatesText) {
                const parts = coordinatesText.split(',').map(part => parseFloat(part.trim()));
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    refinery.coordinates = [parts[0], parts[1]];
                }
            }
            
            updatedRefineries.push(refinery);
        });
        
        // Mettre à jour les données
        currentData.refineries = updatedRefineries;
        
        // Télécharger le fichier JSON
        const dataStr = JSON.stringify(currentData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'refineries.json';
        link.click();
        
        showNotification('Données sauvegardées avec succès!', 'success');
    }
    
    // Fonction pour incrémenter la version
    function incrementVersion() {
        if (!currentData) return;
        
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        
        // Vérifier si la date est la même que celle de la version actuelle
        const currentVersion = currentData.version || '';
        let newVersion;
        
        if (currentVersion.startsWith(formattedDate)) {
            // Incrémenter la version pour la même date
            const versionParts = currentVersion.split('-v');
            const versionNumber = versionParts.length > 1 ? parseInt(versionParts[1]) || 0 : 0;
            newVersion = `${formattedDate}-v${versionNumber + 1}`;
        } else {
            // Nouvelle date, commencer à v1
            newVersion = `${formattedDate}-v1`;
        }
        
        // Mettre à jour la version
        currentData.version = newVersion;
        
        // Mettre à jour l'info de version
        if (tableVersionInfo) {
            tableVersionInfo.textContent = `Version actuelle: ${newVersion}`;
        }
        
        showNotification(`Version incrémentée à ${newVersion}`, 'success');
    }
});
