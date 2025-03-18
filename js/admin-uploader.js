// Fonction pour uploader un fichier vers GitHub
async function uploadToGitHub(token, content, message) {
    // Configuration du dépôt
    const owner = 'tofunori';
    const repo = 'Lithium-Dashboard';
    const path = 'data/refineries.json';
    const branch = 'main';
    
    try {
        // Récupérer le SHA du fichier existant (nécessaire pour la mise à jour)
        const fileSha = await getFileSha(token, owner, repo, path, branch);
        
        // API GitHub pour mettre à jour le fichier
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        
        const payload = {
            message: message,
            content: btoa(content), // Encoder en base64
            sha: fileSha,
            branch: branch
        };
        
        // Faire la requête PUT pour mettre à jour le fichier
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github+json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erreur GitHub: ${response.status} - ${errorData.message}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de l\'upload vers GitHub:', error);
        throw error;
    }
}

// Récupérer le SHA d'un fichier sur GitHub
async function getFileSha(token, owner, repo, path, branch) {
    try {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github+json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                // Le fichier n'existe pas encore
                return null;
            }
            
            const errorData = await response.json();
            throw new Error(`Erreur GitHub: ${response.status} - ${errorData.message}`);
        }
        
        const data = await response.json();
        return data.sha;
    } catch (error) {
        console.error('Erreur lors de la récupération du SHA:', error);
        throw error;
    }
}

// Initialiser les événements pour GitHub upload
document.addEventListener('DOMContentLoaded', function() {
    // Modal GitHub upload
    const githubUploadBtn = document.getElementById('github-upload');
    if (githubUploadBtn) {
        githubUploadBtn.addEventListener('click', async function() {
            const token = document.getElementById('github-token').value.trim();
            const message = document.getElementById('github-message').value.trim() || 'Mise à jour des données d\'installations';
            
            if (!token) {
                alert('Veuillez entrer un token GitHub valide');
                return;
            }
            
            // Récupérer les données
            let content;
            
            // Si nous sommes dans l'onglet tableau
            if (document.querySelector('.tab[data-tab="table"]').classList.contains('active')) {
                if (!refineryData) {
                    alert('Aucune donnée à uploader. Veuillez charger les données d\'abord.');
                    return;
                }
                
                // Mettre à jour les données avec les modifications locales
                refineryData.refineries = refineries;
                content = JSON.stringify(refineryData, null, 2);
            } 
            // Si nous sommes dans l'onglet éditeur JSON
            else if (document.querySelector('.tab[data-tab="editor"]').classList.contains('active')) {
                const jsonEditor = document.getElementById('jsonEditor');
                
                if (!jsonEditor.value) {
                    alert('Aucune donnée dans l\'éditeur JSON. Veuillez charger les données d\'abord.');
                    return;
                }
                
                try {
                    // Vérifier que c'est un JSON valide
                    JSON.parse(jsonEditor.value);
                    content = jsonEditor.value;
                } catch (error) {
                    alert(`JSON invalide: ${error.message}`);
                    return;
                }
            } else {
                alert('Fonctionnalité disponible uniquement dans les onglets "Tableau" et "Éditeur JSON"');
                return;
            }
            
            // Confirmer l'upload
            if (!confirm('Êtes-vous sûr de vouloir uploader ces données vers GitHub?')) {
                return;
            }
            
            try {
                // Afficher un indicateur de chargement
                const originalText = githubUploadBtn.textContent;
                githubUploadBtn.textContent = 'Upload en cours...';
                githubUploadBtn.disabled = true;
                
                // Effectuer l'upload
                const result = await uploadToGitHub(token, content, message);
                
                // Réinitialiser le bouton
                githubUploadBtn.textContent = originalText;
                githubUploadBtn.disabled = false;
                
                // Fermer la modal
                document.getElementById('github-modal').style.display = 'none';
                
                // Montrer un succès
                alert(`Upload réussi! Commit: ${result.commit.sha.substring(0, 7)}`);
                
                // Effacer le token pour des raisons de sécurité
                document.getElementById('github-token').value = '';
            } catch (error) {
                // Réinitialiser le bouton
                githubUploadBtn.textContent = originalText;
                githubUploadBtn.disabled = false;
                
                // Afficher l'erreur
                alert(`Erreur lors de l'upload: ${error.message}`);
            }
        });
    }
});