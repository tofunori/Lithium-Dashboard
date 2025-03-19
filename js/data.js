// Variables globales pour stocker les données
let refineries = [];
let STATUS_COLORS = {};
let CHART_COLORS = [];
let lastDataUpdateTimestamp = 0;

// Fonction pour charger les données depuis le fichier JSON
async function loadData() {
    try {
        console.log('Tentative de chargement des données...');
        
        // Récupérer les données depuis le fichier JSON
        const response = await fetch('data/refineries.json');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const jsonData = await response.json();
        console.log('Données JSON chargées:', jsonData);
        
        // Stocker la version dans localStorage pour le cache-buster
        const currentVersion = localStorage.getItem('dashboardVersion');
        if (currentVersion !== jsonData.version) {
            console.log(`Nouvelle version détectée: ${jsonData.version} (actuelle: ${currentVersion})`);
            localStorage.clear();
            localStorage.setItem('dashboardVersion', jsonData.version);
        }
        
        // Vérifier si les refineries existent dans les données JSON
        if (!jsonData.refineries || !Array.isArray(jsonData.refineries)) {
            throw new Error('Format de données invalide: refineries manquants ou non valides');
        }
        
        // Charger les données
        refineries = jsonData.refineries;
        localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
        lastDataUpdateTimestamp = Date.now();
        localStorage.setItem('lastDataUpdateTimestamp', lastDataUpdateTimestamp);
        
        // Charger les couleurs pour les statuts et les graphiques
        STATUS_COLORS = jsonData.status_colors || {
            "Opérationnel": "#00AA00",
            "En construction": "#0000FF",
            "Planifié": "#FFA500",
            "Approuvé": "#FFA500",
            "En suspens": "#FF0000",
            "En pause": "#FF0000"
        };
        
        CHART_COLORS = jsonData.chart_colors || ["#4a6bff", "#ff7043", "#ffca28", "#66bb6a", "#ab47bc"];
        
        console.log('Données chargées avec succès - Nombre d\'installations:', refineries.length);
        
        // Configurer la vérification périodique des mises à jour
        setupDataSyncCheck();
        
        return true;
    } catch (e) {
        console.error('Erreur lors du chargement des données depuis le fichier JSON:', e);
        
        // En cas d'erreur, essayer de charger depuis localStorage
        const savedData = localStorage.getItem('lithiumRefineries');
        if (savedData) {
            try {
                refineries = JSON.parse(savedData);
                lastDataUpdateTimestamp = parseInt(localStorage.getItem('lastDataUpdateTimestamp') || Date.now());
                console.log('Données chargées depuis localStorage (mode hors-ligne):', refineries.length, 'installations');
                
                // Configurer la vérification périodique des mises à jour
                setupDataSyncCheck();
                
                return true;
            } catch (localError) {
                console.error('Erreur lors du chargement des données locales:', localError);
            }
        }
        
        // Si aucun localStorage disponible, essayons de charger les données de secours
        try {
            console.log('Tentative de chargement des données de secours...');
            
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
            
            STATUS_COLORS = {
                "Opérationnel": "#00AA00",
                "En construction": "#0000FF",
                "Planifié": "#FFA500",
                "Approuvé": "#FFA500",
                "En suspens": "#FF0000",
                "En pause": "#FF0000"
            };
            
            CHART_COLORS = ["#4a6bff", "#ff7043", "#ffca28", "#66bb6a", "#ab47bc"];
            
            // Sauvegarder dans localStorage
            localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
            lastDataUpdateTimestamp = Date.now();
            localStorage.setItem('lastDataUpdateTimestamp', lastDataUpdateTimestamp);
            
            console.log('Données de secours chargées:', refineries.length, 'installations');
            return true;
        } catch (backupError) {
            console.error('Échec du chargement des données de secours:', backupError);
        }
        
        // Si toutes les tentatives échouent, afficher un message d'erreur
        alert('Erreur lors du chargement des données. Veuillez rafraîchir la page ou vérifier votre connexion Internet.');
        return false;
    }
}

// Fonction pour sauvegarder les données
async function saveData() {
    localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
    
    // Mettre à jour le timestamp pour les autres pages
    lastDataUpdateTimestamp = Date.now();
    localStorage.setItem('lastDataUpdateTimestamp', lastDataUpdateTimestamp);
    
    console.log('Données sauvegardées dans localStorage avec timestamp:', lastDataUpdateTimestamp);
    
    // Diffuser un événement personnalisé pour les autres onglets/fenêtres
    try {
        // Utiliser BroadcastChannel API si disponible
        if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('lithium_dashboard_updates');
            bc.postMessage({ type: 'data_updated', timestamp: lastDataUpdateTimestamp });
        }
        // Sinon, utilisons localStorage comme mécanisme de secours
        else {
            localStorage.setItem('lithium_update_signal', JSON.stringify({
                type: 'data_updated',
                timestamp: lastDataUpdateTimestamp
            }));
        }
    } catch (e) {
        console.error('Erreur lors de la diffusion des mises à jour:', e);
    }
    
    // Mettre à jour l'affichage actuel
    if (typeof window.updateDashboard === 'function') {
        window.updateDashboard();
    }
}

// Configurer la vérification périodique des mises à jour
function setupDataSyncCheck() {
    // Vérifier toutes les 1 seconde s'il y a des mises à jour
    setInterval(checkForDataUpdates, 1000);
    
    // Configurer l'écouteur d'événements BroadcastChannel si disponible
    try {
        if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('lithium_dashboard_updates');
            bc.onmessage = (event) => {
                if (event.data && event.data.type === 'data_updated') {
                    handleDataUpdate(event.data.timestamp);
                }
            };
        }
        
        // Ajouter un écouteur d'événements de stockage comme mécanisme de secours
        window.addEventListener('storage', (event) => {
            if (event.key === 'lithium_update_signal' || event.key === 'lastDataUpdateTimestamp') {
                try {
                    const storedTimestamp = parseInt(localStorage.getItem('lastDataUpdateTimestamp') || '0');
                    if (storedTimestamp > lastDataUpdateTimestamp) {
                        handleDataUpdate(storedTimestamp);
                    }
                } catch (e) {
                    console.error('Erreur lors du traitement des événements de stockage:', e);
                }
            }
        });
    } catch (e) {
        console.error('Erreur lors de la configuration des écouteurs d\'événements:', e);
    }
}

// Traiter une mise à jour de données
function handleDataUpdate(timestamp) {
    console.log('Nouvelles données détectées! Mise à jour du dashboard...');
    
    // Charger les nouvelles données
    const savedData = localStorage.getItem('lithiumRefineries');
    if (savedData) {
        try {
            refineries = JSON.parse(savedData);
            lastDataUpdateTimestamp = timestamp;
            
            // Mettre à jour le dashboard
            if (typeof window.updateDashboard === 'function') {
                window.updateDashboard();
            } else {
                console.log('La fonction updateDashboard n\'est pas disponible. Tentative de mise à jour alternative...');
                // Tenter d'autres méthodes de mise à jour de l'interface
                if (typeof updateDisplay === 'function') {
                    updateDisplay();
                }
                // Déclencher un événement personnalisé
                const updateEvent = new CustomEvent('lithium_data_updated');
                document.dispatchEvent(updateEvent);
            }
        } catch (e) {
            console.error('Erreur lors du chargement des données mises à jour:', e);
        }
    }
}

// Vérifier s'il y a des mises à jour de données
function checkForDataUpdates() {
    try {
        // Vérifier le timestamp de la dernière mise à jour dans localStorage
        const storedTimestamp = parseInt(localStorage.getItem('lastDataUpdateTimestamp') || '0');
        
        // Si le timestamp stocké est plus récent que notre dernier timestamp connu
        if (storedTimestamp > lastDataUpdateTimestamp) {
            handleDataUpdate(storedTimestamp);
        }
    } catch (e) {
        console.error('Erreur lors de la vérification des mises à jour:', e);
    }
}

// Fonction pour filtrer les installations
function filterRefineries() {
    const country = document.getElementById('country-filter')?.value || 'all';
    const status = document.getElementById('status-filter')?.value || 'all';
    const minCapacity = parseInt(document.getElementById('capacity-filter')?.value || '0') || 0;
    
    return refineries.filter(refinery => {
        if (country !== 'all' && refinery.country !== country) {
            return false;
        }
        if (status !== 'all' && refinery.status !== status) {
            return false;
        }
        if (minCapacity > 0) {
            const capacity = refinery.production !== 'N/A' && refinery.production !== 'Variable' 
                ? parseInt(refinery.production.replace(/[^0-9]/g, '')) || 0 
                : 0;
            if (capacity < minCapacity) {
                return false;
            }
        }
        return true;
    });
}

// Fonction pour mettre à jour l'affichage
function updateDisplay() {
    const filteredRefineries = filterRefineries();
    const tbody = document.querySelector('#refineries-table tbody');
    if (tbody) {
        tbody.innerHTML = '';

        filteredRefineries.forEach(refinery => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${refinery.name}</td>
                <td>${refinery.location}</td>
                <td>${refinery.country}</td>
                <td style="color: ${STATUS_COLORS[refinery.status] || '#000000'}">${refinery.status}</td>
                <td>${refinery.production}</td>
                <td>${refinery.processing}</td>
                <td><a href="${refinery.website}" target="_blank">Site</a></td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Exporter les données en JSON
function exportJSON() {
    const dataStr = JSON.stringify(refineries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recyclage_batteries_ve.json';
    link.click();
}

// Génération d'un lien de partage avec les filtres appliqués
function generateShareLink() {
    const url = new URL(window.location.href);
    const countryFilter = document.getElementById('country-filter');
    const statusFilter = document.getElementById('status-filter');
    const capacityFilter = document.getElementById('capacity-filter');
    
    if (countryFilter) url.searchParams.set('country', countryFilter.value);
    if (statusFilter) url.searchParams.set('status', statusFilter.value);
    if (capacityFilter) url.searchParams.set('capacity', capacityFilter.value);
    
    return url.toString();
}

// Appliquer les filtres de l'URL
function applyUrlFilters() {
    const params = new URLSearchParams(window.location.search);
    
    const countryFilter = document.getElementById('country-filter');
    const statusFilter = document.getElementById('status-filter');
    const capacityFilter = document.getElementById('capacity-filter');
    const capacityValue = document.getElementById('capacity-value');
    
    if (params.has('country') && countryFilter) {
        countryFilter.value = params.get('country');
    }
    if (params.has('status') && statusFilter) {
        statusFilter.value = params.get('status');
    }
    if (params.has('capacity') && capacityFilter) {
        const capacity = params.get('capacity');
        capacityFilter.value = capacity;
        if (capacityValue) capacityValue.textContent = capacity;
    }
}

// Ajouter un écouteur d'événements personnalisé pour les mises à jour
document.addEventListener('lithium_data_updated', function() {
    console.log("Événement de mise à jour de données reçu");
    if (typeof window.updateDashboard === 'function') {
        window.updateDashboard();
    } else if (typeof updateDisplay === 'function') {
        updateDisplay();
    }
});

// Exposer updateDashboard dans l'espace global si ce n'est pas déjà fait
if (typeof window.updateDashboard === 'undefined' && typeof updateDashboard === 'function') {
    window.updateDashboard = updateDashboard;
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation de l\'application...');
    
    loadData().then((success) => {
        if (success) {
            console.log('Application initialisée avec succès');
            applyUrlFilters();
            updateDisplay();

            // Ajouter des écouteurs d'événements pour les filtres
            const countryFilter = document.getElementById('country-filter');
            const statusFilter = document.getElementById('status-filter');
            const capacityFilter = document.getElementById('capacity-filter');
            
            if (countryFilter) countryFilter.addEventListener('change', updateDisplay);
            if (statusFilter) statusFilter.addEventListener('change', updateDisplay);
            if (capacityFilter) {
                capacityFilter.addEventListener('input', () => {
                    const capacityValue = document.getElementById('capacity-value');
                    if (capacityValue) capacityValue.textContent = capacityFilter.value;
                    updateDisplay();
                });
            }
            
            // Vérifier si ces éléments existent avant d'ajouter des écouteurs
            const exportBtn = document.getElementById('export-btn');
            if (exportBtn) {
                exportBtn.addEventListener('click', exportJSON);
            }
            
            const shareBtn = document.getElementById('share-btn');
            if (shareBtn) {
                shareBtn.addEventListener('click', () => {
                    const link = generateShareLink();
                    navigator.clipboard.writeText(link).then(() => alert('Lien copié dans le presse-papiers !'));
                });
            }
        }
    });
});