// Variables globales
let refineryData = null;
let refineries = [];
let currentId = null;

// Charger les données des installations
async function loadRefineryData() {
    try {
        const response = await fetch('data/refineries.json');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        refineryData = await response.json();
        refineries = refineryData.refineries;
        
        // Mettre à jour les informations de version
        const versionText = `Version actuelle: ${refineryData.version || 'non définie'}`;
        document.getElementById('tableVersionInfo').textContent = versionText;
        
        // Afficher le tableau des installations
        displayRefineryTable();
        
        showNotification(document.getElementById('table-notification'), 'Données chargées avec succès!', 'success');
        return true;
    } catch (error) {
        showNotification(document.getElementById('table-notification'), `Erreur lors du chargement des données: ${error.message}`, 'error');
        console.error('Erreur:', error);
        return false;
    }
}

// Afficher le tableau des installations
function displayRefineryTable() {
    // Vider le tableau
    const tableBody = document.getElementById('refineries-table-body');
    tableBody.innerHTML = '';
    
    // Filtrer les données si nécessaire
    const countryFilter = document.getElementById('filter-country').value;
    const statusFilter = document.getElementById('filter-status').value;
    const searchFilter = document.getElementById('filter-search').value.toLowerCase();
    
    const filteredData = refineries.filter(refinery => {
        // Filtre par pays
        if (countryFilter !== 'all' && refinery.country !== countryFilter) {
            return false;
        }
        
        // Filtre par statut
        if (statusFilter !== 'all' && refinery.status !== statusFilter) {
            return false;
        }
        
        // Filtre par recherche
        if (searchFilter) {
            const searchFields = [
                refinery.name,
                refinery.location,
                refinery.country,
                refinery.status,
                refinery.production,
                refinery.processing
            ].map(field => String(field).toLowerCase());
            
            return searchFields.some(field => field.includes(searchFilter));
        }
        
        return true;
    });
    
    // Afficher les données filtrées
    filteredData.forEach(refinery => {
        const row = document.createElement('tr');
        
        // Créer les cellules
        row.innerHTML = `
            <td>${refinery.id}</td>
            <td>${refinery.name}</td>
            <td>${refinery.location}</td>
            <td>${refinery.country}</td>
            <td>${refinery.status}</td>
            <td>${refinery.production}</td>
            <td>${refinery.processing}</td>
            <td class="action-buttons">
                <button onclick="editRefinery(${refinery.id})" class="edit-btn">Modifier</button>
                <button onclick="deleteRefinery(${refinery.id})" class="danger">Supprimer</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Afficher une notification
function showNotification(element, message, type) {
    element.textContent = message;
    element.className = `notification ${type}`;
    element.style.display = 'block';
    
    // Masquer la notification après 5 secondes
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Ajouter une nouvelle installation
function addNewRefinery() {
    // Ouvrir la modal en mode ajout
    document.getElementById('edit-modal-title').textContent = 'Ajouter une installation';
    document.getElementById('edit-id').value = '';
    document.getElementById('edit-name').value = '';
    document.getElementById('edit-location').value = '';
    document.getElementById('edit-country').value = 'Canada';
    document.getElementById('edit-coordinates').value = '';
    document.getElementById('edit-status').value = 'Planifié';
    document.getElementById('edit-production').value = '';
    document.getElementById('edit-processing').value = '';
    document.getElementById('edit-notes').value = '';
    document.getElementById('edit-website').value = '';
    
    document.getElementById('edit-modal').style.display = 'block';
}

// Modifier une installation existante
function editRefinery(id) {
    currentId = id;
    const refinery = refineries.find(r => r.id === id);
    
    if (!refinery) {
        showNotification(document.getElementById('table-notification'), 'Installation non trouvée', 'error');
        return;
    }
    
    // Remplir le formulaire avec les données de l'installation
    document.getElementById('edit-modal-title').textContent = 'Modifier une installation';
    document.getElementById('edit-id').value = refinery.id;
    document.getElementById('edit-name').value = refinery.name;
    document.getElementById('edit-location').value = refinery.location;
    document.getElementById('edit-country').value = refinery.country;
    document.getElementById('edit-coordinates').value = refinery.coordinates ? refinery.coordinates.join(', ') : '';
    document.getElementById('edit-status').value = refinery.status;
    document.getElementById('edit-production').value = refinery.production;
    document.getElementById('edit-processing').value = refinery.processing;
    document.getElementById('edit-notes').value = refinery.notes || '';
    document.getElementById('edit-website').value = refinery.website || '';
    
    document.getElementById('edit-modal').style.display = 'block';
}

// Demander confirmation pour supprimer une installation
function deleteRefinery(id) {
    currentId = id;
    const refinery = refineries.find(r => r.id === id);
    
    if (!refinery) {
        showNotification(document.getElementById('table-notification'), 'Installation non trouvée', 'error');
        return;
    }
    
    // Afficher le nom de l'installation dans la modal de confirmation
    document.getElementById('delete-refinery-name').textContent = refinery.name;
    document.getElementById('delete-id').value = id;
    
    // Afficher la modal de confirmation
    document.getElementById('delete-modal').style.display = 'block';
}

// Confirmer la suppression d'une installation
function confirmDelete() {
    const id = parseInt(document.getElementById('delete-id').value);
    
    // Trouver l'index de l'installation à supprimer
    const index = refineries.findIndex(r => r.id === id);
    
    if (index === -1) {
        showNotification(document.getElementById('table-notification'), 'Installation non trouvée', 'error');
        return;
    }
    
    // Supprimer l'installation
    refineries.splice(index, 1);
    
    // Mettre à jour le tableau
    displayRefineryTable();
    
    // Fermer la modal
    document.getElementById('delete-modal').style.display = 'none';
    
    showNotification(document.getElementById('table-notification'), 'Installation supprimée avec succès', 'success');
}

// Sauvegarder les modifications d'une installation
function saveRefineryChanges(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value;
    const location = document.getElementById('edit-location').value;
    const country = document.getElementById('edit-country').value;
    const coordinatesStr = document.getElementById('edit-coordinates').value;
    const status = document.getElementById('edit-status').value;
    const production = document.getElementById('edit-production').value || 'N/A';
    const processing = document.getElementById('edit-processing').value || 'N/A';
    const notes = document.getElementById('edit-notes').value;
    const website = document.getElementById('edit-website').value || '#';
    
    // Traiter les coordonnées
    let coordinates = [0, 0]; // Coordonnées par défaut
    if (coordinatesStr) {
        const parts = coordinatesStr.split(',').map(part => parseFloat(part.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            coordinates = parts;
        }
    }
    
    if (id) {
        // Modification
        const index = refineries.findIndex(r => r.id === parseInt(id));
        if (index !== -1) {
            refineries[index] = {
                ...refineries[index],
                name,
                location,
                country,
                coordinates,
                status,
                production,
                processing,
                notes,
                website
            };
            showNotification(document.getElementById('table-notification'), 'Installation modifiée avec succès', 'success');
        }
    } else {
        // Ajout
        const newId = Math.max(...refineries.map(r => r.id), 0) + 1;
        refineries.push({
            id: newId,
            name,
            location,
            country,
            coordinates,
            status,
            production,
            processing,
            notes,
            website
        });
        showNotification(document.getElementById('table-notification'), 'Installation ajoutée avec succès', 'success');
    }
    
    // Mettre à jour le tableau et fermer la modal
    displayRefineryTable();
    document.getElementById('edit-modal').style.display = 'none';
}

// Sauvegarder toutes les modifications
async function saveAllChanges() {
    if (!refineryData) {
        showNotification(document.getElementById('table-notification'), 'Aucune donnée à sauvegarder', 'error');
        return;
    }
    
    try {
        // Mettre à jour les données
        refineryData.refineries = refineries;
        
        // Convertir en JSON
        const dataStr = JSON.stringify(refineryData, null, 2);
        
        // Télécharger le fichier
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'refineries.json';
        link.click();
        
        showNotification(document.getElementById('table-notification'), 'Données sauvegardées avec succès!', 'success');
    } catch (error) {
        showNotification(document.getElementById('table-notification'), `Erreur lors de la sauvegarde: ${error.message}`, 'error');
    }
}

// Incrémenter la version
function incrementVersion() {
    if (!refineryData) {
        showNotification(document.getElementById('table-notification'), 'Aucune donnée à mettre à jour', 'error');
        return;
    }
    
    try {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        
        // Vérifier si la date est la même que celle de la version actuelle
        const currentVersion = refineryData.version || '';
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
        
        refineryData.version = newVersion;
        document.getElementById('tableVersionInfo').textContent = `Version actuelle: ${newVersion}`;
        
        showNotification(document.getElementById('table-notification'), `Version incrémentée à ${newVersion}`, 'success');
    } catch (error) {
        showNotification(document.getElementById('table-notification'), `Erreur lors de l'incrémentation de la version: ${error.message}`, 'error');
    }
}

// Exporter les données au format JSON
function exportTableData() {
    if (!refineryData) {
        showNotification(document.getElementById('table-notification'), 'Aucune donnée à exporter', 'error');
        return;
    }
    
    try {
        // Convertir en JSON
        const dataStr = JSON.stringify(refineryData, null, 2);
        
        // Télécharger le fichier
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'refineries.json';
        link.click();
        
        showNotification(document.getElementById('table-notification'), 'Données exportées avec succès!', 'success');
    } catch (error) {
        showNotification(document.getElementById('table-notification'), `Erreur lors de l'exportation: ${error.message}`, 'error');
    }
}

// Initialiser les écouteurs d'événements pour le tableau
function initTableEvents() {
    // Filtres
    document.getElementById('filter-country').addEventListener('change', displayRefineryTable);
    document.getElementById('filter-status').addEventListener('change', displayRefineryTable);
    document.getElementById('filter-search').addEventListener('input', displayRefineryTable);
    
    // Boutons d'action
    document.getElementById('add-new-btn').addEventListener('click', addNewRefinery);
    document.getElementById('refresh-table-btn').addEventListener('click', loadRefineryData);
    document.getElementById('save-all-changes-btn').addEventListener('click', saveAllChanges);
    document.getElementById('increment-version-btn').addEventListener('click', incrementVersion);
    document.getElementById('export-table-btn').addEventListener('click', exportTableData);
    
    // Modal d'édition
    document.getElementById('edit-form').addEventListener('submit', saveRefineryChanges);
    document.getElementById('edit-cancel').addEventListener('click', () => {
        document.getElementById('edit-modal').style.display = 'none';
    });
    document.getElementById('edit-modal-close').addEventListener('click', () => {
        document.getElementById('edit-modal').style.display = 'none';
    });
    
    // Modal de suppression
    document.getElementById('delete-confirm').addEventListener('click', confirmDelete);
    document.getElementById('delete-cancel').addEventListener('click', () => {
        document.getElementById('delete-modal').style.display = 'none';
    });
    
    // Fermer les modals en cliquant à l'extérieur
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('edit-modal')) {
            document.getElementById('edit-modal').style.display = 'none';
        }
        if (e.target === document.getElementById('delete-modal')) {
            document.getElementById('delete-modal').style.display = 'none';
        }
        if (e.target === document.getElementById('github-modal')) {
            document.getElementById('github-modal').style.display = 'none';
        }
    });
}

// Initialiser dès que le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    initTableEvents();
    loadRefineryData();
});