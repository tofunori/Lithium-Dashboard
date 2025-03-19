// Variables globales
let refineryData = null;
let refineries = [];
let currentId = null;

// Charger les données des installations
async function loadRefineryData() {
    try {
        console.log("Chargement des données de raffinerie...");
        
        // Essayer d'abord de charger les données depuis localStorage
        const savedData = localStorage.getItem('lithiumRefineries');
        
        if (savedData) {
            try {
                refineries = JSON.parse(savedData);
                console.log('Données chargées depuis localStorage:', refineries.length, 'installations');
                
                // Charger le fichier JSON juste pour récupérer la version et les couleurs
                const response = await fetch('data/refineries.json');
                if (response.ok) {
                    refineryData = await response.json();
                    // Vérifier si refineryData contient bien des informations
                    if (!refineryData || !refineryData.version) {
                        console.warn("refineries.json chargé mais format potentiellement invalide");
                    }
                    refineryData.refineries = refineries; // Remplacer par nos données à jour
                } else {
                    console.warn("Impossible de charger refineries.json:", response.status);
                    // Si le fichier JSON n'est pas accessible, créer un objet de données minimal
                    refineryData = {
                        version: localStorage.getItem('dashboardVersion') || 'locale',
                        refineries: refineries,
                        status_colors: STATUS_COLORS || {
                            "Opérationnel": "#00AA00",
                            "En construction": "#0000FF",
                            "Planifié": "#FFA500",
                            "Approuvé": "#FFA500",
                            "En suspens": "#FF0000",
                            "En pause": "#FF0000"
                        }
                    };
                }
                
                // Mettre à jour les informations de version
                const versionText = `Version actuelle: ${refineryData.version || 'locale'}`;
                const versionElement = document.getElementById('tableVersionInfo');
                if (versionElement) {
                    versionElement.textContent = versionText;
                }
                
                // Afficher le tableau des installations
                displayRefineryTable();
                
                showNotification(document.getElementById('table-notification'), 'Données chargées avec succès depuis localStorage!', 'success');
                return true;
            } catch (e) {
                console.error('Erreur lors du chargement des données locales:', e);
                // En cas d'erreur, on charge depuis le fichier JSON
            }
        } else {
            console.log("Aucune donnée trouvée dans localStorage");
        }
        
        // Si pas de données dans localStorage ou erreur, charger depuis le fichier JSON
        console.log("Tentative de chargement depuis refineries.json...");
        const response = await fetch('data/refineries.json');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        refineryData = await response.json();
        
        // Vérifier si les données sont valides
        if (!refineryData.refineries || !Array.isArray(refineryData.refineries)) {
            console.error("Format de données invalide dans refineries.json");
            throw new Error("Format de données invalide: refineries manquant ou non valide");
        }
        
        refineries = refineryData.refineries;
        console.log("Données JSON chargées avec succès:", refineries.length, "installations");
        
        // Sauvegarder dans localStorage pour être synchronisé avec le dashboard
        localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
        localStorage.setItem('lastDataUpdateTimestamp', Date.now().toString());
        
        // Mettre à jour les informations de version
        const versionText = `Version actuelle: ${refineryData.version || 'non définie'}`;
        const versionElement = document.getElementById('tableVersionInfo');
        if (versionElement) {
            versionElement.textContent = versionText;
        }
        
        // Afficher le tableau des installations
        displayRefineryTable();
        
        showNotification(document.getElementById('table-notification'), 'Données chargées avec succès!', 'success');
        return true;
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        
        // En cas d'échec, charger les données de secours
        try {
            console.log("Tentative de chargement des données de secours...");
            
            // Utiliser les données de secours codées en dur
            refineries = [
                {
                    "id": 1,
                    "name": "Li-Cycle",
                    "location": "Kingston, Ontario, Canada",
                    "country": "Canada",
                    "coordinates": [44.2312, -76.4860],
                    "status": "Opérationnel",
                    "production": "10 000+ tonnes de masse noire par an",
                    "processing": "Spoke & Hub Technologies - Procédé hydrométallurgique",
                    "notes": "Produit de la masse noire à partir de batteries lithium-ion usagées, hub aux États-Unis en pause.",
                    "website": "https://li-cycle.com/"
                },
                {
                    "id": 2,
                    "name": "Lithion Technologies",
                    "location": "Saint-Bruno-de-Montarville, Québec, Canada",
                    "country": "Canada",
                    "coordinates": [45.5366, -73.3718],
                    "status": "Opérationnel",
                    "production": "10 000-20 000 tonnes de batteries par an",
                    "processing": "Procédé hydrométallurgique en deux étapes",
                    "notes": "Produit de la masse noire, usine d'hydrométallurgie pour matériaux avancés prévue pour 2026.",
                    "website": "https://www.lithiontechnologies.com/"
                }
            ];
            
            refineryData = {
                version: "backup-" + new Date().toISOString().split('T')[0],
                refineries: refineries,
                status_colors: {
                    "Opérationnel": "#00AA00",
                    "En construction": "#0000FF",
                    "Planifié": "#FFA500",
                    "Approuvé": "#FFA500",
                    "En suspens": "#FF0000",
                    "En pause": "#FF0000"
                }
            };
            
            // Sauvegarder dans localStorage
            localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
            localStorage.setItem('dashboardVersion', refineryData.version);
            localStorage.setItem('lastDataUpdateTimestamp', Date.now().toString());
            
            // Mettre à jour les informations de version
            const versionText = `Version actuelle: ${refineryData.version} (données de secours)`;
            const versionElement = document.getElementById('tableVersionInfo');
            if (versionElement) {
                versionElement.textContent = versionText;
            }
            
            // Afficher le tableau des installations
            displayRefineryTable();
            
            showNotification(document.getElementById('table-notification'), 'Données de secours chargées!', 'success');
            return true;
        } catch (backupError) {
            console.error('Échec du chargement des données de secours:', backupError);
            showNotification(document.getElementById('table-notification'), `Erreur critique lors du chargement des données: ${error.message}`, 'error');
            return false;
        }
    }
}

// Afficher le tableau des installations
function displayRefineryTable() {
    console.log("Affichage du tableau des installations...");
    
    // Vider le tableau
    const tableBody = document.getElementById('refineries-table-body');
    if (!tableBody) {
        console.error("Élément 'refineries-table-body' non trouvé!");
        return;
    }
    tableBody.innerHTML = '';
    
    // Filtrer les données si nécessaire
    const countryFilter = document.getElementById('filter-country') ? document.getElementById('filter-country').value : 'all';
    const statusFilter = document.getElementById('filter-status') ? document.getElementById('filter-status').value : 'all';
    const searchFilter = document.getElementById('filter-search') ? document.getElementById('filter-search').value.toLowerCase() : '';
    
    if (!refineries || !Array.isArray(refineries) || refineries.length === 0) {
        console.error("Aucune donnée d'installation disponible ou format invalide");
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Aucune donnée disponible</td></tr>';
        return;
    }
    
    console.log(`Filtrage: pays=${countryFilter}, statut=${statusFilter}, recherche=${searchFilter}`);
    
    const filteredData = refineries.filter(refinery => {
        // Filtre par pays
        if (countryFilter !== 'all' && countryFilter !== 'Tous' && refinery.country !== countryFilter) {
            return false;
        }
        
        // Filtre par statut
        if (statusFilter !== 'all' && statusFilter !== 'Tous' && refinery.status !== statusFilter) {
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
            ].map(field => String(field || '').toLowerCase());
            
            return searchFields.some(field => field.includes(searchFilter));
        }
        
        return true;
    });
    
    console.log(`Données filtrées: ${filteredData.length} installations sur ${refineries.length}`);
    
    // Afficher les données filtrées
    if (filteredData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Aucun résultat pour ces filtres</td></tr>';
        return;
    }
    
    filteredData.forEach(refinery => {
        const row = document.createElement('tr');
        
        // S'assurer que toutes les propriétés existent
        const id = refinery.id || '';
        const name = refinery.name || '';
        const location = refinery.location || '';
        const country = refinery.country || '';
        const status = refinery.status || '';
        const production = refinery.production || 'N/A';
        const processing = refinery.processing || 'N/A';
        
        // Créer les cellules
        row.innerHTML = `
            <td>${id}</td>
            <td>${name}</td>
            <td>${location}</td>
            <td>${country}</td>
            <td>${status}</td>
            <td>${production}</td>
            <td>${processing}</td>
            <td class="action-buttons">
                <button onclick="window.editRefinery(${id})" class="edit-btn">Modifier</button>
                <button onclick="window.deleteRefinery(${id})" class="danger">Supprimer</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    console.log("Tableau affiché avec succès");
}

// Afficher une notification
function showNotification(element, message, type) {
    if (!element) {
        console.error("Élément de notification non trouvé!");
        return;
    }
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
    console.log(`Modification de l'installation ID ${id}`);
    currentId = id;
    const refinery = refineries.find(r => r.id === id);
    
    if (!refinery) {
        showNotification(document.getElementById('table-notification'), 'Installation non trouvée', 'error');
        return;
    }
    
    // Remplir le formulaire avec les données de l'installation
    document.getElementById('edit-modal-title').textContent = 'Modifier une installation';
    document.getElementById('edit-id').value = refinery.id;
    document.getElementById('edit-name').value = refinery.name || '';
    document.getElementById('edit-location').value = refinery.location || '';
    document.getElementById('edit-country').value = refinery.country || 'Canada';
    document.getElementById('edit-coordinates').value = refinery.coordinates ? refinery.coordinates.join(', ') : '';
    document.getElementById('edit-status').value = refinery.status || 'Planifié';
    document.getElementById('edit-production').value = refinery.production || '';
    document.getElementById('edit-processing').value = refinery.processing || '';
    document.getElementById('edit-notes').value = refinery.notes || '';
    document.getElementById('edit-website').value = refinery.website || '';
    
    document.getElementById('edit-modal').style.display = 'block';
}

// Demander confirmation pour supprimer une installation
function deleteRefinery(id) {
    console.log(`Demande de suppression de l'installation ID ${id}`);
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
    console.log(`Confirmation de suppression de l'installation ID ${id}`);
    
    // Trouver l'index de l'installation à supprimer
    const index = refineries.findIndex(r => r.id === id);
    
    if (index === -1) {
        showNotification(document.getElementById('table-notification'), 'Installation non trouvée', 'error');
        return;
    }
    
    // Supprimer l'installation
    refineries.splice(index, 1);
    
    // Sauvegarder dans localStorage pour synchroniser avec le dashboard
    localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
    localStorage.setItem('lastDataUpdateTimestamp', Date.now().toString());
    
    // Signaler le changement si la fonction est disponible
    if (typeof window.signalDataChange === 'function') {
        window.signalDataChange();
    }
    
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
        console.log(`Sauvegarde des modifications pour l'installation ID ${id}`);
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
        console.log('Ajout d\'une nouvelle installation');
        const newId = Math.max(0, ...refineries.map(r => r.id || 0)) + 1;
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
    
    // Sauvegarder dans localStorage pour synchroniser avec le dashboard
    localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
    localStorage.setItem('lastDataUpdateTimestamp', Date.now().toString());
    
    // Signaler le changement si la fonction est disponible
    if (typeof window.signalDataChange === 'function') {
        window.signalDataChange();
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
        console.log('Sauvegarde de toutes les modifications...');
        
        // Mettre à jour les données
        refineryData.refineries = refineries;
        
        // Sauvegarder dans localStorage pour synchroniser avec le dashboard
        localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
        localStorage.setItem('lastDataUpdateTimestamp', Date.now().toString());
        
        // Signaler le changement si la fonction est disponible
        if (typeof window.signalDataChange === 'function') {
            window.signalDataChange();
        }
        
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
        console.error('Erreur lors de la sauvegarde:', error);
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
        console.log('Incrémentation de la version...');
        
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
        
        // Mettre à jour l'affichage de la version
        const versionElement = document.getElementById('tableVersionInfo');
        if (versionElement) {
            versionElement.textContent = `Version actuelle: ${newVersion}`;
        }
        
        // Mettre à jour la version dans localStorage
        localStorage.setItem('dashboardVersion', newVersion);
        
        showNotification(document.getElementById('table-notification'), `Version incrémentée à ${newVersion}`, 'success');
    } catch (error) {
        console.error('Erreur lors de l\'incrémentation de la version:', error);
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
        console.log('Exportation des données au format JSON...');
        
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
        console.error('Erreur lors de l\'exportation:', error);
        showNotification(document.getElementById('table-notification'), `Erreur lors de l'exportation: ${error.message}`, 'error');
    }
}

// Initialiser les écouteurs d'événements pour le tableau
function initTableEvents() {
    console.log('Initialisation des écouteurs d\'événements pour le tableau...');
    
    // Filtres
    const filterCountry = document.getElementById('filter-country');
    if (filterCountry) {
        filterCountry.addEventListener('change', displayRefineryTable);
        console.log('Écouteur ajouté pour filter-country');
    }
    
    const filterStatus = document.getElementById('filter-status');
    if (filterStatus) {
        filterStatus.addEventListener('change', displayRefineryTable);
        console.log('Écouteur ajouté pour filter-status');
    }
    
    const filterSearch = document.getElementById('filter-search');
    if (filterSearch) {
        filterSearch.addEventListener('input', displayRefineryTable);
        console.log('Écouteur ajouté pour filter-search');
    }
    
    // Boutons d'action
    const addNewBtn = document.getElementById('add-new-btn');
    if (addNewBtn) {
        addNewBtn.addEventListener('click', addNewRefinery);
        console.log('Écouteur ajouté pour add-new-btn');
    }
    
    const refreshTableBtn = document.getElementById('refresh-table-btn');
    if (refreshTableBtn) {
        refreshTableBtn.addEventListener('click', loadRefineryData);
        console.log('Écouteur ajouté pour refresh-table-btn');
    }
    
    const saveAllChangesBtn = document.getElementById('save-all-changes-btn');
    if (saveAllChangesBtn) {
        saveAllChangesBtn.addEventListener('click', saveAllChanges);
        console.log('Écouteur ajouté pour save-all-changes-btn');
    }
    
    const incrementVersionBtn = document.getElementById('increment-version-btn');
    if (incrementVersionBtn) {
        incrementVersionBtn.addEventListener('click', incrementVersion);
        console.log('Écouteur ajouté pour increment-version-btn');
    }
    
    const exportTableBtn = document.getElementById('export-table-btn');
    if (exportTableBtn) {
        exportTableBtn.addEventListener('click', exportTableData);
        console.log('Écouteur ajouté pour export-table-btn');
    }
    
    // Modal d'édition
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.addEventListener('submit', saveRefineryChanges);
        console.log('Écouteur ajouté pour edit-form');
    }
    
    const editCancel = document.getElementById('edit-cancel');
    if (editCancel) {
        editCancel.addEventListener('click', () => {
            document.getElementById('edit-modal').style.display = 'none';
        });
        console.log('Écouteur ajouté pour edit-cancel');
    }
    
    const editModalClose = document.getElementById('edit-modal-close');
    if (editModalClose) {
        editModalClose.addEventListener('click', () => {
            document.getElementById('edit-modal').style.display = 'none';
        });
        console.log('Écouteur ajouté pour edit-modal-close');
    }
    
    // Modal de suppression
    const deleteConfirm = document.getElementById('delete-confirm');
    if (deleteConfirm) {
        deleteConfirm.addEventListener('click', confirmDelete);
        console.log('Écouteur ajouté pour delete-confirm');
    }
    
    const deleteCancel = document.getElementById('delete-cancel');
    if (deleteCancel) {
        deleteCancel.addEventListener('click', () => {
            document.getElementById('delete-modal').style.display = 'none';
        });
        console.log('Écouteur ajouté pour delete-cancel');
    }
    
    // Fermer les modals en cliquant à l'extérieur
    window.addEventListener('click', (e) => {
        const editModal = document.getElementById('edit-modal');
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
        
        const deleteModal = document.getElementById('delete-modal');
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
        
        const githubModal = document.getElementById('github-modal');
        if (e.target === githubModal) {
            githubModal.style.display = 'none';
        }
    });
    
    console.log('Initialisation des écouteurs d\'événements terminée');
}

// Rendre les fonctions disponibles globalement
window.editRefinery = editRefinery;
window.deleteRefinery = deleteRefinery;
window.addNewRefinery = addNewRefinery;
window.confirmDelete = confirmDelete;
window.saveRefineryChanges = saveRefineryChanges;
window.saveAllChanges = saveAllChanges;
window.incrementVersion = incrementVersion;
window.exportTableData = exportTableData;
window.loadRefineryData = loadRefineryData;
window.displayRefineryTable = displayRefineryTable;
window.showNotification = showNotification;

// Initialiser dès que le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation du tableau des installations...");
    initTableEvents();
    loadRefineryData();
});