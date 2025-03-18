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
    
    // Ici, vous pourriez ajouter une fonctionnalité pour sauvegarder les données sur le serveur
    // Par exemple, via une API ou un service comme Firebase
}

// Configurer la vérification périodique des mises à jour
function setupDataSyncCheck() {
    // Vérifier toutes les 2 secondes s'il y a des mises à jour
    setInterval(checkForDataUpdates, 2000);
}

// Vérifier s'il y a des mises à jour de données
function checkForDataUpdates() {
    try {
        // Vérifier le timestamp de la dernière mise à jour dans localStorage
        const storedTimestamp = parseInt(localStorage.getItem('lastDataUpdateTimestamp') || '0');
        
        // Si le timestamp stocké est plus récent que notre dernier timestamp connu
        if (storedTimestamp > lastDataUpdateTimestamp) {
            console.log('Nouvelles données détectées! Mise à jour du dashboard...');
            
            // Charger les données mises à jour
            const savedData = localStorage.getItem('lithiumRefineries');
            if (savedData) {
                refineries = JSON.parse(savedData);
                lastDataUpdateTimestamp = storedTimestamp;
                
                // Mettre à jour le dashboard
                if (typeof updateDashboard === 'function') {
                    updateDashboard();
                }
            }
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