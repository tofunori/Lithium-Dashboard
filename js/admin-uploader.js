/**
 * Script pour uploader facilement les données vers GitHub
 * 
 * Note: Nécessite une configuration GitHub OAuth token pour fonctionner
 * Vous devrez créer un token GitHub personnel avec les droits 'repo' pour l'utiliser
 * 
 * Ce script est simplifié et doit être utilisé avec précaution.
 * Dans un environnement de production, utilisez une approche plus sécurisée.
 */

class GitHubUploader {
    constructor() {
        this.owner = 'tofunori'; // Remplacer par votre nom d'utilisateur GitHub
        this.repo = 'Lithium-Dashboard'; // Remplacer par le nom de votre dépôt
        this.path = 'data/refineries.json'; // Chemin du fichier à mettre à jour
        this.branch = 'main'; // Branche à mettre à jour
        
        this.token = null; // Le token sera demandé lors de l'upload
        this.currentSha = null; // SHA du fichier existant (nécessaire pour le mettre à jour)
    }
    
    // Configuration de l'uploader
    async setup(token) {
        this.token = token;
        
        // Récupérer le SHA du fichier existant
        try {
            const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.path}?ref=${this.branch}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.currentSha = data.sha;
            return true;
        } catch (error) {
            console.error('Erreur lors de la récupération du SHA:', error);
            return false;
        }
    }
    
    // Mettre à jour le fichier sur GitHub
    async updateFile(content, commitMessage) {
        if (!this.token || !this.currentSha) {
            return { success: false, message: 'Configuration incomplète. Veuillez configurer le token et récupérer le SHA.' };
        }
        
        try {
            const payload = {
                message: commitMessage,
                content: btoa(unescape(encodeURIComponent(content))), // Encoder en base64
                sha: this.currentSha,
                branch: this.branch
            };
            
            const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API error: ${errorData.message}`);
            }
            
            const data = await response.json();
            this.currentSha = data.content.sha; // Mettre à jour le SHA pour les futures mises à jour
            
            return { 
                success: true, 
                message: 'Fichier mis à jour avec succès!',
                commitUrl: data.commit.html_url
            };
        } catch (error) {
            return { 
                success: false, 
                message: `Erreur lors de la mise à jour: ${error.message}`
            };
        }
    }
}

// Initialiser l'uploader une fois que le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Créer l'uploader
    const uploader = new GitHubUploader();
    
    // Ajouter un bouton d'upload à la page d'administration
    const btnGroup = document.querySelector('.btn-group');
    if (btnGroup) {
        const uploadButton = document.createElement('button');
        uploadButton.textContent = 'Uploader vers GitHub';
        uploadButton.classList.add('github-upload');
        uploadButton.style.backgroundColor = '#6e5494'; // Couleur GitHub
        
        btnGroup.appendChild(uploadButton);
        
        // Ajouter un gestionnaire d'événements pour l'upload
        uploadButton.addEventListener('click', async function() {
            const notification = document.getElementById('notification');
            
            // Vérifier si les données JSON sont valides
            try {
                const jsonEditor = document.getElementById('jsonEditor');
                const jsonData = JSON.parse(jsonEditor.value);
                
                // Demander un token GitHub
                const token = prompt("Veuillez entrer votre token GitHub avec accès repo. Ce token n'est pas sauvegardé.");
                if (!token) {
                    notification.textContent = 'Token GitHub requis pour l\'upload.';
                    notification.className = 'notification error';
                    notification.style.display = 'block';
                    return;
                }
                
                // Configuration
                const setupSuccess = await uploader.setup(token);
                if (!setupSuccess) {
                    notification.textContent = 'Erreur lors de la configuration de l\'uploader GitHub.';
                    notification.className = 'notification error';
                    notification.style.display = 'block';
                    return;
                }
                
                // Message de commit
                const commitMessage = prompt("Message de commit:", `Mise à jour des données (version ${jsonData.version})`);
                if (!commitMessage) {
                    notification.textContent = 'Message de commit requis.';
                    notification.className = 'notification error';
                    notification.style.display = 'block';
                    return;
                }
                
                // Uploader le fichier
                notification.textContent = 'Upload en cours...';
                notification.className = 'notification';
                notification.style.display = 'block';
                
                const result = await uploader.updateFile(jsonEditor.value, commitMessage);
                
                if (result.success) {
                    notification.textContent = `${result.message} Voir le commit: ${result.commitUrl}`;
                    notification.className = 'notification success';
                    
                    // Ajouter un lien vers le commit
                    const link = document.createElement('a');
                    link.href = result.commitUrl;
                    link.textContent = 'Voir le commit sur GitHub';
                    link.target = '_blank';
                    link.style.marginLeft = '10px';
                    notification.appendChild(document.createElement('br'));
                    notification.appendChild(link);
                } else {
                    notification.textContent = result.message;
                    notification.className = 'notification error';
                }
                
                notification.style.display = 'block';
            } catch (error) {
                notification.textContent = `Erreur: ${error.message}. Veuillez valider le JSON d'abord.`;
                notification.className = 'notification error';
                notification.style.display = 'block';
            }
        });
    }
});