/**
 * Script de synchronisation spécifique à l'administration
 * Facilite la communication entre l'interface admin et le dashboard
 */

// Événement personnalisé pour notifier les changements
const SYNC_EVENT = 'lithium_admin_data_changed';

// Fonction pour signaler un changement de données
function syncChangesToDashboard() {
    console.log('📣 Synchronisation des données admin vers dashboard...');
    
    try {
        // 1. S'assurer que les données sont à jour dans localStorage
        if (window.refineries && Array.isArray(window.refineries)) {
            localStorage.setItem('lithiumRefineries', JSON.stringify(window.refineries));
            localStorage.setItem('lastDataUpdateTimestamp', Date.now().toString());
            
            console.log('✅ Données sauvegardées dans localStorage');
            
            // 2. Utiliser le mécanisme de BroadcastChannel si disponible
            if (typeof BroadcastChannel !== 'undefined') {
                const bc = new BroadcastChannel('lithium_dashboard_updates');
                bc.postMessage({ 
                    type: 'data_updated', 
                    timestamp: Date.now(),
                    source: 'admin'
                });
                console.log('📡 Notification envoyée via BroadcastChannel');
            }
            
            // 3. Utiliser localStorage comme mécanisme de secours
            const syncSignal = {
                type: 'data_updated',
                timestamp: Date.now(),
                source: 'admin'
            };
            localStorage.setItem('lithium_update_signal', JSON.stringify(syncSignal));
            
            // 4. Déclencher un événement personnalisé dans cette page
            document.dispatchEvent(new CustomEvent(SYNC_EVENT, { 
                detail: { 
                    timestamp: Date.now(),
                    source: 'admin'
                } 
            }));
            
            console.log('🔄 Synchronisation complète!');
            return true;
        } else {
            console.warn('⚠️ Aucune donnée à synchroniser!');
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur lors de la synchronisation:', error);
        return false;
    }
}

// Fonction pour vérifier si les données ont été modifiées dans d'autres onglets
function checkForExternalChanges() {
    try {
        const lastUpdateTimestamp = localStorage.getItem('lastDataUpdateTimestamp');
        if (!lastUpdateTimestamp) return;
        
        const timestamp = parseInt(lastUpdateTimestamp);
        const localData = localStorage.getItem('lithiumRefineries');
        
        if (localData && window.refineries) {
            const localRefineries = JSON.parse(localData);
            
            // Si le nombre d'installations est différent, les données ont changé
            if (localRefineries.length !== window.refineries.length) {
                console.log('🔄 Changement détecté: nombre d\'installations différent');
                refreshDataFromStorage();
                return;
            }
            
            // Vérifier si les ID sont les mêmes
            const localIds = new Set(localRefineries.map(r => r.id));
            const currentIds = new Set(window.refineries.map(r => r.id));
            
            if (localIds.size !== currentIds.size) {
                console.log('🔄 Changement détecté: IDs différents');
                refreshDataFromStorage();
                return;
            }
            
            // Vérifier si des champs importants ont changé
            for (const localRefinery of localRefineries) {
                const currentRefinery = window.refineries.find(r => r.id === localRefinery.id);
                if (!currentRefinery) {
                    console.log(`🔄 Changement détecté: installation ${localRefinery.id} n'existe plus`);
                    refreshDataFromStorage();
                    return;
                }
                
                // Vérifier les champs critiques
                if (localRefinery.status !== currentRefinery.status ||
                    localRefinery.name !== currentRefinery.name ||
                    localRefinery.production !== currentRefinery.production) {
                    console.log(`🔄 Changement détecté: données de l'installation ${localRefinery.id} modifiées`);
                    refreshDataFromStorage();
                    return;
                }
            }
        }
    } catch (error) {
        console.error('❌ Erreur lors de la vérification des changements:', error);
    }
}

// Fonction pour rafraîchir les données depuis localStorage
function refreshDataFromStorage() {
    try {
        const localData = localStorage.getItem('lithiumRefineries');
        if (localData) {
            window.refineries = JSON.parse(localData);
            
            // Mettre à jour l'affichage
            if (typeof window.displayRefineryTable === 'function') {
                window.displayRefineryTable();
                console.log('✅ Tableau mis à jour avec les données externes');
            }
        }
    } catch (error) {
        console.error('❌ Erreur lors du rafraîchissement des données:', error);
    }
}

// Écouteurs d'événements pour les changements
window.addEventListener('storage', function(event) {
    if (event.key === 'lithium_update_signal' || event.key === 'lithiumRefineries' || event.key === 'lastDataUpdateTimestamp') {
        console.log('🔄 Événement de stockage détecté:', event.key);
        checkForExternalChanges();
    }
});

// Écouteur pour les notifications BroadcastChannel
if (typeof BroadcastChannel !== 'undefined') {
    const bc = new BroadcastChannel('lithium_dashboard_updates');
    bc.onmessage = function(event) {
        if (event.data && event.data.type === 'data_updated' && event.data.source !== 'admin') {
            console.log('🔄 Message BroadcastChannel reçu:', event.data);
            checkForExternalChanges();
        }
    };
}

// Attacher notre fonction de synchronisation à la fonction saveRefineryChanges existante
if (typeof window.saveRefineryChanges === 'function') {
    const originalSaveRefineryChanges = window.saveRefineryChanges;
    window.saveRefineryChanges = function() {
        // Appeler la fonction originale
        const result = originalSaveRefineryChanges.apply(this, arguments);
        
        // Puis synchroniser
        syncChangesToDashboard();
        
        return result;
    };
    console.log('🔄 Fonction saveRefineryChanges enrichie avec synchronisation');
}

// Attacher notre fonction de synchronisation à la fonction confirmDelete existante
if (typeof window.confirmDelete === 'function') {
    const originalConfirmDelete = window.confirmDelete;
    window.confirmDelete = function() {
        // Appeler la fonction originale
        const result = originalConfirmDelete.apply(this, arguments);
        
        // Puis synchroniser
        syncChangesToDashboard();
        
        return result;
    };
    console.log('🔄 Fonction confirmDelete enrichie avec synchronisation');
}

// Vérifier les changements périodiquement
setInterval(checkForExternalChanges, 5000);

// Exposer les fonctions globalement
window.syncChangesToDashboard = syncChangesToDashboard;
window.refreshDataFromStorage = refreshDataFromStorage;

// Indiquer que le script est chargé
console.log('🚀 Script de synchronisation admin chargé');

// Synchroniser immédiatement si des données sont disponibles
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (window.refineries && Array.isArray(window.refineries)) {
            syncChangesToDashboard();
        }
    }, 1000);
});