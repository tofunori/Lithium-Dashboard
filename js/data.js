
let refineries = [
  // Usines produisant uniquement de la "black mass"
  {
      id: 1,
      name: "Li-Cycle",
      location: "Kingston, Ontario, Canada",
      country: "Canada",
      coordinates: [44.2312, -76.4860],
      status: "Opérationnel",
      production: "10 000+ tonnes de masse noire par an",
      processing: "Spoke & Hub Technologies - Procédé hydrométallurgique",
      notes: "Produit de la masse noire à partir de batteries lithium-ion usagées, hub aux États-Unis en pause.",
      website: "https://li-cycle.com/"
  },
  {
      id: 2,
      name: "Lithion Technologies",
      location: "Saint-Bruno-de-Montarville, Québec, Canada",
      country: "Canada",
      coordinates: [45.5366, -73.3718],
      status: "Opérationnel",
      production: "10 000-20 000 tonnes de batteries par an",
      processing: "Procédé hydrométallurgique en deux étapes",
      notes: "Produit de la masse noire, usine d’hydrométallurgie pour matériaux avancés prévue pour 2026.",
      website: "https://www.lithiontechnologies.com/"
  },
  {
      id: 3,
      name: "Li-Cycle",
      location: "Gilbert, AZ, États-Unis",
      country: "États-Unis",
      coordinates: [33.3528, -111.7890],
      status: "Opérationnel",
      production: "N/A",
      processing: "Spoke & Hub Technologies - Procédé hydrométallurgique 'Generation 3'",
      notes: "Produit de la masse noire à partir de batteries EV complètes sans démontage.",
      website: "https://li-cycle.com/"
  },
  {
      id: 4,
      name: "Li-Cycle",
      location: "Tuscaloosa, AL, États-Unis",
      country: "États-Unis",
      coordinates: [33.2098, -87.5692],
      status: "Opérationnel",
      production: "N/A",
      processing: "Spoke & Hub Technologies - Procédé hydrométallurgique 'Generation 3'",
      notes: "Produit de la masse noire à partir de batteries EV complètes sans démontage.",
      website: "https://li-cycle.com/"
  },
  {
      id: 5,
      name: "Cirba Solutions",
      location: "Lancaster, OH, États-Unis",
      country: "États-Unis",
      coordinates: [39.7134, -82.5441],
      status: "Opérationnel",
      production: "N/A",
      processing: "Procédé hydrométallurgique",
      notes: "Produit de la masse noire à partir de batteries lithium-ion en fin de vie, envoyée pour traitement avancé.",
      website: "https://www.cirbasolutions.com/"
  },
  {
      id: 6,
      name: "Cirba Solutions",
      location: "Columbia, SC, États-Unis",
      country: "États-Unis",
      coordinates: [34.0007, -81.0348],
      status: "Opérationnel",
      production: "N/A",
      processing: "Procédé hydrométallurgique",
      notes: "Produit de la masse noire, partie d’un réseau de traitement plus large.",
      website: "https://www.cirbasolutions.com/"
  },

  // Usines utilisant pyrométallurgie ou hydrométallurgie
  {
      id: 7,
      name: "Cirba Solutions",
      location: "Trail, Colombie-Britannique, Canada",
      country: "Canada",
      coordinates: [49.0996, -117.7118],
      status: "Opérationnel",
      production: "N/A",
      processing: "Hydrométallurgie",
      notes: "Traite les batteries lithium-ion pour produire des sels de lithium et des 'cakes' de cobalt, récupérant jusqu’à 95 % des métaux critiques.",
      website: "https://www.cirbasolutions.com/"
  },
  {
      id: 8,
      name: "Umicore",
      location: "Loyalist, Ontario, Canada",
      country: "Canada",
      coordinates: [44.2333, -76.9667],
      status: "En pause",
      production: "Capacité prévue pour 1 million de VE par an",
      processing: "Hydrométallurgie",
      notes: "Production de pCAM et CAM prévue, construction en pause depuis novembre 2024.",
      website: "https://www.umicore.ca/en/"
  },
  {
      id: 9,
      name: "Northvolt",
      location: "Saint-Basile-le-Grand, Québec, Canada",
      country: "Canada",
      coordinates: [45.5333, -73.2833],
      status: "En construction",
      production: "60 GWh par an (prévu)",
      processing: "Hydrométallurgie",
      notes: "Prévu pour produire pCAM et CAM à partir de batteries recyclées, opérationnel fin 2026.",
      website: "https://northvolt.com/"
  },
  {
      id: 10,
      name: "EVSX (filiale de St-Georges Eco-Mining)",
      location: "Thorold, Ontario, Canada",
      country: "Canada",
      coordinates: [43.0867, -79.2060],
      status: "En construction",
      production: "N/A",
      processing: "Hydrométallurgie",
      notes: "Focus sur les batteries à haute teneur en nickel, pas encore opérationnelle.",
      website: "https://stgeorgesecomining.com/evsx/"
  },
  {
      id: 11,
      name: "Electra Battery Materials",
      location: "Temiskaming Shores, Ontario, Canada",
      country: "Canada",
      coordinates: [47.5066, -79.6653],
      status: "Planifié",
      production: "N/A",
      processing: "Hydrométallurgie",
      notes: "Focus sur matériaux à base de cobalt des batteries lithium-ion, pas encore en construction.",
      website: "https://electrabmc.com/"
  },
  {
      id: 12,
      name: "Ascend Elements Apex 1",
      location: "Hopkinsville, KY, États-Unis",
      country: "États-Unis",
      coordinates: [36.7887, -87.3857],
      status: "En construction",
      production: "750 000 VE par an (prévu)",
      processing: "Hydro-to-Cathode™",
      notes: "Produit pCAM et CAM à partir de batteries recyclées, démarrage prévu fin 2025.",
      website: "https://ascendelements.com/"
  },
  {
      id: 13,
      name: "Ascend Elements Base 1",
      location: "Covington, GA, États-Unis",
      country: "États-Unis",
      coordinates: [33.5968, -83.8602],
      status: "Opérationnel",
      production: "N/A",
      processing: "Hydro-to-Cathode™",
      notes: "Produit pCAM à partir de batteries recyclées, usine pilote.",
      website: "https://ascendelements.com/"
  },
  {
      id: 14,
      name: "Green Li-ion GLMC 1",
      location: "Atoka, OK, États-Unis",
      country: "États-Unis",
      coordinates: [34.4066, -96.1039],
      status: "Opérationnel",
      production: "600-1 100 tonnes de pCAM par an",
      processing: "GREEN HYDROREJUVENATION™",
      notes: "Première usine en Amérique du Nord à produire pCAM directement à partir de masse noire.",
      website: "https://www.greenli-ion.com/"
  },
  {
      id: 15,
      name: "Redwood Materials",
      location: "Storey County, NV, États-Unis",
      country: "États-Unis",
      coordinates: [39.5442, -119.4310],
      status: "Opérationnel",
      production: "1 million de VE par an (prévu)",
      processing: "Hydrométallurgie",
      notes: "Produit CAM à partir de batteries recyclées, en expansion.",
      website: "https://www.redwoodmaterials.com/"
  },
  {
      id: 16,
      name: "Redwood Materials",
      location: "Ridgeville, SC, États-Unis",
      country: "États-Unis",
      coordinates: [33.1510, -80.2533],
      status: "En construction",
      production: "N/A",
      processing: "Hydrométallurgie",
      notes: "Prévue pour produire CAM, pas encore opérationnelle.",
      website: "https://www.redwoodmaterials.com/"
  },
  {
      id: 17,
      name: "Tesla Gigafactory",
      location: "Sparks, NV, États-Unis",
      country: "États-Unis",
      coordinates: [39.5380, -119.4430],
      status: "Opérationnel",
      production: "N/A",
      processing: "Hydrométallurgie (procédé interne)",
      notes: "Recyclage interne de batteries usagées et rebuts, récupération de 92 % des matériaux.",
      website: "https://www.tesla.com/gigafactory"
  },
  {
      id: 18,
      name: "American Battery Technology",
      location: "Reno, NV, États-Unis",
      country: "États-Unis",
      coordinates: [39.5296, -119.8138],
      status: "En construction",
      production: "N/A",
      processing: "Hydrométallurgie",
      notes: "Prévue pour traiter les batteries lithium-ion, pas encore opérationnelle.",
      website: "https://americanbatterytechnology.com/"
  },
  {
      id: 19,
      name: "Li-Cycle",
      location: "Rochester, NY, États-Unis",
      country: "États-Unis",
      coordinates: [43.1566, -77.6088],
      status: "En pause",
      production: "N/A",
      processing: "Spoke & Hub Technologies - Procédé hydrométallurgique",
      notes: "Prévu pour produire des matériaux comme le carbonate de lithium, en pause depuis octobre 2023.",
      website: "https://li-cycle.com/"
  }
];

// Couleurs pour les statuts
const STATUS_COLORS = {
  'Opérationnel': '#00AA00',  // Vert
  'En construction': '#0000FF',  // Bleu
  'Planifié': '#FFA500',  // Orange
  'Approuvé': '#FFA500',  // Orange
  'En suspens': '#FF0000',  // Rouge
  'En pause': '#FF0000'  // Rouge
};

// Couleurs pour les graphiques
const CHART_COLORS = ['#4a6bff', '#ff7043', '#ffca28', '#66bb6a', '#ab47bc'];

// API URL - peut être remplacée par une vraie API
const API_URL = 'https://my-json-server.typicode.com/tofunori/battery-recycling-dashboard';

// Fonction pour charger les données
async function loadData() {
  const savedData = localStorage.getItem('lithiumRefineries');
  if (savedData) {
      try {
          refineries = JSON.parse(savedData);
          return;
      } catch (e) {
          console.error('Erreur lors du chargement des données locales:', e);
      }
  }
  
  try {
      // Simulation de chargement depuis une API (commentée)
      /*
      const response = await fetch(`${API_URL}/refineries`);
      if (response.ok) {
          refineries = await response.json();
          localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
      }
      */
      localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
  } catch (e) {
      console.error('Erreur lors du chargement des données depuis l\'API:', e);
  }
}

// Fonction pour sauvegarder les données
async function saveData() {
  localStorage.setItem('lithiumRefineries', JSON.stringify(refineries));
  
  // Simulation de sauvegarde vers une API (commentée)
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

// Fonction pour mettre à jour l’affichage
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

// Génération d’un lien de partage avec les filtres appliqués
function generateShareLink() {
  const url = new URL(window.location.href);
  url.searchParams.set('country', document.getElementById('country-filter').value);
  url.searchParams.set('status', document.getElementById('status-filter').value);
  url.searchParams.set('capacity', document.getElementById('capacity-filter').value);
  return url.toString();
}

// Appliquer les filtres de l’URL
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

// Initialisation de l’application
document.addEventListener('DOMContentLoaded', () => {
  loadData().then(() => {
      applyUrlFilters();
      updateDisplay();

      // Ajouter des écouteurs d’événements pour les filtres
      document.getElementById('country-filter').addEventListener('change', updateDisplay);
      document.getElementById('status-filter').addEventListener('change', updateDisplay);
      document.getElementById('capacity-filter').addEventListener('input', () => {
          document.getElementById('capacity-value').textContent = document.getElementById('capacity-filter').value;
          updateDisplay();
      });
      document.getElementById('export-btn').addEventListener('click', exportJSON);
      document.getElementById('share-btn').addEventListener('click', () => {
          const link = generateShareLink();
          navigator.clipboard.writeText(link).then(() => alert('Lien copié dans le presse-papiers !'));
      });
  });
});