// Gestion de l'authentification
const AUTH_KEY = 'lithium_dashboard_auth';
const DEFAULT_CREDENTIALS = {
    username: 'admin',
    password: 'lithium2025'
};

// Vérifie si l'utilisateur est connecté
function isLoggedIn() {
    return localStorage.getItem(AUTH_KEY) === 'true';
}

// Connecte l'utilisateur
function login(username, password) {
    if (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password) {
        localStorage.setItem(AUTH_KEY, 'true');
        return true;
    }
    return false;
}

// Déconnecte l'utilisateur
function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
}

// Protège une page admin
function protectAdminPage() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html?access=denied';
    }
}

// Initialise le formulaire de connexion
function initLoginForm() {
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const adminBtn = document.getElementById('admin-btn');
    const loginMessage = document.getElementById('login-message');
    
    // Afficher le bouton admin s'il existe
    if (adminBtn) {
        adminBtn.style.display = isLoggedIn() ? 'block' : 'block';
        
        adminBtn.addEventListener('click', (e) => {
            if (isLoggedIn()) {
                // Rediriger vers la page admin si connecté
                window.location.href = 'admin.html';
            } else {
                // Afficher le formulaire de connexion
                e.preventDefault();
                loginModal.style.display = 'block';
            }
        });
    }
    
    // Gérer la soumission du formulaire
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            if (login(username, password)) {
                loginMessage.textContent = 'Connexion réussie';
                loginMessage.style.color = 'green';
                // Rediriger vers admin après un court délai
                setTimeout(() => {
                    loginModal.style.display = 'none';
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                loginMessage.textContent = 'Identifiants incorrects';
                loginMessage.style.color = 'red';
            }
        });
    }
    
    // Fermer le modal lorsque l'utilisateur clique sur la croix ou à l'extérieur
    const closeButtons = document.querySelectorAll('.login-modal-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    // Vérifier si on vient d'être redirigé depuis la page admin
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('access') === 'denied') {
        loginModal.style.display = 'block';
        loginMessage.textContent = 'Veuillez vous connecter pour accéder à la page d\'administration';
        loginMessage.style.color = 'orange';
    }
}

// Initialiser dès que le DOM est chargé
document.addEventListener('DOMContentLoaded', initLoginForm);
