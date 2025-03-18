// Données des installations de recyclage de batteries
let refineries = [
    // USA/Mexique
    {
        id: 1,
        name: "Li-Cycle",
        location: "Rochester, NY, États-Unis",
        country: "États-Unis",
        coordinates: [43.1566, -77.6088],
        status: "Opérationnel", 
        production: "Variable", 
        processing: "Spoke & Hub Technologies - Procédé hydrométallurgique",
        notes: "Traite toutes les chimies de batteries lithium-ion, tous formats, y compris batteries EV complètes.",
        website: "https://li-cycle.com/"
    },
    {
        id: 2,
        name: "Li-Cycle",
        location: "Gilbert, AZ, États-Unis",
        country: "États-Unis",
        coordinates: [33.3528, -111.7890],
        status: "Opérationnel",
        production: "N/A",
        processing: "Spoke & Hub Technologies - Procédé hydrométallurgique 'Generation 3'",
        notes: "Traite les batteries EV complètes sans besoin de démontage.",
        website: "https://li-cycle.com/"
    },
    {
        id: 3,
        name: "Li-Cycle",
        location: "Tuscaloosa, AL, États-Unis",
        country: "États-Unis",
        coordinates: [33.2098, -87.5692],
        status: "Opérationnel",
        production: "N/A",
        processing: "Spoke & Hub Technologies - Procédé hydrométallurgique 'Generation 3'",
        notes: "Traite les batteries EV complètes sans besoin de démontage.",
        website: "https://li-cycle.com/"
    },
    {
        id: 4,
        name: "Ascend Elements",
        location: "Westborough, MA, États-Unis",
        country: "États-Unis",
        coordinates: [42.2751901, -71.5713879],
        status: "Opérationnel",
        production: "N/A",
        processing: "Hydro-to-Cathode® - Direct precursor synthesis",
        notes: "Traite les batteries lithium-ion en fin de vie et déchets de fabrication.",
        website: "https://ascendelements.com/"
    },
    {
        id: 5,
        name: "Cirba Solutions",
        location: "Lancaster, OH, États-Unis",
        country: "États-Unis",
        coordinates: [39.7133978, -82.5440893],
        status: "Opérationnel",
        production: "N/A",
        processing: "Procédé hydrométallurgique",
        notes: "Traite les batteries lithium-ion en fin de vie.",
        website: "https://cirba.solutions/"
    },
    {
        id: 6,
        name: "Redwood Materials",
        location: "Carson City, NV, États-Unis",
        country: "États-Unis",
        coordinates: [39.1638, -119.7674],
        status: "Opérationnel",
        production: "10000",
        processing: "Procédé hydrométallurgique",
        notes: "Focus sur matériaux de cathode des batteries lithium-ion.",
        website: "https://www.redwoodmaterials.com/"
    },
    {
        id: 7,
        name: "American Battery Technology",
        location: "Reno, NV, États-Unis",
        country: "États-Unis",
        coordinates: [39.5296, -119.8138],
        status: "En construction",
        production: "N/A",
        processing: "Procédé hydrométallurgique",
        notes: "Traite les batteries lithium-ion.",
        website: "https://americanbatterytechnology.com/"
    },
    {
        id: 8,
        name: "FORTECH",
        location: "Sinaloa, Mexique",
        country: "Mexique",
        coordinates: [25.0000, -107.5000],
        status: "Opérationnel",
        production: "1000",
        processing: "N/A",
        notes: "Traite les batteries lithium-ion.",
        website: "N/A"
    },
    
    // Canada
    {
        id: 9,
        name: "Li-Cycle",
        location: "Kingston, Ontario, Canada",
        country: "Canada",
        coordinates: [44.2539252, -76.4906979],
        status: "Opérationnel",
        production: "5000",
        processing: "Spoke & Hub Technologies - Procédé hydrométallurgique",
        notes: "Traite toutes les chimies de batteries lithium-ion, tous formats, y compris batteries EV complètes.",
        website: "https://li-cycle.com/"
    },
    {
        id: 10,
        name: "Lithion Technologies",
        location: "Saint-Bruno-de-Montarville, Québec, Canada",
        country: "Canada",
        coordinates: [45.5366097, -73.371802],
        status: "Opérationnel",
        production: "2300",
        processing: "Procédé hydrométallurgique en deux étapes",
        notes: "Extraction puis hydrométallurgie. Traite toutes les batteries lithium-ion, y compris batteries EV complètes.",
        website: "https://www.lithiontechnologies.com/"
    },
    {
        id: 11,
        name: "EVSX (filiale de St-Georges Eco-Mining)",
        location: "Thorold, Ontario, Canada",
        country: "Canada",
        coordinates: [43.0866844, -79.2060193],
        status: "En construction",
        production: "N/A",
        processing: "Procédé hydrométallurgique",
        notes: "Traite les batteries lithium-ion avec focus sur chimies à haute teneur en nickel.",
        website: "https://stgeorgesecomining.com/evsx/"
    },
    {
        id: 12,
        name: "Electra Battery Materials",
        location: "Temiskaming Shores, Ontario, Canada",
        country: "Canada",
        coordinates: [47.5066, -79.6653],
        status: "Planifié",
        production: "N/A",
        processing: "Procédé hydrométallurgique",
        notes: "Focus sur matériaux à base de cobalt des batteries lithium-ion.",
        website: "https://electrabmc.com/"
    },
    {
        id: 13,
        name: "KC Recycling",
        location: "Trail, Colombie-Britannique, Canada",
        country: "Canada",
        coordinates: [49.0966, -117.7117],
        status: "Opérationnel",
        production: "N/A",
        processing: "Hydrométallurgie",
        notes: "Principalement batteries plomb-acide, expansion vers lithium-ion.",
        website: "https://kc-recycling.com/"
    }
];

// Couleurs pour les statuts
const STATUS_COLORS = {
    'Opérationnel': '#00AA00',  // Vert
    'En construction': '#0000FF',  // Bleu
    'Planifié': '#FFA500',  // Orange
    'Approuvé': '#FFA500',  // Orange
    'En suspens': '#FF0000',  // Rouge
};

// Couleurs pour les graphiques
const CHART_COLORS = ['#4a6bff', '#ff7043', '#ffca28', '#66bb6a', '#ab47bc'];

// API URL - peut être remplacée par une vraie API
const API_URL = 'https://my-json-server.typicode.com/tofunori/battery-recycling-dashboard';

// Fonction pour charger les données
async function loadData() {
    // Essayer de charger depuis le stockage local d'abord
    const savedData = localStorage.getItem('lithiumRefineries');
    if (savedData) {
        try {
            refineries = JSON.parse(savedData);
            return;
        } catch (e) {
            console.error('Erreur lors du chargement des données locales:', e);
        }
    }
    
    // Sinon, on peut essayer de charger depuis une API (simulée ici)
    try {
        /*
        const response = await fetch(`${API_URL}/refineries`);
        if (response.ok) {
            refineries = await response.json();
            localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
        }
        */
        
        // Si on n'a pas d'API, on utilise les données par défaut
        localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
    } catch (e) {
        console.error('Erreur lors du chargement des données depuis l\'API:', e);
    }
}

// Fonction pour sauvegarder les données
async function saveData() {
    // Sauvegarde locale
    localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
    
    // Sauvegarde API (simulée)
    /*
    try {
        const response = await fetch(`${API_URL}/refineries`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(refineries)
        });
        
        if (!response.ok) {
            console.error('Erreur lors de la sauvegarde des données:', await response.text());
        }
    } catch (e) {
        console.error('Erreur lors de la connexion à l\'API:', e);
    }
    */
}

// Fonction pour filtrer les installations
function filterRefineries() {
    const country = document.getElementById('country-filter').value;
    const status = document.getElementById('status-filter').value;
    const minCapacity = parseInt(document.getElementById('capacity-filter').value) || 0;
    
    return refineries.filter(refinery => {
        // Filtre par pays
        if (country !== 'all' && refinery.country !== country) {
            return false;
        }
        
        // Filtre par statut
        if (status !== 'all' && refinery.status !== status) {
            return false;
        }
        
        // Filtre par capacité
        if (minCapacity > 0) {
            const capacity = refinery.production !== 'N/A' && refinery.production !== 'Variable' 
                ? parseInt(refinery.production.replace(/,/g, '')) || 0 
                : 0;
            if (capacity < minCapacity) {
                return false;
            }
        }
        
        return true;
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