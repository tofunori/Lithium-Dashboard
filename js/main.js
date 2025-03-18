// Modal et formulaire
const modal = document.getElementById('refinery-modal');
const modalClose = document.querySelector('.modal-close');
const cancelButton = document.getElementById('cancel-button');
const refineryForm = document.getElementById('refinery-form');

// Filtres et boutons
const countryFilter = document.getElementById('country-filter');
const statusFilter = document.getElementById('status-filter');
const capacityFilter = document.getElementById('capacity-filter');
const capacityValue = document.getElementById('capacity-value');
const exportJsonBtn = document.getElementById('export-json-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Fonction pour ouvrir le modal d'ajout
function openAddModal() {
    document.getElementById('modal-title').textContent = 'Ajouter une installation';
    document.getElementById('refinery-id').value = '';
    document.getElementById('refinery-name').value = '';
    document.getElementById('refinery-location').value = '';
    document.getElementById('refinery-country').value = 'Canada';
    document.getElementById('refinery-coordinates').value = '';
    document.getElementById('refinery-status').value = 'Planifié';
    document.getElementById('refinery-production').value = '';
    document.getElementById('refinery-processing').value = '';
    document.getElementById('refinery-notes').value = '';
    document.getElementById('refinery-website').value = '';
    
    modal.style.display = 'block';
}

// Fonction pour ouvrir le modal de modification
function openEditModal(refinery) {
    document.getElementById('modal-title').textContent = 'Modifier une installation';
    document.getElementById('refinery-id').value = refinery.id;
    document.getElementById('refinery-name').value = refinery.name;
    document.getElementById('refinery-location').value = refinery.location;
    document.getElementById('refinery-country').value = refinery.country;
    document.getElementById('refinery-coordinates').value = `${refinery.coordinates[0]}, ${refinery.coordinates[1]}`;
    document.getElementById('refinery-status').value = refinery.status;
    document.getElementById('refinery-production').value = refinery.production;
    document.getElementById('refinery-processing').value = refinery.processing;
    document.getElementById('refinery-notes').value = refinery.notes;
    document.getElementById('refinery-website').value = refinery.website;
    
    modal.style.display = 'block';
}

// Fonction pour fermer le modal
function closeModal() {
    modal.style.display = 'none';
}

// Fonction pour sauvegarder les données d'une installation
function saveRefinery(e) {
    e.preventDefault();
    
    const id = document.getElementById('refinery-id').value;
    const name = document.getElementById('refinery-name').value;
    const location = document.getElementById('refinery-location').value;
    const country = document.getElementById('refinery-country').value;
    const coordinatesStr = document.getElementById('refinery-coordinates').value;
    const status = document.getElementById('refinery-status').value;
    const production = document.getElementById('refinery-production').value || 'N/A';
    const processing = document.getElementById('refinery-processing').value || 'N/A';
    const notes = document.getElementById('refinery-notes').value;
    const website = document.getElementById('refinery-website').value || 'N/A';
    
    // Traiter les coordonnées
    let coordinates = [40, -100]; // Coordonnées par défaut
    if (coordinatesStr) {
        const parts = coordinatesStr.split(',').map(part => parseFloat(part.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            coordinates = [parts[0], parts[1]]; // Format [latitude, longitude]
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
    }
    
    // Sauvegarder les données
    saveData();
    
    // Fermer le modal et mettre à jour l'affichage
    closeModal();
    updateDashboard();
}

// Fonction pour supprimer une installation
function deleteRefinery(id) {
    refineries = refineries.filter(r => r.id !== id);
    
    // Sauvegarder les données
    saveData();
    
    // Mettre à jour l'affichage
    updateDashboard();
    
    // Fermer les détails si ouverts
    document.getElementById('refinery-details').style.display = 'none';
}

// Fonction pour mettre à jour tout le dashboard
function updateDashboard() {
    console.log("Mise à jour du dashboard en cours...");
    
    try {
        const filteredRefineries = filterRefineries();
        
        if (typeof updateMapMarkers === 'function') {
            updateMapMarkers(filteredRefineries);
        }
        
        if (typeof updateCountriesView === 'function') {
            updateCountriesView(filteredRefineries);
        }
        
        if (typeof updateTable === 'function') {
            updateTable(filteredRefineries);
        }
        
        if (typeof updateStats === 'function') {
            updateStats(filteredRefineries);
        }
        
        if (typeof updateCharts === 'function') {
            updateCharts(filteredRefineries);
        }
        
        console.log("Dashboard mis à jour avec succès.");
    } catch (e) {
        console.error("Erreur lors de la mise à jour du dashboard:", e);
    }
}

// Exposer updateDashboard dans l'espace global
window.updateDashboard = updateDashboard;

// Fonction pour basculer le thème sombre/clair
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    
    // Mettre à jour le bouton
    if (document.body.classList.contains('dark-mode')) {
        themeToggleBtn.textContent = '☀️ Mode clair';
    } else {
        themeToggleBtn.textContent = '🌙 Mode sombre';
    }
    
    // Mettre à jour les couleurs des graphiques
    updateChartThemes();
    
    // Mettre à jour la vue pays (couleurs différentes en mode sombre)
    updateCountriesView(filterRefineries());
}

// Fonction pour vérifier et appliquer le thème au chargement
function applyTheme() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = '☀️ Mode clair';
    } else {
        themeToggleBtn.textContent = '🌙 Mode sombre';
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    // Charger les données
    await loadData();
    
    // Mettre à jour les statistiques globales immédiatement
    if (typeof updateGlobalStats === 'function') {
        updateGlobalStats();
    }
    
    // Appliquer le thème
    applyTheme();
    
    // Initialiser la carte
    if (typeof initMap === 'function') {
        initMap();
    }
    
    // Initialiser les graphiques
    if (typeof initCharts === 'function') {
        initCharts();
    }
    
    // Appliquer les filtres de l'URL
    applyUrlFilters();
    
    // Mettre à jour le dashboard
    updateDashboard();
    
    // Mettre à jour l'affichage de la valeur du filtre de capacité
    if (capacityValue && capacityFilter) {
        capacityValue.textContent = capacityFilter.value;
    }
    
    // Gestionnaires d'événements
    if (countryFilter) {
        countryFilter.addEventListener('change', updateDashboard);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', updateDashboard);
    }
    
    if (capacityFilter && capacityValue) {
        capacityFilter.addEventListener('input', () => {
            capacityValue.textContent = capacityFilter.value;
            updateDashboard();
        });
    }
    
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', exportJSON);
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleDarkMode);
    }
    
    // Écouter les événements de mise à jour des données
    document.addEventListener('lithium_data_updated', function() {
        console.log("Événement de mise à jour reçu dans main.js");
        updateDashboard();
    });
    
    // Fermer le modal si on clique en dehors
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Permettre d'importer un fichier JSON par glisser-déposer
    window.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    
    window.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const newData = JSON.parse(event.target.result);
                        if (Array.isArray(newData)) {
                            refineries = newData;
                            saveData();
                            updateDashboard();
                            alert('Données importées avec succès!');
                        }
                    } catch (e) {
                        alert('Erreur lors de l\'importation du fichier: ' + e.message);
                    }
                };
                reader.readAsText(file);
            } else {
                alert('Veuillez déposer un fichier JSON.');
            }
        }
    });
});