// Script de synchronisation amélioré pour l'administration
console.log("admin-sync.js chargé - Démarrage du diagnostic");

// Fonction pour forcer le rechargement des données
function forceReloadData() {
    console.log("Tentative de forçage du rechargement des données...");
    
    // Données minimales de secours 
    const backupData = [
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
    
    // Charger directement depuis le fichier JSON
    fetch('data/refineries.json?nocache=' + Date.now())
        .then(response => response.json())
        .then(data => {
            console.log("Données récupérées avec succès:", data);
            
            if (data && data.refineries && Array.isArray(data.refineries)) {
                console.log("Format de données valide:", data.refineries.length, "installations");
                
                // Mettre à jour les données
                localStorage.setItem('lithiumRefineries', JSON.stringify(data.refineries));
                localStorage.setItem('dashboardVersion', data.version || 'force-reload-' + Date.now());
                localStorage.setItem('lastDataUpdateTimestamp', Date.now().toString());
                
                // Mettre à jour l'affichage
                window.refineries = data.refineries;
                if (typeof window.displayRefineryTable === 'function') {
                    window.displayRefineryTable();
                }
                
                // Afficher un message de succès
                showRepairMessage("Données récupérées avec succès: " + data.refineries.length + " installations");
            } else {
                throw new Error("Format de données invalide dans refineries.json");
            }
        })
        .catch(error => {
            console.error("Erreur lors du chargement du fichier JSON:", error);
            
            // Utiliser les données de secours
            console.log("Utilisation des données de secours");
            localStorage.setItem('lithiumRefineries', JSON.stringify(backupData));
            localStorage.setItem('dashboardVersion', 'backup-' + Date.now());
            localStorage.setItem('lastDataUpdateTimestamp', Date.now().toString());
            
            // Mettre à jour l'affichage
            window.refineries = backupData;
            if (typeof window.displayRefineryTable === 'function') {
                window.displayRefineryTable();
            }
            
            showRepairMessage("Données de secours chargées. Veuillez réessayer après avoir effacé le cache du navigateur.");
        });
}

// Fonction pour vérifier l'état des données du tableau
function checkTableData() {
    console.log("Vérification de l'état des données du tableau...");
    
    // Vérifier si l'élément du tableau existe
    const tableBody = document.getElementById('refineries-table-body');
    if (!tableBody) {
        console.error("Élément 'refineries-table-body' non trouvé!");
        showRepairMessage("Erreur: Élément du tableau non trouvé. Vérifiez le HTML.");
        return false;
    }
    
    // Vérifier si nous avons des données dans localStorage
    const savedData = localStorage.getItem('lithiumRefineries');
    if (!savedData) {
        console.warn("Aucune donnée dans localStorage");
        return false;
    }
    
    try {
        const refineries = JSON.parse(savedData);
        if (!Array.isArray(refineries) || refineries.length === 0) {
            console.warn("Données localStorage invalides ou vides");
            return false;
        }
        
        console.log("Données localStorage valides:", refineries.length, "installations");
        return true;
    } catch (e) {
        console.error("Erreur lors de l'analyse des données localStorage:", e);
        return false;
    }
}

// Fonction pour afficher un message de diagnostic/réparation
function showRepairMessage(message) {
    console.log("Message de diagnostic:", message);
    
    // Chercher d'abord une notification existante
    let notification = document.getElementById('table-notification');
    
    // Si elle n'existe pas, créer une nouvelle
    if (!notification) {
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
            notification = document.createElement('div');
            notification.id = 'repair-notification';
            notification.style.padding = '15px';
            notification.style.margin = '20px 0';
            notification.style.backgroundColor = '#f9edbe';
            notification.style.border = '1px solid #f0c36d';
            notification.style.borderRadius = '4px';
            notification.style.fontWeight = 'bold';
            
            tableContainer.parentNode.insertBefore(notification, tableContainer);
        }
    }
    
    if (notification) {
        notification.textContent = message;
        notification.style.display = 'block';
    }
}

// Fonction pour démarrer le bouton de réparation
function createRepairButton() {
    console.log("Création du bouton de réparation d'urgence...");
    
    const container = document.querySelector('.panel .btn-group');
    if (container) {
        const repairButton = document.createElement('button');
        repairButton.textContent = '🔧 Réparer les données';
        repairButton.style.backgroundColor = '#ff9800';
        repairButton.style.fontWeight = 'bold';
        repairButton.onclick = function() {
            // Effacer toutes les données localStorage
            localStorage.removeItem('lithiumRefineries');
            localStorage.removeItem('dashboardVersion');
            localStorage.removeItem('lastDataUpdateTimestamp');
            
            // Forcer le rechargement des données
            forceReloadData();
        };
        
        container.appendChild(repairButton);
        console.log("Bouton de réparation ajouté");
    } else {
        console.warn("Conteneur de boutons non trouvé");
    }
}

// Lancer le diagnostic au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log("Lancement du diagnostic des données...");
    
    // Attendre un peu que les autres scripts se chargent
    setTimeout(function() {
        // Vérifier l'état des données
        const dataOK = checkTableData();
        
        // Créer le bouton de réparation dans tous les cas
        createRepairButton();
        
        // Si les données semblent corrompues, proposer une réparation automatique
        if (!dataOK) {
            showRepairMessage("Problème détecté avec les données. Cliquez sur '🔧 Réparer les données' pour résoudre le problème.");
        }
    }, 1000);
    
    // Exposer la fonction de réparation globalement
    window.forceReloadData = forceReloadData;
});