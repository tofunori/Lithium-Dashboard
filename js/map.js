// Variable pour la carte et les marqueurs
let map;
let markers = [];

// Initialiser la carte Leaflet
function initMap() {
    // Créer la carte centrée sur l'Amérique du Nord
    map = L.map('map').setView([40, -100], 3);
    
    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// Mettre à jour les marqueurs sur la carte
function updateMapMarkers(filteredRefineries) {
    // Supprimer tous les marqueurs existants
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Ajouter les nouveaux marqueurs
    filteredRefineries.forEach(refinery => {
        // Déterminer la couleur du marqueur selon le statut
        const markerColor = STATUS_COLORS[refinery.status] || '#808080';
        
        // Créer une icône personnalisée
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="width: 20px; height: 20px; background-color: ${markerColor}; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -15]
        });
        
        // Créer le marqueur
        const marker = L.marker(refinery.coordinates, { icon: customIcon })
            .addTo(map);
        
        // Ajouter une popup avec les informations de l'installation
        marker.bindPopup(`
            <div style="min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px;">${refinery.name}</h3>
                <p style="margin: 4px 0;"><strong>Emplacement:</strong> ${refinery.location}</p>
                <p style="margin: 4px 0;"><strong>Statut:</strong> ${refinery.status}</p>
                <p style="margin: 4px 0;"><strong>Capacité:</strong> ${refinery.production} tpa</p>
                <p style="margin: 4px 0;"><strong>Technologie:</strong> ${refinery.processing}</p>
                <p style="margin: 4px 0;"><strong>Notes:</strong> ${refinery.notes}</p>
                <p style="margin: 8px 0 0 0;">
                    <a href="${refinery.website}" target="_blank" style="color: #4a6bff; text-decoration: none;">
                        Site web
                    </a>
                </p>
            </div>
        `);
        
        // Ajouter un gestionnaire d'événements pour le clic
        marker.on('click', () => {
            showRefineryDetails(refinery);
        });
        
        // Ajouter le marqueur à la liste
        markers.push(marker);
    });
}

// Fonction pour centrer la carte sur une installation spécifique
function focusOnRefinery(refinery) {
    // Centrer la carte sur la fonderie avec un léger zoom
    map.setView(refinery.coordinates, 6);
    
    // Trouver et ouvrir la popup du marqueur correspondant
    markers.forEach(marker => {
        if (marker.getLatLng().lat === refinery.coordinates[0] && 
            marker.getLatLng().lng === refinery.coordinates[1]) {
            marker.openPopup();
        }
    });
}