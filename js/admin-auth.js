// Script simple pour gérer l'authentification admin
// Note: Ce n'est pas une authentification sécurisée, mais une simple démo

// Mot de passe par défaut (à changer pour un usage réel)
const DEFAULT_ADMIN_PASSWORD = 'admin123';

// Fonction pour vérifier si l'utilisateur est déjà authentifié
function isAdminAuthenticated() {
    return localStorage.getItem('lithiumDashboardAdminAuth') === 'true';
}

// Fonction pour authentifier l'utilisateur
function authenticateAdmin(password) {
    if (password === DEFAULT_ADMIN_PASSWORD) {
        localStorage.setItem('lithiumDashboardAdminAuth', 'true');
        return true;
    }
    return false;
}

// Fonction pour déconnecter l'utilisateur
function logoutAdmin() {
    localStorage.removeItem('lithiumDashboardAdminAuth');
}

// Fonction pour ouvrir la fenêtre de connexion
function openAdminLoginModal() {
    // Si déjà authentifié, rediriger directement
    if (isAdminAuthenticated()) {
        window.location.href = 'admin.html';
        return;
    }
    
    // Afficher le modal de connexion
    document.getElementById('admin-login-modal').style.display = 'block';
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminLoginCloseBtn = document.querySelector('#admin-login-modal .modal-close');
    
    // Gestionnaire pour le bouton Admin
    document.getElementById('admin-button').addEventListener('click', function(e) {
        e.preventDefault();
        openAdminLoginModal();
    });
    
    // Gestionnaire pour fermer le modal
    adminLoginCloseBtn.addEventListener('click', function() {
        adminLoginModal.style.display = 'none';
    });
    
    // Gestionnaire pour le formulaire de connexion
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = document.getElementById('admin-password').value;
        
        if (authenticateAdmin(password)) {
            // Rediriger vers la page d'administration
            window.location.href = 'admin.html';
        } else {
            // Afficher un message d'erreur
            document.getElementById('login-error').style.display = 'block';
        }
    });
    
    // Fermer le modal si on clique en dehors
    window.addEventListener('click', function(e) {
        if (e.target === adminLoginModal) {
            adminLoginModal.style.display = 'none';
        }
    });
});