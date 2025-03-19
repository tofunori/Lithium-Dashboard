/**
 * Script de synchronisation des données entre différentes pages du dashboard
 * Ce script s'assure que les modifications effectuées dans une page sont reflétées
 * dans les autres pages ouvertes sans nécessiter de rafraîchissement.
 */

// Clé unique pour éviter les collisions avec d'autres applications
const SYNC_KEY = 'lithium_dashboard_sync';
const DATA_KEY = 'lithiumRefineries';

// Variable pour suivre la dernière mise à jour connue
let lastKnownUpdate = Date.now();
let isSyncActive = false; // Éviter les boucles infinies

// Initialisation: enregistrer l'écouteur d'événements storage
window.addEventListener('storage', function(event) {
    // Réagir uniquement aux changements de nos clés spécifiques
    if (event.key === SYNC_KEY || event.key === DATA_KEY) {
        console.log('🔄 Changement de données détecté:', event.key);
        syncData();
    }
});

// Fonction pour synchroniser les données depuis le localStorage
function syncData() {
    // Éviter les boucles de synchronisation
    if (isSyncActive) return;
    isSyncActive = true;
    
    try {
        // Charger les données à jour depuis le localStorage
        const syncData = localStorage.getItem(SYNC_KEY);
        const timestamp = syncData ? parseInt(syncData) : 0;
        
        // Si les données sont plus récentes que notre dernière mise à jour connue
        if (timestamp > lastKnownUpdate) {
            console.log('🔄 Nouvelles données disponibles, mise à jour du dashboard...');
            
            // Mettre à jour notre timestamp
            lastKnownUpdate = timestamp;
            
            // Charger les données
            const data = localStorage.getItem(DATA_KEY);
            if (data) {
                try {
                    // Mise à jour des données globales
                    window.refineries = JSON.parse(data);
                    
                    // Mettre à jour l'affichage
                    if (typeof window.updateDashboard === 'function') {
                        window.updateDashboard();
                        console.log('✅ Dashboard mis à jour avec succès!');
                    } else {
                        console.log('⚠️ La fonction updateDashboard n\'est pas disponible');
                        // Tentative de mise à jour alternative
                        triggerUpdate();
                    }
                } catch (parseError) {
                    console.error('❌ Erreur lors du parsing des données:', parseError);
                }
            }
        }
    } catch (error) {
        console.error('❌ Erreur lors de la synchronisation:', error);
    } finally {
        isSyncActive = false;
    }
}

// Fonction pour signaler une mise à jour des données
function signalDataChange() {
    try {
        // Enregistrer le timestamp de la mise à jour
        lastKnownUpdate = Date.now();
        localStorage.setItem(SYNC_KEY, lastKnownUpdate.toString());
        console.log('📢 Signal de changement de données émis:', lastKnownUpdate);
    } catch (error) {
        console.error('❌ Erreur lors de la signalisation des changements:', error);
    }
}

// Fonction pour tenter de déclencher une mise à jour par différentes méthodes
function triggerUpdate() {
    console.log('🔍 Tentative de mise à jour alternative...');
    
    // Méthode 1: Essayer d'appeler directement des fonctions connues
    const updateFunctions = [
        'updateTable', 
        'updateCountriesView', 
        'updateStats', 
        'updateMapMarkers', 
        'updateCharts',
        'updateDisplay'
    ];
    
    let updatesApplied = false;
    
    updateFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            try {
                // Obtenir les installations filtrées si la fonction est disponible
                let filtered = window.refineries;
                if (typeof window.filterRefineries === 'function') {
                    filtered = window.filterRefineries();
                }
                
                window[funcName](filtered);
                console.log(`✅ Fonction ${funcName} exécutée`);
                updatesApplied = true;
            } catch (funcError) {
                console.warn(`⚠️ Erreur lors de l'exécution de ${funcName}:`, funcError);
            }
        }
    });
    
    // Méthode 2: Si rien n'a fonctionné, déclencher un événement personnalisé
    if (!updatesApplied) {
        console.log('🔔 Déclenchement d\'un événement personnalisé de mise à jour');
        const updateEvent = new CustomEvent('dashboard_data_updated', { 
            detail: { timestamp: lastKnownUpdate } 
        });
        document.dispatchEvent(updateEvent);
    }
}

// Ne pas perturber le chargement initial des données
let initialLoadComplete = false;
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Script de synchronisation initialisé - attente du chargement initial des données');
    
    // Attendre que le chargement initial soit terminé
    setTimeout(() => {
        initialLoadComplete = true;
        console.log('📋 Chargement initial supposé terminé, synchronisation activée');
    }, 2000);
});

// Vérifier les mises à jour périodiquement (toutes les 2 secondes), mais seulement après le chargement initial
setInterval(() => {
    if (initialLoadComplete) {
        syncData();
    }
}, 2000);

// Ne pas perturber les fonctions existantes
const originalSaveData = window.saveData;
window.saveData = function() {
    // Appeler la fonction originale si elle existe
    let result;
    if (typeof originalSaveData === 'function') {
        result = originalSaveData.apply(this, arguments);
    } else {
        // Sinon, enregistrer directement les données
        localStorage.setItem(DATA_KEY, JSON.stringify(window.refineries || []));
    }
    
    // Ne pas signaler les changements pendant le chargement initial
    if (initialLoadComplete) {
        // Signaler le changement pour les autres pages
        signalDataChange();
    }
    
    return result;
};

// Écouter l'événement personnalisé
document.addEventListener('dashboard_data_updated', function(event) {
    console.log('🔔 Événement de mise à jour reçu:', event.detail);
    syncData();
});

// Exposer les fonctions de synchronisation dans l'espace global
window.syncData = syncData;
window.signalDataChange = signalDataChange;