// Variables globales pour stocker les données
let refineries = [];
let STATUS_COLORS = {};
let CHART_COLORS = [];
let lastDataUpdateTimestamp = 0;

// Fonction pour charger les données depuis le fichier JSON
async function loadData() {
    try {
        // Récupérer les données depuis le fichier JSON
        const response = await fetch('data/refineries.json');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        // Stocker la version dans localStorage pour le cache-buster
        const currentVersion = localStorage.getItem('dashboardVersion');
        if (currentVersion !== jsonData.version) {
            localStorage.clear();
            localStorage.setItem('dashboardVersion', jsonData.version);
        }
        
        // Charger les données dans le localStorage pour les utiliser hors-ligne
        // ou pour les modifications temporaires par l'utilisateur
        const savedData = localStorage.getItem('lithiumRefineries');
        if (savedData) {
            try {
                refineries = JSON.parse(savedData);
                // Stocker un timestamp de la dernière mise à jour connue
                lastDataUpdateTimestamp = parseInt(localStorage.getItem('lastDataUpdateTimestamp') || Date.now());
            } catch (e) {
                console.error('Erreur lors du chargement des données locales:', e);
                refineries = jsonData.refineries;
                localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
                lastDataUpdateTimestamp = Date.now();
                localStorage.setItem('lastDataUpdateTimestamp', lastDataUpdateTimestamp);
            }
        } else {
            refineries = jsonData.refineries;
            localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
            lastDataUpdateTimestamp = Date.now();
            localStorage.setItem('lastDataUpdateTimestamp', lastDataUpdateTimestamp);
        }
        
        // Charger les couleurs pour les statuts et les graphiques
        STATUS_COLORS = jsonData.status_colors;
        CHART_COLORS = jsonData.chart_colors;
        
        console.log('Données chargées avec succès depuis refineries.json');
        
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
                console.log('Données chargées depuis localStorage (mode hors-ligne)');
                
                // Configurer la vérification périodique des mises à jour
                setupDataSyncCheck();
                
                return true;
            } catch (e) {
                console.error('Erreur lors du chargement des données locales:', e);
            }
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
    const country = document.getElementById('country-filter').value;
    const status = document.getElementById('status-filter').value;
    const minCapacity = parseInt(document.getElementById('capacity-filter').value) || 0;
    
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
    url.searchParams.set('country', document.getElementById('country-filter').value);
    url.searchParams.set('status', document.getElementById('status-filter').value);
    url.searchParams.set('capacity', document.getElementById('capacity-filter').value);
    return url.toString();
}

// Appliquer les filtres de l'URL
function applyUrlFilters() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('country')) {
        document.getElementById('country-filter').value = params.get('country');
    }
    if (params.has('status')) {
        document.getElementById('status-filter').value = params.get('status');
    }
    if (params.has('capacity')) {
        const capacity = params.get('capacity');
        document.getElementById('capacity-filter').value = capacity;
        document.getElementById('capacity-value').textContent = capacity;
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
    loadData().then((success) => {
        if (success) {
            applyUrlFilters();
            updateDisplay();

            // Ajouter des écouteurs d'événements pour les filtres
            document.getElementById('country-filter').addEventListener('change', updateDisplay);
            document.getElementById('status-filter').addEventListener('change', updateDisplay);
            document.getElementById('capacity-filter').addEventListener('input', () => {
                document.getElementById('capacity-value').textContent = document.getElementById('capacity-filter').value;
                updateDisplay();
            });
            
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