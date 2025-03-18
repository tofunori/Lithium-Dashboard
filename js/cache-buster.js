// Script pour forcer l'effacement du cache local
(function() {
    // Version unique - changez cette valeur à chaque mise à jour des données
    const CURRENT_VERSION = '2025-03-18-v2';
    
    // Vérifier la version stockée
    const storedVersion = localStorage.getItem('dashboardVersion');
    
    // Si la version est différente ou inexistante, effacer tout le localStorage
    if (storedVersion !== CURRENT_VERSION) {
        console.log('Mise à jour détectée : effacement du cache local');
        
        // Sauvegarder les éléments à conserver (si nécessaire)
        // const savedSettings = localStorage.getItem('userSettings');
        
        // Effacer tout le localStorage
        localStorage.clear();
        
        // Restaurer la nouvelle version
        localStorage.setItem('dashboardVersion', CURRENT_VERSION);
        
        // Restaurer les éléments sauvegardés (si nécessaire)
        // if (savedSettings) localStorage.setItem('userSettings', savedSettings);
        
        // Rafraîchir la page pour appliquer les changements
        if (storedVersion) {
            console.log('Rechargement de la page pour appliquer les nouvelles données...');
            window.location.reload(true);
        }
    }
})();
