// Script de correction pour le problème d'effacement des données
document.addEventListener('DOMContentLoaded', function() {
    // Vérifie si le script est chargé sur la page admin
    if (window.location.href.includes('admin.html')) {
        console.log("Script de correction activé");
        
        // Attend que la page soit complètement chargée
        setTimeout(function() {
            // Remplace la fonction saveAllChanges pour éviter l'effacement des données
            if (typeof window.saveAllChanges === 'function') {
                const originalSaveAllChanges = window.saveAllChanges;
                
                window.saveAllChanges = function() {
                    try {
                        // Vérifier si les données sont valides
                        if (!window.allData || !Array.isArray(window.refineries)) {
                            window.showNotification('table-notification', 'Données non valides pour la sauvegarde.', 'error');
                            return;
                        }
                        
                        // Mettre à jour les données
                        window.allData.refineries = window.refineries;
                        
                        // Vérifier si la version est définie
                        if (!window.allData.version) {
                            window.allData.version = new Date().toISOString().slice(0, 10);
                        }
                        
                        // Vérifier si les couleurs de statut sont définies
                        if (!window.allData.status_colors) {
                            window.allData.status_colors = window.STATUS_COLORS || {
                                "Opérationnel": "#00AA00",
                                "En construction": "#0000FF",
                                "Planifié": "#FFA500",
                                "Approuvé": "#FFA500",
                                "En suspens": "#FF0000",
                                "En pause": "#FF0000"
                            };
                        }
                        
                        // Convertir en JSON et télécharger
                        const dataStr = JSON.stringify(window.allData, null, 2);
                        const dataBlob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'refineries.json';
                        link.click();
                        
                        // *** CORRECTION ICI ***
                        // Stocker dans localStorage l'objet COMPLET et pas seulement le tableau
                        localStorage.setItem('lithiumRefineries', JSON.stringify(window.allData));
                        
                        // Signaler le changement
                        if (typeof window.signalChange === 'function') {
                            window.signalChange();
                        }
                        
                        window.showNotification('table-notification', 'Données sauvegardées avec succès! Téléchargement du fichier refineries.json terminé.', 'success');
                    } catch (error) {
                        console.error('Erreur lors de la sauvegarde:', error);
                        window.showNotification('table-notification', `Erreur lors de la sauvegarde: ${error.message}`, 'error');
                    }
                };
                
                console.log("Fonction saveAllChanges remplacée avec succès!");
                
                // Également remplacer saveRefineryChanges pour la même raison
                const originalSaveRefineryChanges = window.saveRefineryChanges;
                
                window.saveRefineryChanges = function(event) {
                    event.preventDefault();
                    
                    // Récupérer les valeurs du formulaire
                    const idValue = document.getElementById('edit-id').value;
                    const name = document.getElementById('edit-name').value;
                    const location = document.getElementById('edit-location').value;
                    const country = document.getElementById('edit-country').value;
                    const coordinatesStr = document.getElementById('edit-coordinates').value;
                    const status = document.getElementById('edit-status').value;
                    const production = document.getElementById('edit-production').value || 'N/A';
                    const processing = document.getElementById('edit-processing').value || 'N/A';
                    const notes = document.getElementById('edit-notes').value;
                    const website = document.getElementById('edit-website').value || '#';
                    
                    // Traiter les coordonnées
                    let coordinates = [0, 0];
                    if (coordinatesStr) {
                        const parts = coordinatesStr.split(',').map(part => parseFloat(part.trim()));
                        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                            coordinates = parts;
                        }
                    }
                    
                    if (idValue) {
                        // Modification d'une installation existante
                        const id = parseInt(idValue);
                        const index = window.refineries.findIndex(r => r.id === id);
                        
                        if (index === -1) {
                            window.showNotification('table-notification', `Installation avec ID ${id} non trouvée.`, 'error');
                            return;
                        }
                        
                        window.refineries[index] = {
                            ...window.refineries[index],
                            name,
                            location,
                            country,
                            coordinates,
                            status,
                            production,
                            processing,
                            notes,
                            website
                        };
                        
                        window.showNotification('table-notification', 'Installation modifiée avec succès.', 'success');
                    } else {
                        // Ajout d'une nouvelle installation
                        const newId = Math.max(0, ...window.refineries.map(r => r.id)) + 1;
                        
                        window.refineries.push({
                            id: newId,
                            name,
                            location,
                            country,
                            coordinates,
                            status,
                            production,
                            processing,
                            notes,
                            website
                        });
                        
                        window.showNotification('table-notification', 'Installation ajoutée avec succès.', 'success');
                    }
                    
                    // Mettre à jour l'affichage
                    window.displayRefineries();
                    
                    // Mettre à jour l'éditeur JSON
                    if (window.allData) {
                        window.allData.refineries = window.refineries;
                        document.getElementById('json-editor').value = JSON.stringify(window.allData, null, 2);
                    }
                    
                    // *** CORRECTION ICI ***
                    // Stocker l'objet complet dans localStorage
                    if (window.allData) {
                        localStorage.setItem('lithiumRefineries', JSON.stringify(window.allData));
                    }
                    
                    // Signaler le changement
                    if (typeof window.signalChange === 'function') {
                        window.signalChange();
                    }
                    
                    // Fermer la modal
                    document.getElementById('edit-modal').style.display = 'none';
                };
                
                console.log("Fonction saveRefineryChanges remplacée avec succès!");
                
                // Également remplacer confirmDelete pour la même raison
                const originalConfirmDelete = window.confirmDelete;
                
                window.confirmDelete = function() {
                    const id = parseInt(document.getElementById('delete-id').value);
                    
                    // Trouver l'index de l'installation à supprimer
                    const index = window.refineries.findIndex(r => r.id === id);
                    if (index === -1) {
                        window.showNotification('table-notification', `Installation avec ID ${id} non trouvée.`, 'error');
                        return;
                    }
                    
                    // Supprimer l'installation
                    window.refineries.splice(index, 1);
                    
                    // Mettre à jour l'affichage
                    window.displayRefineries();
                    
                    // Mettre à jour l'éditeur JSON
                    if (window.allData) {
                        window.allData.refineries = window.refineries;
                        document.getElementById('json-editor').value = JSON.stringify(window.allData, null, 2);
                        
                        // *** CORRECTION ICI ***
                        // Stocker l'objet complet dans localStorage
                        localStorage.setItem('lithiumRefineries', JSON.stringify(window.allData));
                    }
                    
                    // Signaler le changement
                    if (typeof window.signalChange === 'function') {
                        window.signalChange();
                    }
                    
                    // Fermer la modal
                    document.getElementById('delete-modal').style.display = 'none';
                    
                    window.showNotification('table-notification', 'Installation supprimée avec succès.', 'success');
                };
                
                console.log("Fonction confirmDelete remplacée avec succès!");
                
                // Corriger également la fonction applyJsonChanges
                const originalApplyJsonChanges = window.applyJsonChanges;
                
                window.applyJsonChanges = function() {
                    const jsonText = document.getElementById('json-editor').value;
                    
                    try {
                        const data = JSON.parse(jsonText);
                        
                        // Vérifier si le format est correct
                        if (!data.refineries || !Array.isArray(data.refineries)) {
                            throw new Error('Format de données invalide: refineries manquantes ou non valides');
                        }
                        
                        // Mettre à jour les données
                        window.allData = data;
                        window.refineries = data.refineries;
                        
                        // Mettre à jour les informations de version
                        const version = data.version || 'non définie';
                        document.getElementById('tableVersionInfo').textContent = `Version: ${version}`;
                        document.getElementById('editorVersionInfo').textContent = `Version: ${version}`;
                        
                        // Mettre à jour l'affichage
                        window.displayRefineries();
                        
                        // *** CORRECTION ICI ***
                        // Stocker l'objet complet dans localStorage
                        localStorage.setItem('lithiumRefineries', JSON.stringify(window.allData));
                        
                        // Signaler le changement
                        if (typeof window.signalChange === 'function') {
                            window.signalChange();
                        }
                        
                        window.showNotification('editor-notification', 'Modifications appliquées avec succès!', 'success');
                    } catch (error) {
                        console.error('Erreur lors de l\'application des modifications:', error);
                        window.showNotification('editor-notification', `Erreur: ${error.message}`, 'error');
                    }
                };
                
                console.log("Fonction applyJsonChanges remplacée avec succès!");
                
                // Corriger la fonction loadData
                const originalLoadData = window.loadData;
                
                window.loadData = function() {
                    window.showNotification('table-notification', 'Chargement des données...', 'info');
                    
                    return new Promise(async (resolve) => {
                        try {
                            // Ajouter un paramètre pour éviter le cache
                            const response = await fetch('data/refineries.json?t=' + Date.now());
                            if (!response.ok) {
                                throw new Error(`Erreur HTTP: ${response.status}`);
                            }
                            
                            const data = await response.json();
                            console.log('Données chargées:', data);
                            
                            if (!data.refineries || !Array.isArray(data.refineries)) {
                                throw new Error('Format de données invalide: refineries manquantes ou non valides');
                            }
                            
                            // Stocker les données
                            window.allData = data;
                            window.refineries = data.refineries;
                            
                            // Mettre à jour les informations de version
                            document.getElementById('tableVersionInfo').textContent = `Version: ${data.version || 'non définie'}`;
                            document.getElementById('editorVersionInfo').textContent = `Version: ${data.version || 'non définie'}`;
                            
                            // Afficher les données dans le tableau
                            window.displayRefineries();
                            
                            // Charger dans l'éditeur JSON
                            document.getElementById('json-editor').value = JSON.stringify(data, null, 2);
                            
                            // *** CORRECTION ICI ***
                            // Stocker l'objet complet dans localStorage
                            localStorage.setItem('lithiumRefineries', JSON.stringify(window.allData));
                            
                            window.showNotification('table-notification', 'Données chargées avec succès!', 'success');
                            resolve(true);
                        } catch (error) {
                            console.error('Erreur lors du chargement des données:', error);
                            window.showNotification('table-notification', `Erreur: ${error.message}. Essayez d'importer un fichier JSON.`, 'error');
                            
                            // Récupérer les données de localStorage si elles existent
                            try {
                                const savedData = localStorage.getItem('lithiumRefineries');
                                if (savedData) {
                                    const data = JSON.parse(savedData);
                                    if (data.refineries && Array.isArray(data.refineries)) {
                                        window.allData = data;
                                        window.refineries = data.refineries;
                                        
                                        // Mettre à jour les informations de version
                                        document.getElementById('tableVersionInfo').textContent = `Version: ${data.version || 'sauvegarde locale'}`;
                                        document.getElementById('editorVersionInfo').textContent = `Version: ${data.version || 'sauvegarde locale'}`;
                                        
                                        // Afficher les données dans le tableau
                                        window.displayRefineries();
                                        
                                        // Charger dans l'éditeur JSON
                                        document.getElementById('json-editor').value = JSON.stringify(data, null, 2);
                                        
                                        window.showNotification('table-notification', 'Données récupérées depuis la sauvegarde locale!', 'success');
                                        resolve(true);
                                        return;
                                    }
                                }
                            } catch (localError) {
                                console.error('Erreur lors de la récupération des données locales:', localError);
                            }
                            
                            // Si tout échoue, utiliser des données de secours
                            const backupData = {
                                version: "backup-" + new Date().toISOString().slice(0, 10),
                                refineries: [
                                    {
                                        "id": 1,
                                        "name": "Example Refinery",
                                        "location": "Example Location",
                                        "country": "Canada",
                                        "coordinates": [45.5017, -73.5673],
                                        "status": "Opérationnel",
                                        "production": "Example Production",
                                        "processing": "Example Processing",
                                        "notes": "Exemple de données de secours",
                                        "website": "https://example.com"
                                    }
                                ],
                                status_colors: window.STATUS_COLORS || {
                                    "Opérationnel": "#00AA00",
                                    "En construction": "#0000FF",
                                    "Planifié": "#FFA500",
                                    "Approuvé": "#FFA500",
                                    "En suspens": "#FF0000",
                                    "En pause": "#FF0000"
                                }
                            };
                            
                            window.allData = backupData;
                            window.refineries = backupData.refineries;
                            
                            // Afficher les données dans le tableau
                            window.displayRefineries();
                            
                            // Charger dans l'éditeur JSON
                            document.getElementById('json-editor').value = JSON.stringify(backupData, null, 2);
                            
                            window.showNotification('table-notification', 'Données de secours chargées. Importez un fichier JSON valide pour restaurer vos données.', 'warning');
                            resolve(true);
                        }
                    });
                };
                
                console.log("Fonction loadData remplacée avec succès!");
                
                // Remarquable, forcer le rechargement des données pour s'assurer que tout fonctionne
                setTimeout(function() {
                    if (typeof window.loadData === 'function') {
                        window.loadData();
                    }
                }, 1000);
            }
        }, 1000);
    }
});