// Script de synchronisation pour le dashboard
// Ce script vérifie régulièrement les mises à jour des données

// Constantes pour le stockage
const DASHBOARD_DATA_KEY = 'lithium_dashboard_data';
const FORCE_REFRESH_KEY = 'force_dashboard_refresh';
const SYNC_INTERVAL = 2000; // Vérifier toutes les 2 secondes

// Timestamp pour la dernière mise à jour
let lastCheckTimestamp = Date.now();

// Fonction principale qui vérifie les mises à jour
function checkForUpdates() {
    // Vérifier si une actualisation forcée est demandée
    const forceRefreshTimestamp = localStorage.getItem(FORCE_REFRESH_KEY);
    if (forceRefreshTimestamp && parseInt(forceRefreshTimestamp) > lastCheckTimestamp) {
        console.log('Actualisation forcée demandée par l\'administrateur');
        lastCheckTimestamp = parseInt(forceRefreshTimestamp);
        
        // Recharger les données complètement
        if (typeof window.updateDashboard === 'function') {
            window.location.reload(); // Recharger complètement la page
        }
        return;
    }
    
    // Vérifier si des nouvelles données sont disponibles
    const savedData = localStorage.getItem(DASHBOARD_DATA_KEY);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            if (data && data.version && data.version !== window.currentDataVersion) {
                console.log('Nouvelles données détectées:', data.version);
                window.currentDataVersion = data.version;
                
                // Mettre à jour le dashboard
                if (typeof window.updateDashboard === 'function') {
                    window.updateDashboard();
                } else if (typeof window.loadData === 'function') {
                    window.loadData();
                } else {
                    // En dernier recours, recharger la page
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des mises à jour:', error);
        }
    }
}

// Initialiser la vérification périodique
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du système de synchronisation...');
    
    // Vérifier immédiatement au chargement
    checkForUpdates();
    
    // Puis vérifier régulièrement
    setInterval(checkForUpdates, SYNC_INTERVAL);
    
    // Écouter les événements de stockage
    window.addEventListener('storage', function(event) {
        if (event.key === DASHBOARD_DATA_KEY || event.key === FORCE_REFRESH_KEY) {
            console.log('Changement détecté dans le stockage:', event.key);
            checkForUpdates();
        }
    });
});
